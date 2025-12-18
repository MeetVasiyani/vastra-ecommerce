namespace EcommerceApplication.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; 
        public string UserId { get; set; } = string.Empty;
        public virtual User User { get; set; } = null!;
        
        public virtual Payment? Payment { get; set; }
        
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        
        public string ShippingAddress { get; set; } = string.Empty; 
        public string BillingAddress { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;

        public int? CouponId { get; set; }
        public virtual Coupon? Coupon { get; set; }
    }
}
