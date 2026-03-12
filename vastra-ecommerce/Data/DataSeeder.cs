using EcommerceApplication.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EcommerceApplication.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<AppDbContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // DESTRUCTIVE: Clear the database - REMOVED
            // await context.Database.EnsureDeletedAsync();
            await context.Database.EnsureCreatedAsync(); // Ensure DB exists
            Console.WriteLine("DEBUG: Database Ensured.");

            await RoleSeeder.SeedRolesAndAdminAsync(serviceProvider);
            Console.WriteLine("DEBUG: Roles Seeded.");

            await SeedCategoriesAsync(context);
            Console.WriteLine("DEBUG: Categories Seeded.");

            await SeedProductsFromJsonAsync(context);
            Console.WriteLine("DEBUG: Products Seeded.");

            await SeedCouponsAsync(context);
            await SeedDemoCustomerAsync(userManager, context);
            Console.WriteLine("DEBUG: Seeding Complete.");
        }

        private static async Task SeedCategoriesAsync(AppDbContext context)
        {
            if (await context.Categories.AnyAsync())
            {
                Console.WriteLine("DEBUG: Categories already exist. Skipping.");
                return;
            }

            var categories = new List<Category>
            {
                new Category { Name = "Men", Description = "Traditional and contemporary clothing for men", ImageUrl = "/images/products/Kurta Sets/Kurta Sets - 1.png" },
                new Category { Name = "Women", Description = "Elegant and authentic ethnic wear for women", ImageUrl = "/images/products/Sarees/Sarees - 1.png" },
                new Category { Name = "Kids", Description = "Cute and comfortable ethnic wear for children", ImageUrl = "/images/products/Boys Ethnic/Boys Ethnic - 1.png" }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            var menCat = await context.Categories.FirstAsync(c => c.Name == "Men");
            var womenCat = await context.Categories.FirstAsync(c => c.Name == "Women");
            var kidsCat = await context.Categories.FirstAsync(c => c.Name == "Kids");

            var subCategories = new List<Category>
            {
                // Men
                new Category { Name = "Men Kurtas", ParentCategoryId = menCat.Id, Description = "Traditional and festive kurtas for men", ImageUrl = "/images/products/Men Kurtas/Men Kurtas - 1.png" },
                new Category { Name = "Sherwanis", ParentCategoryId = menCat.Id, Description = "Royal sherwanis for weddings", ImageUrl = "/images/products/Sherwanis/Sherwanis - 1.png" },
                new Category { Name = "Nehru Jackets", ParentCategoryId = menCat.Id, Description = "Classic Nehru jackets", ImageUrl = "/images/products/Nehru Jackets/Nehru Jackets - 1.png" },

                // Women
                new Category { Name = "Anarkalis", ParentCategoryId = womenCat.Id, Description = "Flowy Anarkali suits", ImageUrl = "/images/products/Anarkali/Anarkali - 1.png" },
                new Category { Name = "Lehengas", ParentCategoryId = womenCat.Id, Description = "Designer lehengas for festive occasions", ImageUrl = "/images/products/Lehengas/Lehengas - 1.png" },
                new Category { Name = "Kurtis", ParentCategoryId = womenCat.Id, Description = "Casual and festive kurtis", ImageUrl = "/images/products/Kurtis/Kurtis - 1.png" },
                new Category { Name = "Kurta Sets", ParentCategoryId = womenCat.Id, Description = "Stylish kurta sets for women", ImageUrl = "/images/products/Kurta Sets/Kurta Sets - 2.png" },
                new Category { Name = "Sarees", ParentCategoryId = womenCat.Id, Description = "Traditional silk and cotton sarees", ImageUrl = "/images/products/Sarees/Sarees - 2.png" },

                // Kids
                new Category { Name = "Boys Ethnic", ParentCategoryId = kidsCat.Id, Description = "Kurta pajamas and sherwanis for boys", ImageUrl = "/images/products/Boys Ethnic/Boys Ethnic - 2.png" },
                new Category { Name = "Girls Ethnic", ParentCategoryId = kidsCat.Id, Description = "Lehengas and frocks for girls", ImageUrl = "/images/products/Girls Ethnic/Girls Ethnic - 1.png" }
            };

            await context.Categories.AddRangeAsync(subCategories);
            await context.SaveChangesAsync();
        }

        private static async Task SeedProductsFromJsonAsync(AppDbContext context)
        {
            if (await context.Products.AnyAsync())
            {
                Console.WriteLine("DEBUG: Products already exist. Skipping.");
                return;
            }

            string jsonPath = "products_seed.json";
            if (!File.Exists(jsonPath))
            {
                Console.WriteLine($"WARNING: {jsonPath} not found. Skipping product seeding.");
                return;
            }

            var jsonContent = await File.ReadAllTextAsync(jsonPath);
            var productsData = JsonSerializer.Deserialize<List<JsonProduct>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (productsData == null) return;

            var random = new Random();
            long cacheBustTicks = DateTime.Now.Ticks;

            foreach (var pData in productsData)
            {
                // Match category by name
                var categoryName = pData.CategoryNameFromMarkdown;
                
                // Fallback mapping if name differs slightly or wasn't captured
                if (string.IsNullOrEmpty(categoryName))
                {
                    // Attempt to guess or skip
                    Console.WriteLine($"Skipping product {pData.Name} due to missing category.");
                    continue;
                }

                // Normalization for specific known hiccups if any, though the script should be accurate.
                // In DB we created "Men Kurtas", script extracted "Men Kurtas". Matches.
                
                var category = await context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName);
                if (category == null)
                {
                    Console.WriteLine($"WARNING: Category '{categoryName}' not found in DB for product '{pData.Name}'.");
                    continue;
                }

                var product = new Product
                {
                    Name = pData.Name,
                    Description = pData.Description,
                    BasePrice = pData.BasePrice,
                    CategoryId = category.Id,
                    IsActive = pData.IsActive,
                    CreatedDate = DateTime.UtcNow
                };

                context.Products.Add(product);
                await context.SaveChangesAsync();

                // Variants
                if (pData.Variants != null)
                {
                    foreach (var v in pData.Variants)
                    {
                        context.ProductVariants.Add(new ProductVariant
                        {
                            ProductId = product.Id,
                            Size = v.Size,
                            Color = v.Color,
                            StockQuantity = v.StockQuantity,
                            PriceAdjustment = v.PriceAdjustment,
                            SKU = v.Sku,
                            Material = "Standard" // Default as not in JSON
                        });
                    }
                }

                // Images
                if (pData.ImageUrls != null)
                {
                    bool isFirst = true;
                    foreach (var url in pData.ImageUrls)
                    {
                        // FIX: Cache Busting
                        string versionedUrl = $"{url}?v={cacheBustTicks}";
                        
                        context.ProductImages.Add(new ProductImage
                        {
                            ProductId = product.Id,
                            ImageUrl = versionedUrl,
                            IsMainImage = isFirst
                        });
                        isFirst = false;
                    }
                }

                // Add fake reviews for better UI populated feel
                if (random.NextDouble() > 0.3)
                {
                     // Get a valid user for reviews (Admin should exist by now)
                     var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@vastra.com");
                     if (adminUser != null)
                     {
                         int reviewCount = random.Next(1, 4);
                         for (int r = 0; r < reviewCount; r++)
                         {
                             context.Reviews.Add(new Review
                             {
                                 ProductId = product.Id,
                                 Rating = random.Next(4, 6),
                                 Comment = GetRandomReviewText(),
                                 Date = DateTime.UtcNow.AddDays(-random.Next(1, 60)),
                                 UserId = adminUser.Id 
                             });
                        }
                     }
                }
            }
            await context.SaveChangesAsync();
        }

        private static string GetRandomReviewText()
        {
             var reviews = new[]
            {
                "Absolutely loved the fabric quality! Fits perfectly.",
                "Great design, looks exactly like the picture. Fast delivery.",
                "Good value for money. The embroidery is very detailed.",
                "Comfortable and stylish. Wore it to a wedding and got many compliments.",
                "Slightly expensive but worth the premium feel.",
                "Color is a bit different from the image, but still nice.",
                "Perfect fit for festive season. Highly recommended!"
            };
            return reviews[new Random().Next(reviews.Length)];
        }

        private static async Task SeedCouponsAsync(AppDbContext context)
        {
            if (await context.Coupons.AnyAsync())
            {
                Console.WriteLine("DEBUG: Coupons already exist. Skipping.");
                return;
            }

            context.Coupons.AddRange(
                new Coupon { Code = "WELCOME10", DiscountPercentage = 10, ExpirationDate = DateTime.UtcNow.AddMonths(1), IsActive = true },
                new Coupon { Code = "FESTIVE500", DiscountAmount = 500, MinimumOrderAmount = 3000, ExpirationDate = DateTime.UtcNow.AddMonths(2), IsActive = true },
                new Coupon { Code = "FREESHIP", IsActive = true, ExpirationDate = DateTime.UtcNow.AddMonths(6) } 
            );
            await context.SaveChangesAsync();
        }

        private static async Task SeedDemoCustomerAsync(UserManager<User> userManager, AppDbContext context)
        {
            // Seed Admin
            var adminEmail = "admin@vastra.com";
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new User { UserName = adminEmail, Email = adminEmail, FirstName = "Admin", LastName = "User", EmailConfirmed = true };
                await userManager.CreateAsync(admin, "Admin@123");
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // Seed Customer
            var email = "customer@vastra.com";
            var user = await userManager.FindByEmailAsync(email);

            if (user == null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    FirstName = "Rahul",
                    LastName = "Sharma",
                    EmailConfirmed = true,
                    PhoneNumber = "9876543210"
                };

                var result = await userManager.CreateAsync(user, "Customer@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Customer");
                    
                    context.Addresses.Add(new Address
                    {
                        UserId = user.Id,
                        Street = "12/A, Gandhi Marg, Civil Lines",
                        City = "Jaipur",
                        State = "Rajasthan",
                        ZipCode = "302001",
                        Country = "India",
                        AddressType = "Home"
                    });
                    await context.SaveChangesAsync();
                }
            }
        }
        
        // Helper classes for JSON deserialization
        private class JsonProduct
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public decimal BasePrice { get; set; }
            public bool IsActive { get; set; }
            public int CategoryId { get; set; } // Ignored in favor of Name lookup
            public List<string> ImageUrls { get; set; }
            public List<JsonVariant> Variants { get; set; }
            public string CategoryNameFromMarkdown { get; set; }
        }

        private class JsonVariant
        {
            public string Sku { get; set; }
            public string Size { get; set; }
            public string Color { get; set; }
            public int StockQuantity { get; set; }
            public decimal PriceAdjustment { get; set; }
        }
    }
}
