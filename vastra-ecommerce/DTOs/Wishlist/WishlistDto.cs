using System.ComponentModel.DataAnnotations;

namespace EcommerceApplication.DTOs.Wishlist
{
    public class WishlistDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int ProductVariantId { get; set; }
        public string VariantSku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime DateAdded { get; set; }
    }

    public class AddToWishlistDto
    {
        [Required]
        public int ProductVariantId { get; set; }
    }
}
