using EcommerceApplication.DTOs.Cart;
using EcommerceApplication.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var cart = await _cartService.GetCartByUserIdAsync(GetUserId());
            return Ok(cart);
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            try
            {
                var cart = await _cartService.AddItemToCartAsync(GetUserId(), addToCartDto);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("items")]
        public async Task<IActionResult> UpdateItem([FromBody] UpdateCartItemDto updateCartItemDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var cart = await _cartService.UpdateItemQuantityAsync(GetUserId(), updateCartItemDto);
            return Ok(cart);
        }

        [HttpDelete("items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            await _cartService.RemoveItemFromCartAsync(GetUserId(), itemId);
            return NoContent(); // Or return updated cart
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            await _cartService.ClearCartAsync(GetUserId());
            return NoContent();
        }
    }
}
