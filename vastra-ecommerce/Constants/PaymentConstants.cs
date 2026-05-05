namespace EcommerceApplication.Constants
{
    public static class PaymentMethod
    {
        public const string Cod = "COD";

        public static IEnumerable<string> GetAllMethods()
        {
            return new[] { Cod };
        }

        public static bool IsValid(string? method)
        {
            return !string.IsNullOrEmpty(method) && GetAllMethods().Contains(method);
        }
    }

    public static class PaymentGateway
    {
        public const string Cash = "Cash";
        public const string Razorpay = "Razorpay";

        public static IEnumerable<string> GetAllGateways()
        {
            return new[] { Cash, Razorpay };
        }

        public static bool IsValid(string? gateway)
        {
            return !string.IsNullOrEmpty(gateway) && GetAllGateways().Contains(gateway);
        }
    }
}