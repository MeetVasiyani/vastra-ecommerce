using System.ComponentModel.DataAnnotations;
using EcommerceApplication.DTOs.Category;

namespace EcommerceApplication.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public int CategoryId { get; set; }
        public CategoryDto Category { get; set; } = null!;
        public List<ProductImageDto> Images { get; set; } = new();
        public List<ProductVariantDto> Variants { get; set; } = new();
    }

    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal BasePrice { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [Required]
        public int CategoryId { get; set; }

        public List<string> ImageUrls { get; set; } = new();
        public List<CreateProductVariantDto> Variants { get; set; } = new();
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMainImage { get; set; }
    }

    public class ProductVariantDto
    {
        public int Id { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Material { get; set; }
        public int StockQuantity { get; set; }
        public decimal PriceAdjustment { get; set; }
    }

    public class CreateProductVariantDto
    {
        [Required]
        public string SKU { get; set; } = string.Empty;
        [Required]
        public string Size { get; set; } = string.Empty;
        [Required]
        public string Color { get; set; } = string.Empty;
        public string? Material { get; set; }
        
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
        
        public decimal PriceAdjustment { get; set; }
    }
}
