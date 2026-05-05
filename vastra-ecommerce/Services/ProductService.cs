using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Category;
using EcommerceApplication.DTOs.Common;
using EcommerceApplication.DTOs.Product;
using EcommerceApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApplication.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<ProductDto>> GetAllAsync(
            string? search,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            string? colors,
            string? sizes,
            int page,
            int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            List<int>? categoryIds = null;
            if (categoryId.HasValue)
            {
                categoryIds = await GetCategoryAndChildrenIds(categoryId.Value);
            }

            var query = BuildProductQuery(search, categoryIds, minPrice, maxPrice, colors, sizes);

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => MapToProductDto(p))
                .ToListAsync();

            await EnrichProductsWithReviews(products);

            return new PagedResult<ProductDto>
            {
                Items = products,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return null;
            }

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

            return productDto;
        }

        public async Task<ProductDto> CreateAsync(CreateProductDto createProductDto)
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

            var createdProduct = await GetByIdAsync(product.Id);
            if (createdProduct == null)
            {
                throw new InvalidOperationException("The product was created but could not be loaded.");
            }

            return createdProduct;
        }

        public async Task UpdateAsync(int id, UpdateProductDto updateProductDto)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                throw new KeyNotFoundException($"Product with id {id} was not found.");
            }

            if (updateProductDto.Name != null)
                product.Name = updateProductDto.Name;

            if (updateProductDto.Description != null)
                product.Description = updateProductDto.Description;

            if (updateProductDto.BasePrice.HasValue)
                product.BasePrice = updateProductDto.BasePrice.Value;

            if (updateProductDto.IsActive.HasValue)
                product.IsActive = updateProductDto.IsActive.Value;

            if (updateProductDto.CategoryId.HasValue)
                product.CategoryId = updateProductDto.CategoryId.Value;

            if (updateProductDto.ImageUrls != null)
            {
                _context.ProductImages.RemoveRange(product.Images);

                var firstUrl = updateProductDto.ImageUrls.FirstOrDefault();
                foreach (var url in updateProductDto.ImageUrls)
                {
                    _context.ProductImages.Add(new ProductImage
                    {
                        ImageUrl = url,
                        Product = product,
                        IsMainImage = url == firstUrl
                    });
                }
            }

            if (updateProductDto.Variants != null)
            {
                var variantsById = product.Variants.ToDictionary(v => v.Id);

                foreach (var variantDto in updateProductDto.Variants)
                {
                    if (!variantsById.TryGetValue(variantDto.Id, out var existingVariant))
                    {
                        throw new ArgumentException($"Variant with id {variantDto.Id} does not belong to product {id}.");
                    }

                    if (variantDto.Size != null)
                        existingVariant.Size = variantDto.Size;

                    if (variantDto.Color != null)
                        existingVariant.Color = variantDto.Color;

                    if (variantDto.Material != null)
                        existingVariant.Material = variantDto.Material;

                    if (variantDto.StockQuantity.HasValue)
                        existingVariant.StockQuantity = variantDto.StockQuantity.Value;

                    if (variantDto.PriceAdjustment.HasValue)
                        existingVariant.PriceAdjustment = variantDto.PriceAdjustment.Value;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product with id {id} was not found.");
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
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
                .Include(p => p.Category)
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
                Category = product.Category == null
                    ? null!
                    : new CategoryDto
                    {
                        Id = product.Category.Id,
                        Name = product.Category.Name,
                        Description = product.Category.Description,
                        ImageUrl = product.Category.ImageUrl,
                        ParentCategoryId = product.Category.ParentCategoryId
                    },
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

        private async Task<List<int>> GetCategoryAndChildrenIds(int categoryId)
        {
            return await _context.Database.SqlQuery<int>($@"
                WITH CategoryTree AS
                (
                    SELECT [Id]
                    FROM [Categories]
                    WHERE [Id] = {categoryId}

                    UNION ALL

                    SELECT c.[Id]
                    FROM [Categories] c
                    INNER JOIN CategoryTree ct ON c.[ParentCategoryId] = ct.[Id]
                )
                SELECT [Id] AS [Value]
                FROM CategoryTree")
                .ToListAsync();
        }
    }
}
