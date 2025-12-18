namespace EcommerceApplication.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
        public string UserId { get; set; } = string.Empty;
        public virtual User User { get; set; } = null!;
    }
}
