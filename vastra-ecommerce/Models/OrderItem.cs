namespace EcommerceApplication.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        public int OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        public int ProductVariantId { get; set; }
        public virtual ProductVariant ProductVariant { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
