using System.ComponentModel.DataAnnotations;

namespace EcommerceApplication.DTOs.Cart
{
    public class CartDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public List<CartItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string VariantSku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int ProductVariantId { get; set; }
    }

    public class AddToCartDto
    {
        [Required]
        public int ProductVariantId { get; set; }
        
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemDto
    {
        [Required]
        public int CartItemId { get; set; }
        
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
