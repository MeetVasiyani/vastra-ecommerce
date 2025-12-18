using EcommerceApplication.DTOs.Category;
using EcommerceApplication.Interfaces;
using EcommerceApplication.Models;

namespace EcommerceApplication.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                ImageUrl = createCategoryDto.ImageUrl
            };

            await _unitOfWork.Repository<Category>().AddAsync(category);
            await _unitOfWork.CompleteAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl
            };
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);
            if (category != null)
            {
                _unitOfWork.Repository<Category>().Remove(category);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _unitOfWork.Repository<Category>().GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl
            });
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl
            };
        }

        public async Task UpdateCategoryAsync(int id, CreateCategoryDto categoryDto)
        {
            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);
            if (category != null)
            {
                category.Name = categoryDto.Name;
                category.Description = categoryDto.Description;
                category.ImageUrl = categoryDto.ImageUrl;

                _unitOfWork.Repository<Category>().Update(category);
                await _unitOfWork.CompleteAsync();
            }
        }
    }
}
