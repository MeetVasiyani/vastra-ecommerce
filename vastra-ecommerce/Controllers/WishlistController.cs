using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Wishlist;
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
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetUserId();
            var wishlistItems = await _context.Wishlists
                .Include(w => w.ProductVariant)
                .ThenInclude(v => v.Product)
                .ThenInclude(p => p.Images)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.DateAdded)
                .ToListAsync();

            var wishlistDtos = wishlistItems.Select(MapToWishlistDto).ToList();

            return Ok(wishlistDtos);
        }

        [HttpPost]
        public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistDto addToWishlistDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserId();

            // Check if variant exists
            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(v => v.Id == addToWishlistDto.ProductVariantId);

            if (variant == null) return NotFound("Product variant not found");

            // Check if already in wishlist
            var existingItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductVariantId == addToWishlistDto.ProductVariantId);

            if (existingItem != null)
            {
                return BadRequest("This item is already in your wishlist");
            }

            var wishlistItem = new Wishlist
            {
                UserId = userId,
                ProductVariantId = addToWishlistDto.ProductVariantId,
                DateAdded = DateTime.UtcNow
            };

            _context.Wishlists.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWishlist), MapToWishlistDto(wishlistItem));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromWishlist(int id)
        {
            var userId = GetUserId();
            var wishlistItem = await _context.Wishlists.FindAsync(id);

            if (wishlistItem == null) return NotFound("Wishlist item not found");

            // Ensure user can only delete their own wishlist items
            if (wishlistItem.UserId != userId) return Forbid();

            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearWishlist()
        {
            var userId = GetUserId();
            var wishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .ToListAsync();

            if (wishlistItems.Any())
            {
                _context.Wishlists.RemoveRange(wishlistItems);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        private static WishlistDto MapToWishlistDto(Wishlist wishlist)
        {
            var variant = wishlist.ProductVariant;
            var product = variant.Product;
            var mainImage = product.Images?.FirstOrDefault(i => i.IsMainImage)?.ImageUrl
                ?? product.Images?.FirstOrDefault()?.ImageUrl
                ?? "";

            return new WishlistDto
            {
                Id = wishlist.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductVariantId = wishlist.ProductVariantId,
                VariantSku = variant.SKU,
                Size = variant.Size,
                Color = variant.Color,
                Price = product.BasePrice + variant.PriceAdjustment,
                ImageUrl = mainImage,
                DateAdded = wishlist.DateAdded
            };
        }
    }
}
