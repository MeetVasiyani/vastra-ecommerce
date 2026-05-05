namespace EcommerceApplication.Constants
{
    public static class OrderStatus
    {
        public const string Pending = "Pending";
        public const string Processing = "Processing";
        public const string Shipped = "Shipped";
        public const string Delivered = "Delivered";
        public const string Cancelled = "Cancelled";

        public static IEnumerable<string> GetAllStatuses()
        {
            return new[] { Pending, Processing, Shipped, Delivered, Cancelled };
        }

        public static bool IsValid(string? status)
        {
            return !string.IsNullOrEmpty(status) && GetAllStatuses().Contains(status);
        }
    }
    public static class PaymentStatus
    {
        public const string Pending = "Pending";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
        public const string Failed = "Failed";
        public const string Unknown = "Unknown";

        public static IEnumerable<string> GetAllStatuses()
        {
            return new[] { Pending, Completed, Cancelled, Failed, Unknown };
        }
        public static bool IsValid(string? status)
        {
            return !string.IsNullOrEmpty(status) && GetAllStatuses().Contains(status);
        }
    }
}
