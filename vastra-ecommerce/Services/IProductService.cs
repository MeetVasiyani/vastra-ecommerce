using EcommerceApplication.DTOs.Common;
using EcommerceApplication.DTOs.Product;

namespace EcommerceApplication.Services
{
    public interface IProductService
    {
        Task<PagedResult<ProductDto>> GetAllAsync(
            string? search,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            string? colors,
            string? sizes,
            int page,
            int pageSize);

        Task<ProductDto?> GetByIdAsync(int id);

        Task<ProductDto> CreateAsync(CreateProductDto createProductDto);

        Task UpdateAsync(int id, UpdateProductDto updateProductDto);

        Task DeleteAsync(int id);
    }
}