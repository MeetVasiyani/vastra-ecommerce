using System.ComponentModel.DataAnnotations;

namespace EcommerceApplication.DTOs.Category
{
    public class CategoryDto
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class CreateCategoryDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;
    }
}
