using EcommerceApplication.DTOs.Category;

namespace EcommerceApplication.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto?> GetCategoryByIdAsync(int id);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
        Task UpdateCategoryAsync(int id, CreateCategoryDto categoryDto);
        Task DeleteCategoryAsync(int id);
    }
}
