using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Order;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
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

                // 4. Create Payment Record
                var payment = new Payment
                {
                    Order = order, // Link by reference
                    Amount = order.TotalAmount,
                    PaymentMethod = createOrderDto.PaymentMethod,
                    PaymentStatus = "Pending",
                    TransactionId = Guid.NewGuid().ToString(), // Mock
                    PaymentDate = DateTime.UtcNow,
                    PaymentGateway = "MockGateway"
                };
                _context.Payments.Add(payment);

                // 5. Clear Cart
                _context.CartItems.RemoveRange(cart.Items);

                await _context.SaveChangesAsync();
                
                // Commit transaction
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetById), new { id = order.Id }, await MapToDto(order));
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
    }
}
