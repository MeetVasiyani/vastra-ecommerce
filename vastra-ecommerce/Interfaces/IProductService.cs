using EcommerceApplication.DTOs.Product;

namespace EcommerceApplication.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync(string? search, int? categoryId);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task UpdateProductAsync(int id, CreateProductDto createProductDto);
        Task DeleteProductAsync(int id);
    }
}
