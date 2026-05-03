using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Product;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search, 
            [FromQuery] int? categoryId, 
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? colors, // Comma-separated
            [FromQuery] string? sizes,  // Comma-separated
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            if (categoryId.HasValue)
            {
                var categoryIds = await GetCategoryAndChildrenIds(categoryId.Value);
                query = query.Where(p => categoryIds.Contains(p.CategoryId));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.BasePrice >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.BasePrice <= maxPrice.Value);
            }

            if (!string.IsNullOrWhiteSpace(colors))
            {
                var colorList = colors.Split(',').Select(c => c.Trim().ToLower()).ToList();
                query = query.Where(p => p.Variants.Any(v => colorList.Contains(v.Color.ToLower())));
            }

            if (!string.IsNullOrWhiteSpace(sizes))
            {
                var sizeList = sizes.Split(',').Select(s => s.Trim().ToUpper()).ToList();
                query = query.Where(p => p.Variants.Any(v => sizeList.Contains(v.Size.ToUpper())));
            }

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    BasePrice = p.BasePrice,
                    IsActive = p.IsActive,
                    CategoryId = p.CategoryId,
                    CreatedDate = p.CreatedDate,
                    Images = p.Images.Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        ImageUrl = i.ImageUrl,
                        IsMainImage = i.IsMainImage
                    }).ToList(),
                    Variants = p.Variants.Select(v => new ProductVariantDto
                    {
                        Id = v.Id,
                        SKU = v.SKU,
                        Size = v.Size,
                        Color = v.Color,
                        Material = v.Material,
                        StockQuantity = v.StockQuantity,
                        PriceAdjustment = v.PriceAdjustment
                    }).ToList(),
                    // Single pass over Reviews per product — no N+1 subqueries
                    AverageRating = p.Images.Any() // dummy guard; real data from join below
                        ? 0 : 0, // placeholder, overridden after fetch
                    ReviewCount = 0  // placeholder, overridden after fetch
                })
                .ToListAsync();

            // Fix N+1: bulk-load review aggregates for all fetched products in one query
            var productIds = products.Select(p => p.Id).ToList();
            var reviewAggregates = await _context.Reviews
                .Where(r => productIds.Contains(r.ProductId))
                .GroupBy(r => r.ProductId)
                .Select(g => new { ProductId = g.Key, Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
                .ToListAsync();

            foreach (var p in products)
            {
                var agg = reviewAggregates.FirstOrDefault(a => a.ProductId == p.Id);
                p.AverageRating = agg?.Avg ?? 0;
                p.ReviewCount = agg?.Count ?? 0;
            }

            var result = new DTOs.Common.PagedResult<ProductDto>
            {
                Items = products,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            var reviews = await _context.Reviews.Where(r => r.ProductId == id).ToListAsync();

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                BasePrice = product.BasePrice,
                IsActive = product.IsActive,
                CategoryId = product.CategoryId,
                CreatedDate = product.CreatedDate,
                Images = product.Images.Select(i => new ProductImageDto 
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    IsMainImage = i.IsMainImage
                }).ToList(),
                Variants = product.Variants.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    SKU = v.SKU,
                    Size = v.Size,
                    Color = v.Color,
                    Material = v.Material,
                    StockQuantity = v.StockQuantity,
                    PriceAdjustment = v.PriceAdjustment
                }).ToList(),
                AverageRating = reviews.Any() ? reviews.Average(r => (double)r.Rating) : 0,
                ReviewCount = reviews.Count
            };

            return Ok(productDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                BasePrice = createProductDto.BasePrice,
                IsActive = createProductDto.IsActive,
                CategoryId = createProductDto.CategoryId,
                CreatedDate = DateTime.UtcNow
            };


            // Add to context but don't save yet
            _context.Products.Add(product);
            
            if (createProductDto.ImageUrls != null)
            {
                var firstUrl = createProductDto.ImageUrls.FirstOrDefault();
                foreach (var url in createProductDto.ImageUrls)
                {
                    // Navigation property approach is better but Product property for collection might be null or we need to init it.
                    // Assuming Product model has a collection for Images.
                    // Ideally: product.Images.Add(...) 
                    // But checking model I see I am using _context.ProductImages.Add
                    // For this to work in one save, I should add to the navigation property if possible, 
                    // OR rely on EF Core Fixup by setting the navigation property on the child if I add valid entity instance to context?
                    // If I set ProductId = product.Id (which is 0 or temp), EF needs to know the relationship.
                    // Best way: use navigation property on the Product entity.
                    // product.Images = new List<ProductImage>(); 
                    // But I don't see Product model directly, let's assume it has collection or just add to context manually with object reference.
                    
                    // We will create the ProductImage and set the Product navigation property (not just ID).
                    _context.ProductImages.Add(new ProductImage
                    {
                        ImageUrl = url,
                        Product = product, // Link by reference
                        IsMainImage = url == firstUrl
                    });
                }
            }

            if (createProductDto.Variants != null)
            {
                foreach (var variantDto in createProductDto.Variants)
                {
                     _context.ProductVariants.Add(new ProductVariant
                    {
                        SKU = variantDto.SKU,
                        Size = variantDto.Size,
                        Color = variantDto.Color,
                        Material = variantDto.Material,
                        StockQuantity = variantDto.StockQuantity,
                        PriceAdjustment = variantDto.PriceAdjustment,
                        Product = product // Link by reference
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Re-fetch to return mapped DTO or simplified Return
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, createProductDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product == null) return NotFound();

            product.Name = createProductDto.Name;
            product.Description = createProductDto.Description;
            product.BasePrice = createProductDto.BasePrice;
            product.IsActive = createProductDto.IsActive;
            product.CategoryId = createProductDto.CategoryId;

            // Update images - remove old, add new
            if (createProductDto.ImageUrls != null && createProductDto.ImageUrls.Any())
            {
                _context.ProductImages.RemoveRange(product.Images);
                
                var firstUrl = createProductDto.ImageUrls.FirstOrDefault();
                foreach (var url in createProductDto.ImageUrls)
                {
                    _context.ProductImages.Add(new ProductImage
                    {
                        ImageUrl = url,
                        Product = product,
                        IsMainImage = url == firstUrl
                    });
                }
            }

            // Update variants - remove old, add new
            if (createProductDto.Variants != null && createProductDto.Variants.Any())
            {
                _context.ProductVariants.RemoveRange(product.Variants);
                
                foreach (var variantDto in createProductDto.Variants)
                {
                    _context.ProductVariants.Add(new ProductVariant
                    {
                        SKU = variantDto.SKU,
                        Size = variantDto.Size,
                        Color = variantDto.Color,
                        Material = variantDto.Material,
                        StockQuantity = variantDto.StockQuantity,
                        PriceAdjustment = variantDto.PriceAdjustment,
                        Product = product
                    });
                }
            }
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Fix Anarkali product images - updates placeholder URLs to local image paths
        /// </summary>
        [HttpPost("fix-anarkali-images")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FixAnarkaliImages()
        {
            // Find the Anarkalis category
            var anarkaliCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == "Anarkalis");

            if (anarkaliCategory == null)
                return NotFound(new { message = "Anarkalis category not found" });

            // Get all Anarkali products with their images
            var anarkaliProducts = await _context.Products
                .Include(p => p.Images)
                .Where(p => p.CategoryId == anarkaliCategory.Id)
                .OrderBy(p => p.Id)
                .ToListAsync();

            if (!anarkaliProducts.Any())
                return NotFound(new { message = "No Anarkali products found" });

            int updatedCount = 0;
            int imageIndex = 1;

            foreach (var product in anarkaliProducts)
            {
                // Remove existing images
                if (product.Images.Any())
                {
                    _context.ProductImages.RemoveRange(product.Images);
                }

                // Add correct local image (cycle through 1-5)
                var imageNumber = ((imageIndex - 1) % 5) + 1;
                _context.ProductImages.Add(new ProductImage
                {
                    ProductId = product.Id,
                    ImageUrl = $"/images/products/anarkali/Anarkali {imageNumber}.png",
                    IsMainImage = true
                });

                imageIndex++;
                updatedCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = $"Successfully updated {updatedCount} Anarkali products with local images",
                productsUpdated = updatedCount
            });
        }

        private async Task<List<int>> GetCategoryAndChildrenIds(int categoryId)
        {
            var ids = new List<int> { categoryId };
            var childIds = await _context.Categories
                .Where(c => c.ParentCategoryId == categoryId)
                .Select(c => c.Id)
                .ToListAsync();

            foreach (var childId in childIds)
            {
                ids.AddRange(await GetCategoryAndChildrenIds(childId));
            }

            return ids;
        }
    }
}
