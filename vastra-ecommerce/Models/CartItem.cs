namespace EcommerceApplication.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        
        public int CartId { get; set; }
        public virtual Cart Cart { get; set; } = null!;
        
        public int ProductVariantId { get; set; }
        public virtual ProductVariant ProductVariant { get; set; } = null!;
        
        public int Quantity { get; set; }
    }
}
