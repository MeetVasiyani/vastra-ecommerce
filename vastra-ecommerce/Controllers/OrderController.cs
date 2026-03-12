using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Order;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Razorpay.Api;
using Microsoft.Extensions.Configuration;
using Order = EcommerceApplication.Models.Order; // Fix Ambiguity with Razorpay
using Payment = EcommerceApplication.Models.Payment; // Fix Ambiguity with Razorpay

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public OrderController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
             if (!ModelState.IsValid) return BadRequest(ModelState);

            // Start transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var userId = GetUserId();
                // 1. Get Cart
                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || !cart.Items.Any())
                {
                    return BadRequest("Cart is empty");
                }

                // Fetch Items detail
                // Optimization: Fetch all needed variants in one go to avoid N+1
                var variantIds = cart.Items.Select(i => i.ProductVariantId).Distinct().ToList();
                var variants = await _context.ProductVariants
                    .Include(v => v.Product)
                    .Where(v => variantIds.Contains(v.Id))
                    .ToListAsync();

                // Validate stock availability for all items
                foreach (var cartItem in cart.Items)
                {
                    var variant = variants.FirstOrDefault(v => v.Id == cartItem.ProductVariantId);
                    if (variant == null)
                    {
                        return BadRequest($"Product variant {cartItem.ProductVariantId} not found");
                    }

                    if (cartItem.Quantity > variant.StockQuantity)
                    {
                        return BadRequest($"Insufficient stock for {variant.Product.Name}. Only {variant.StockQuantity} available.");
                    }
                }

                // 2. Create Order
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Pending",
                    TotalAmount = 0,
                    ShippingAddress = createOrderDto.ShippingAddress // Map address
                };

                _context.Orders.Add(order);
                // Don't save yet

                decimal totalAmount = 0;

                foreach (var cartItem in cart.Items)
                {
                    var variant = variants.FirstOrDefault(v => v.Id == cartItem.ProductVariantId);

                    if (variant == null) continue;

                    var price = variant.Product.BasePrice + variant.PriceAdjustment;
                    var amount = price * cartItem.Quantity;
                    totalAmount += amount;

                    var orderItem = new OrderItem
                    {
                        Order = order, // Link by reference
                        ProductVariantId = cartItem.ProductVariantId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = price
                    };
                    _context.OrderItems.Add(orderItem);

                    // Decrement stock
                    variant.StockQuantity -= cartItem.Quantity;
                }

                order.TotalAmount = totalAmount;

                // 3. Apply coupon if provided
                if (createOrderDto.CouponId.HasValue)
                {
                    var coupon = await _context.Coupons.FindAsync(createOrderDto.CouponId.Value);
                    if (coupon != null && coupon.IsActive && coupon.ExpirationDate > DateTime.UtcNow)
                    {
                        if (totalAmount >= coupon.MinimumOrderAmount)
                        {
                            decimal discountAmount;
                            if (coupon.DiscountPercentage > 0)
                            {
                                discountAmount = (totalAmount * coupon.DiscountPercentage) / 100;
                            }
                            else
                            {
                                discountAmount = coupon.DiscountAmount;
                            }

                            discountAmount = Math.Min(discountAmount, totalAmount);
                            order.TotalAmount -= discountAmount;
                            order.CouponId = coupon.Id;
                        }
                    }
                }

                // 4. Create Payment Record & Razorpay Order
                string? razorpayOrderId = null;

                if (createOrderDto.PaymentMethod != "COD")
                {
                    // Initialize Razorpay Client
                    var key = _configuration["Razorpay:KeyId"];
                    var secret = _configuration["Razorpay:KeySecret"];
                    RazorpayClient client = new RazorpayClient(key, secret);

                    // Create Razorpay Order options
                    // Amount must be in the smallest currency unit (paise for INR)
                    Dictionary<string, object> options = new Dictionary<string, object>();
                    options.Add("amount", (int)(order.TotalAmount * 100)); // converting rupees to paise
                    options.Add("currency", "INR");
                    options.Add("receipt", order.Id.ToString());

                    try
                    {
                        // Call Razorpay API
                        var razorpayOrder = client.Order.Create(options);
                        razorpayOrderId = razorpayOrder["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Failed to create Razorpay Order: {ex.Message}");
                    }
                }

                var payment = new Payment
                {
                    Order = order, // Link by reference
                    Amount = order.TotalAmount,
                    PaymentMethod = createOrderDto.PaymentMethod,
                    PaymentStatus = "Pending",
                    TransactionId = razorpayOrderId ?? Guid.NewGuid().ToString(), 
                    PaymentDate = DateTime.UtcNow,
                    PaymentGateway = createOrderDto.PaymentMethod == "COD" ? "Cash" : "Razorpay"
                };
                _context.Payments.Add(payment);

                // 5. Clear Cart ONLY if COD or amount is 0
                if (createOrderDto.PaymentMethod == "COD" || order.TotalAmount == 0)
                {
                    _context.CartItems.RemoveRange(cart.Items);
                }

                await _context.SaveChangesAsync();
                
                // Commit transaction
                await transaction.CommitAsync();

                var orderDto = await MapToDto(order);
                return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { Order = orderDto, RazorpayOrderId = razorpayOrderId });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var userId = GetUserId();

            var query = _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate);

            var totalCount = await query.CountAsync();

            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var orderDtos = new List<OrderDto>();
            foreach (var order in orders)
            {
                orderDtos.Add(await MapToDto(order));
            }

            var result = new DTOs.Common.PagedResult<OrderDto>
            {
                Items = orderDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null) return NotFound();

            return Ok(await MapToDto(order));
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = GetUserId();

            // Start transaction
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get the order with items
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Only allow cancellation for pending orders
                if (order.Status?.ToLower() != "pending")
                {
                    return BadRequest($"Cannot cancel order with status: {order.Status}. Only pending orders can be cancelled.");
                }

                // Update order status
                order.Status = "Cancelled";

                // Restore stock for all order items
                var variantIds = order.OrderItems.Select(i => i.ProductVariantId).ToList();
                var variants = await _context.ProductVariants
                    .Where(v => variantIds.Contains(v.Id))
                    .ToListAsync();

                foreach (var orderItem in order.OrderItems)
                {
                    var variant = variants.FirstOrDefault(v => v.Id == orderItem.ProductVariantId);
                    if (variant != null)
                    {
                        // Restore the stock
                        variant.StockQuantity += orderItem.Quantity;
                    }
                }

                // Update payment status if exists
                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
                if (payment != null)
                {
                    payment.PaymentStatus = "Cancelled";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(await MapToDto(order));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Failed to cancel order: {ex.Message}");
            }
        }

        private async Task<OrderDto> MapToDto(Order order)
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);

            // Fix N+1: Load all variants with products in one query
            var variantIds = order.OrderItems?.Select(i => i.ProductVariantId).ToList() ?? new List<int>();
            var variants = await _context.ProductVariants
                .Include(v => v.Product)
                .Where(v => variantIds.Contains(v.Id))
                .ToListAsync();

            var dto = new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                PaymentStatus = payment?.PaymentStatus ?? "Unknown",
                Items = new List<OrderItemDto>()
            };

            if (order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var variant = variants.FirstOrDefault(v => v.Id == item.ProductVariantId);

                    if (variant != null)
                    {
                        dto.Items.Add(new OrderItemDto
                        {
                            Id = item.Id,
                            ProductName = variant.Product.Name,
                            VariantSku = variant.SKU,
                            Quantity = item.Quantity,
                            UnitPrice = item.UnitPrice
                        });
                    }
                }
            }

            return dto;
        }

        // ====================================================================================
        // ADMIN ENDPOINTS
        // ====================================================================================

        [HttpGet("Admin/All")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Orders
                .Include(o => o.OrderItems)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            // Order by most recent
            query = query.OrderByDescending(o => o.OrderDate);

            var totalCount = await query.CountAsync();
            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var orderDtos = new List<OrderDto>();
            foreach (var order in orders)
            {
                orderDtos.Add(await MapToDto(order));
            }

            var result = new DTOs.Common.PagedResult<OrderDto>
            {
                Items = orderDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("Admin/Stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrderStats()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            return Ok(new
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue
            });
        }

        [HttpPut("Admin/{id}/Status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto statusDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!statusDto.IsValid())
            {
                return BadRequest(new { Message = $"Invalid status '{statusDto.Status}'. Allowed values: Pending, Processing, Shipped, Delivered, Cancelled." });
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            var oldStatus = order.Status;
            order.Status = statusDto.Status;

            // Handle cancellation if status changed to Cancelled
            if (statusDto.Status == "Cancelled" && oldStatus != "Cancelled")
            {
                // Restore stock
                var variantIds = order.OrderItems.Select(i => i.ProductVariantId).ToList();
                var variants = await _context.ProductVariants
                    .Where(v => variantIds.Contains(v.Id))
                    .ToListAsync();

                foreach (var orderItem in order.OrderItems)
                {
                    var variant = variants.FirstOrDefault(v => v.Id == orderItem.ProductVariantId);
                    if (variant != null)
                    {
                        variant.StockQuantity += orderItem.Quantity;
                    }
                }

                 // Update payment
                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
                if (payment != null) payment.PaymentStatus = "Cancelled";
            }
             // Handle payment status update if Delivered
            else if (statusDto.Status == "Delivered")
            {
                 var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
                 if (payment != null && payment.PaymentStatus == "Pending")
                 {
                     payment.PaymentStatus = "Completed";
                 }
            }

            await _context.SaveChangesAsync();
            return Ok(await MapToDto(order));
        }

        // DTO for status update
        public class UpdateOrderStatusDto
        {
            private static readonly HashSet<string> AllowedStatuses = new()
            {
                "Pending", "Processing", "Shipped", "Delivered", "Cancelled"
            };

            [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Status is required.")]
            public string Status { get; set; } = string.Empty;

            public bool IsValid() => AllowedStatuses.Contains(Status);
        }
    }
}
