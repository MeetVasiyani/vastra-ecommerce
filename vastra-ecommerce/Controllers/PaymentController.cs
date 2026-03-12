using EcommerceApplication.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using System.Security.Cryptography;
using System.Text;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public PaymentController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class PaymentVerificationDto
        {
            public string RazorpayPaymentId { get; set; } = string.Empty;
            public string RazorpayOrderId { get; set; } = string.Empty;
            public string RazorpaySignature { get; set; } = string.Empty;
        }

        [HttpPost("Verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerificationDto dto)
        {
            var secret = _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrEmpty(secret))
            {
                return StatusCode(500, "Razorpay secret not configured.");
            }

            try
            {
                // Razorpay's signature verification logic
                string payload = dto.RazorpayOrderId + "|" + dto.RazorpayPaymentId;
                string generatedSignature = GetHmacSha256(payload, secret);

                if (generatedSignature == dto.RazorpaySignature)
                {
                    // Payment is verified
                    // Find the payment record in our DB using the Razorpay Order ID
                    var payment = await _context.Payments
                        .Include(p => p.Order)
                        .FirstOrDefaultAsync(p => p.TransactionId == dto.RazorpayOrderId);

                    if (payment == null)
                    {
                        return NotFound("Payment record not found.");
                    }

                    // Update local payment
                    payment.PaymentStatus = "Completed";
                    
                    // Clear the user's cart
                    var cart = await _context.Carts
                        .Include(c => c.Items)
                        .FirstOrDefaultAsync(c => c.UserId == payment.Order.UserId);

                    if (cart != null && cart.Items.Any())
                    {
                        _context.CartItems.RemoveRange(cart.Items);
                    }

                    // Note: Order.Status remains. The Admin can change it to "Processing" or "Shipped" 

                    await _context.SaveChangesAsync();
                    
                    return Ok(new { success = true, message = "Payment verified successfully" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Invalid payment signature" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private static string GetHmacSha256(string input, string secret)
        {
            byte[] keyByte = Encoding.UTF8.GetBytes(secret);
            byte[] messageBytes = Encoding.UTF8.GetBytes(input);
            using (var hmacsha256 = new HMACSHA256(keyByte))
            {
                byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
                return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
            }
        }
    }
}
