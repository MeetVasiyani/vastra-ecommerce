using EcommerceApplication.DTOs.Order;
using EcommerceApplication.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
             if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var order = await _orderService.CreateOrderAsync(GetUserId(), createOrderDto);
                return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var orders = await _orderService.GetOrdersByUserIdAsync(GetUserId());
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id, GetUserId());
            if (order == null) return NotFound();
            return Ok(order);
        }
    }
}
