using System.ComponentModel.DataAnnotations;
using EcommerceApplication.Constants;

namespace EcommerceApplication.DTOs.Order
{
    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public string PaymentStatus { get; set; } = string.Empty;
        public string? RazorpayOrderId { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string VariantSku { get; set; } = string.Empty;
    }

    public class CreateOrderDto
    {
        public string ShippingAddress { get; set; } = string.Empty;
        
        public string PaymentMethod { get; set; } = "COD"; // Default
        
        public int? CouponId { get; set; } // Optional coupon
    }

    public class UpdateOrderStatusDto
    {
        private static readonly HashSet<string> AllowedStatuses = new(OrderStatus.GetAllStatuses());

        [Required(ErrorMessage = "Status is required.")]
        public string Status { get; set; } = string.Empty;

        public bool IsValid() => AllowedStatuses.Contains(Status);
    }
}
