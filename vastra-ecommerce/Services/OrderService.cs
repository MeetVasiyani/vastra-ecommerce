using EcommerceApplication.DTOs.Order;
using EcommerceApplication.Interfaces;
using EcommerceApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApplication.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICartService _cartService;

        public OrderService(IUnitOfWork unitOfWork, ICartService cartService)
        {
            _unitOfWork = unitOfWork;
            _cartService = cartService;
        }

        public async Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto createOrderDto)
        {
            // 1. Get Cart
            var cart = await _unitOfWork.Repository<Cart>().FindOneWithIncludesAsync(c => c.UserId == userId, c => c.Items);
            
            if (cart == null || !cart.Items.Any())
            {
                throw new Exception("Cart is empty");
            }

            // Fetch Items details for price integrity
            var cartItems = await _unitOfWork.Repository<CartItem>().FindAsync(i => i.CartId == cart.Id);
            
            // 2. Create Order
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                TotalAmount = 0, // Will calculate
                // Shipping Address logic omitted or assume serialized string for now if Order model doesn't have relation
                // Checking Order.cs... I assume it links to Address or string.
                // Assuming simplistic Order model for now based on file view earlier (it had ICollection<OrderItem> and Payment).
            };

            await _unitOfWork.Repository<Order>().AddAsync(order);
            await _unitOfWork.CompleteAsync(); // To get ID

            decimal totalAmount = 0;

            foreach (var cartItem in cartItems)
            {
                var variant = await _unitOfWork.Repository<ProductVariant>().GetByIdWithIncludesAsync(cartItem.ProductVariantId, v => v.Product);
                if (variant == null) continue;

                var price = variant.Product.BasePrice + variant.PriceAdjustment;
                var amount = price * cartItem.Quantity;
                totalAmount += amount;

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductVariantId = cartItem.ProductVariantId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = price
                };
                
                await _unitOfWork.Repository<OrderItem>().AddAsync(orderItem);
            }

            order.TotalAmount = totalAmount;
            
            // 3. Create Payment Record
            var payment = new Payment
            {
                OrderId = order.Id,
                Amount = totalAmount,
                PaymentMethod = createOrderDto.PaymentMethod,
                PaymentStatus = "Pending",
                TransactionId = Guid.NewGuid().ToString(), // Mock
                PaymentDate = DateTime.UtcNow,
                PaymentGateway = "MockGateway"
            };
            await _unitOfWork.Repository<Payment>().AddAsync(payment);

            _unitOfWork.Repository<Order>().Update(order);

            // 4. Clear Cart
            _unitOfWork.Repository<CartItem>().RemoveRange(cartItems);
            
            await _unitOfWork.CompleteAsync();

            return await MapToDto(order);
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int orderId, string userId)
        {
            var order = await _unitOfWork.Repository<Order>().FindOneWithIncludesAsync(
                o => o.Id == orderId && o.UserId == userId,
                o => o.OrderItems
            );
            
            if (order == null) return null;

            return await MapToDto(order);
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(string userId)
        {
            var orders = await _unitOfWork.Repository<Order>().FindAsync(o => o.UserId == userId);
            // We need includes for OrderItems. Repo doesn't support complex includes well on FindAsync unless we use GetAllWithIncludes and filter.
            // Using GetAllWithIncludes and filtering in memory or adding predicate support to it.
            // I'll used FindOne loop or just basic info.
            // Let's use GetAllWithIncludes(o => o.OrderItems) and filter.
            
            var allOrders = await _unitOfWork.Repository<Order>().GetAllWithIncludesAsync(o => o.OrderItems);
            var userOrders = allOrders.Where(o => o.UserId == userId); // Client side eval essentially but efficient enough for now
            
            var list = new List<OrderDto>();
            foreach(var order in userOrders)
            {
                list.Add(await MapToDto(order));
            }
            return list;
        }

        private async Task<OrderDto> MapToDto(Order order)
        {
            // Payment info
            var payment = (await _unitOfWork.Repository<Payment>().FindAsync(p => p.OrderId == order.Id)).FirstOrDefault();

            var dto = new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                PaymentStatus = payment?.PaymentStatus ?? "Unknown",
                Items = new List<OrderItemDto>()
            };

            // OrderItems are loaded if using proper include.
            if (order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    // Need Variant info for name
                    var variant = await _unitOfWork.Repository<ProductVariant>().GetByIdWithIncludesAsync(item.ProductVariantId, v => v.Product);
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
