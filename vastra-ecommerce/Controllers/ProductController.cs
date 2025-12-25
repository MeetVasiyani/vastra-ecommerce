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
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? categoryId)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var products = await query
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    BasePrice = p.BasePrice,
                    IsActive = p.IsActive,
                    CategoryId = p.CategoryId,
                    CreatedDate = p.CreatedDate
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

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
                }).ToList()
                // Include variants mapping if needed for frontend
            };

            return Ok(productDto);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
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
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Name = createProductDto.Name;
            product.Description = createProductDto.Description;
            product.BasePrice = createProductDto.BasePrice;
            product.IsActive = createProductDto.IsActive;
            product.CategoryId = createProductDto.CategoryId;

            // Simple update, skipping deep variant update logic as per previous service implementation expectation
            // Ideally should replace images and variants if provided.
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
