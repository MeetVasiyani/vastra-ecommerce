using EcommerceApplication.DTOs.Order;

namespace EcommerceApplication.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto createOrderDto);
        Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(string userId);
        Task<OrderDto?> GetOrderByIdAsync(int orderId, string userId);
    }
}
