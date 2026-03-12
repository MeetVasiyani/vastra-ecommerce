using System.ComponentModel.DataAnnotations;

namespace EcommerceApplication.DTOs.Coupon
{
    public class CouponDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public int DiscountPercentage { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool IsActive { get; set; }
        public decimal MinimumOrderAmount { get; set; }
    }

    public class CreateCouponDto
    {
        [Required]
        [StringLength(50, ErrorMessage = "Code cannot exceed 50 characters")]
        public string Code { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Discount amount must be positive")]
        public decimal DiscountAmount { get; set; }

        [Range(0, 100, ErrorMessage = "Discount percentage must be between 0 and 100")]
        public int DiscountPercentage { get; set; }

        [Required]
        public DateTime ExpirationDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Minimum order amount must be positive")]
        public decimal MinimumOrderAmount { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class ValidateCouponDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal OrderAmount { get; set; }
    }

    public class CouponValidationResultDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public int? CouponId { get; set; }
    }
}
