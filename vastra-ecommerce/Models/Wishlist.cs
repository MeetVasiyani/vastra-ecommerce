namespace EcommerceApplication.Models
{
    public class Wishlist
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public virtual User User { get; set; } = null!;
        public int ProductVariantId { get; set; }
        public virtual ProductVariant ProductVariant { get; set; } = null!;
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    }
}
