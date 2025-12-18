namespace EcommerceApplication.Models
{
    public class ProductImage
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMainImage { get; set; }
        public int ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
    }
}
