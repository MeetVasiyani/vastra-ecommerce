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

                // 2. Create Order
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Pending",
                    TotalAmount = 0
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
                }

                order.TotalAmount = totalAmount;

                // 3. Create Payment Record
                var payment = new Payment
                {
                    Order = order, // Link by reference
                    Amount = totalAmount,
                    PaymentMethod = createOrderDto.PaymentMethod,
                    PaymentStatus = "Pending",
                    TransactionId = Guid.NewGuid().ToString(), // Mock
                    PaymentDate = DateTime.UtcNow,
                    PaymentGateway = "MockGateway"
                };
                _context.Payments.Add(payment);

                // 4. Clear Cart
                _context.CartItems.RemoveRange(cart.Items);

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = order.Id }, await MapToDto(order));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .ToListAsync();

            var orderDtos = new List<OrderDto>();
            foreach (var order in orders)
            {
                orderDtos.Add(await MapToDto(order));
            }

            return Ok(orderDtos);
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
                    var variant = await _context.ProductVariants
                        .Include(v => v.Product)
                        .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId);

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
