using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Cart;
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
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
             var cart = await GetOrCreateCart(GetUserId());
             return Ok(await MapToDto(cart));
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var cart = await GetOrCreateCart(userId);

                var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == addToCartDto.ProductVariantId);

                if (existingItem != null)
                {
                    existingItem.Quantity += addToCartDto.Quantity;
                }
                else
                {
                    var variant = await _context.ProductVariants.FindAsync(addToCartDto.ProductVariantId);
                    if (variant == null) return NotFound("Variant not found");

                    var newItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductVariantId = addToCartDto.ProductVariantId,
                        Quantity = addToCartDto.Quantity
                    };
                    _context.CartItems.Add(newItem);
                }

                await _context.SaveChangesAsync();
                
                // Refresh cart to get full data for DTO
                 // Reload cart with includes
                var updatedCart = await GetCartWithDetails(userId);
                return Ok(await MapToDto(updatedCart!));
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

            var userId = GetUserId();
            var cart = await GetOrCreateCart(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == updateCartItemDto.CartItemId);

            if (item != null)
            {
                item.Quantity = updateCartItemDto.Quantity;
                await _context.SaveChangesAsync();
            }

            var updatedCart = await GetCartWithDetails(userId);
            return Ok(await MapToDto(updatedCart!));
        }

        [HttpDelete("items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var userId = GetUserId();
            var cart = await GetOrCreateCart(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item != null)
            {
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync();
            }
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            var cart = await GetOrCreateCart(userId);
            if (cart.Items.Any())
            {
                _context.CartItems.RemoveRange(cart.Items);
                await _context.SaveChangesAsync();
            }
            return NoContent();
        }

        private async Task<Cart> GetOrCreateCart(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }
            return cart;
        }

        private async Task<Cart?> GetCartWithDetails(string userId)
        {
             return await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                .ThenInclude(v => v.Product)
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        private async Task<CartDto> MapToDto(Cart cart)
        {
             // If items are not loaded with full depth, we might need to reload or rely on GetCartWithDetails being called first.
             // Assumption: 'cart' passed here has relations loaded if coming from GetCartWithDetails.
             // If coming from GetOrCreateCart, it only has Items.
             
             // To be safe, we should ensure we have the details.
             if (cart.Items.Any() && cart.Items.First().ProductVariant == null)
             {
                 var fullyLoaded = await GetCartWithDetails(cart.UserId);
                 cart = fullyLoaded ?? cart;
             }

             var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = new List<CartItemDto>(),
                TotalAmount = 0
            };

            foreach (var item in cart.Items)
            {
                var variant = item.ProductVariant;
                if (variant != null)
                {
                     var product = variant.Product;
                     var mainImage = product.Images?.FirstOrDefault(i => i.IsMainImage)?.ImageUrl ?? product.Images?.FirstOrDefault()?.ImageUrl ?? "";

                     cartDto.Items.Add(new CartItemDto
                     {
                         Id = item.Id,
                         ProductId = product.Id,
                         ProductName = product.Name,
                         VariantSku = variant.SKU,
                         Size = variant.Size,
                         Color = variant.Color,
                         Price = product.BasePrice + variant.PriceAdjustment,
                         Quantity = item.Quantity,
                         ProductVariantId = item.ProductVariantId,
                         ImageUrl = mainImage
                     });
                }
            }

            cartDto.TotalAmount = cartDto.Items.Sum(i => i.Price * i.Quantity);
            return cartDto;
        }
    }
}
