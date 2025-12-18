using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceApplication.Models
{
    public class Coupon
    {
        public int Id { get; set; }

        [Required]
        public string Code { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        public int DiscountPercentage { get; set; }

        public DateTime ExpirationDate { get; set; }

        public bool IsActive { get; set; } = true;

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinimumOrderAmount { get; set; }
    }
}
