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
             var cart = await GetOrCreateCart(GetUserId(), includeDetails: true);
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

                // Get variant to check stock
                var variant = await _context.ProductVariants.FindAsync(addToCartDto.ProductVariantId);
                if (variant == null) return NotFound("Variant not found");

                // Calculate total quantity (existing + new)
                var totalQuantity = addToCartDto.Quantity;
                if (existingItem != null)
                {
                    totalQuantity += existingItem.Quantity;
                }

                // Validate stock availability
                if (totalQuantity > variant.StockQuantity)
                {
                    return BadRequest($"Insufficient stock. Only {variant.StockQuantity} items available.");
                }

                if (existingItem != null)
                {
                    existingItem.Quantity += addToCartDto.Quantity;
                }
                else
                {
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
                var updatedCart = await GetOrCreateCart(userId, includeDetails: true);
                return Ok(await MapToDto(updatedCart));
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "";
                return BadRequest($"{ex.Message} | Inner: {innerMessage}");
            }
        }

        [HttpPut("items")]
        public async Task<IActionResult> UpdateItem([FromBody] UpdateCartItemDto updateCartItemDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserId();
            var cart = await GetOrCreateCart(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == updateCartItemDto.CartItemId);

            if (item == null) return NotFound("Cart item not found");

            // Validate stock before updating
            var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
            if (variant == null) return NotFound("Product variant not found");

            if (updateCartItemDto.Quantity > variant.StockQuantity)
            {
                return BadRequest($"Insufficient stock. Only {variant.StockQuantity} items available.");
            }

            item.Quantity = updateCartItemDto.Quantity;
            await _context.SaveChangesAsync();

            var updatedCart = await GetOrCreateCart(userId, includeDetails: true);
            return Ok(await MapToDto(updatedCart));
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

        private async Task<Cart> GetOrCreateCart(string userId, bool includeDetails = false)
        {
            IQueryable<Cart> query = _context.Carts;

            if (includeDetails)
            {
                query = query
                    .Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                    .ThenInclude(p => p.Images);
            }
            else
            {
                query = query.Include(c => c.Items);
            }

            var cart = await query.FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                // Verify user exists to prevent FK violation (e.g. stale token)
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                     throw new Exception("User account not found. The user associated with this token implies a stale session. Please log out and log in again.");
                }

                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }
            return cart;
        }

        private Task<CartDto> MapToDto(Cart cart)
        {
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
            return Task.FromResult(cartDto);
        }
    }
}
