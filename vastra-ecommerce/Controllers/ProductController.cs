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
            [FromQuery] string? colors,
            [FromQuery] string? sizes,
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            List<int>? categoryIds = null;
            if (categoryId.HasValue)
            {
                categoryIds = await GetCategoryAndChildrenIds(categoryId.Value);
            }

            var query = BuildProductQuery(
                search, categoryIds, minPrice, maxPrice, colors, sizes
            );

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => MapToProductDto(p))
                .ToListAsync();

            await EnrichProductsWithReviews(products);

            return Ok(new DTOs.Common.PagedResult<ProductDto>
            {
                Items = products,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        private IQueryable<Product> BuildProductQuery(
            string? search, 
            List<int>? categoryIds,
            decimal? minPrice,
            decimal? maxPrice,
            string? colors,
            string? sizes)
        {
            var query = _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search));

            if (categoryIds != null && categoryIds.Any())
            {
                query = query.Where(p => categoryIds.Contains(p.CategoryId));
            }

            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);

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

            return query;
        }

        private static ProductDto MapToProductDto(Product product) =>
            new ProductDto
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
                }).ToList()
            };

        private async Task EnrichProductsWithReviews(List<ProductDto> products)
        {
            var productIds = products.Select(p => p.Id).ToList();
            var reviewAggregates = await _context.Reviews
                .Where(r => productIds.Contains(r.ProductId))
                .GroupBy(r => r.ProductId)
                .Select(g => new 
                { 
                    ProductId = g.Key, 
                    Avg = g.Average(r => (double)r.Rating), 
                    Count = g.Count() 
                })
                .ToDictionaryAsync(x => x.ProductId, x => (x.Avg, x.Count));

            foreach (var p in products)
            {
                if (reviewAggregates.TryGetValue(p.Id, out var agg))
                {
                    p.AverageRating = agg.Avg;
                    p.ReviewCount = agg.Count;
                }
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            var productDto = MapToProductDto(product);

            var reviews = await _context.Reviews
                .Where(r => r.ProductId == id)
                .Select(r => (double)r.Rating)
                .ToListAsync();

            if (reviews.Any())
            {
                productDto.AverageRating = reviews.Average();
                productDto.ReviewCount = reviews.Count;
            }

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
                    _context.ProductImages.Add(new ProductImage
                    {
                        ImageUrl = url,
                        Product = product,
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
                        Product = product
                    });
                }
            }

            await _context.SaveChangesAsync();

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

        [HttpPost("fix-anarkali-images")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FixAnarkaliImages()
        {
            var anarkaliCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == "Anarkalis");

            if (anarkaliCategory == null)
                return NotFound(new { message = "Anarkalis category not found" });

            var anarkaliProducts = await _context.Products
                .Include(p => p.Images)
                .Where(p => p.CategoryId == anarkaliCategory.Id)
                .OrderBy(p => p.Id)
                .ToListAsync();

            if (!anarkaliProducts.Any())
                return NotFound(new { message = "No Anarkali products found" });

            var updatedCount = 0;
            var imageIndex = 1;

            foreach (var product in anarkaliProducts)
            {
                if (product.Images.Any())
                {
                    _context.ProductImages.RemoveRange(product.Images);
                }

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
