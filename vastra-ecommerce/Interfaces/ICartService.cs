using EcommerceApplication.DTOs.Cart;

namespace EcommerceApplication.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartByUserIdAsync(string userId);
        Task<CartDto> AddItemToCartAsync(string userId, AddToCartDto addToCartDto);
        Task<CartDto> UpdateItemQuantityAsync(string userId, UpdateCartItemDto updateCartItemDto);
        Task RemoveItemFromCartAsync(string userId, int cartItemId);
        Task ClearCartAsync(string userId);
    }
}
