namespace EcommerceApplication.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;

        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
