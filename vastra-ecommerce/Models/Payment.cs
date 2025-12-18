namespace EcommerceApplication.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;
        
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentGateway { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    }
}
