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
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public decimal BasePrice { get; set; }
        
        public bool IsActive { get; set; } = true;
        
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
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Material { get; set; }
        
        public int StockQuantity { get; set; }
        
        public decimal PriceAdjustment { get; set; }
    }
}
