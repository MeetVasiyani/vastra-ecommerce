namespace EcommerceApplication.Models
{
    public class Address
    {
        public int Id { get; set; }
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        
        // e.g., "Home", "Work", "Billing", "Shipping"
        public string AddressType { get; set; } = "Home"; 
        
        public string UserId { get; set; } = string.Empty;
        public virtual User User { get; set; } = null!;
    }
}
