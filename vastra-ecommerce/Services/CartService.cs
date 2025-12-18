using EcommerceApplication.DTOs.Cart;
using EcommerceApplication.Interfaces;
using EcommerceApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApplication.Services
{
    public class CartService : ICartService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CartService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CartDto> AddItemToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            var cart = await GetOrCreateCart(userId);
            
            var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == addToCartDto.ProductVariantId);
            
            if (existingItem != null)
            {
                existingItem.Quantity += addToCartDto.Quantity;
                // No need to call Update on repository as it's tracked
            }
            else
            {
                // Verify variant exists
                // We could do this check, but foreign key constraint will handle it or explicit check
                var variant = await _unitOfWork.Repository<ProductVariant>().GetByIdAsync(addToCartDto.ProductVariantId);
                if (variant == null) throw new Exception("Variant not found");

                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductVariantId = addToCartDto.ProductVariantId,
                    Quantity = addToCartDto.Quantity
                };
                await _unitOfWork.Repository<CartItem>().AddAsync(newItem);
            }

            await _unitOfWork.CompleteAsync();
            
            return await GetCartByUserIdAsync(userId);
        }

        public async Task ClearCartAsync(string userId)
        {
            var cart = await GetOrCreateCart(userId);
            if (cart.Items.Any())
            {
                _unitOfWork.Repository<CartItem>().RemoveRange(cart.Items);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task<CartDto> GetCartByUserIdAsync(string userId)
        {
            // Use includes to get Items -> Variant -> Product -> Images
            var cart = await _unitOfWork.Repository<Cart>().FindOneWithIncludesAsync(
                c => c.UserId == userId,
                c => c.Items
            );

            if (cart == null)
            {
                // Return empty cart DTO if not found (or should we create?)
                // Usually empty cart
                return new CartDto
                {
                    UserId = userId,
                    Items = new List<CartItemDto>(),
                    TotalAmount = 0
                };
            }

            // We need deeper includes: Items.Select(i => i.ProductVariant).ThenSelect(v => v.Product).ThenSelect(p => p.Images)
            // Generic Repository Include params are simple expressions.
            // string includes are easier for deep levels.
            // But I used params Expression<Func<T, object>>[]. This doesn't support 'ThenInclude' directly easily.
            // But EF Core allows including path via string if we exposed it, or we iterate.
            
            // Since my Generic Repo limitation, I might need to load CartItems with their variants separately or rely on structure.
            // For now, I will try to fetch CartItems directly with includes using FindAsync on CartItems.
            
            var cartItems = await _unitOfWork.Repository<CartItem>().FindAsync(i => i.CartId == cart.Id);
            
            // This is N+1 if I iterate.
            // I'll assume I can't easily do deep include with current Repo.
            // I will manually load variant info?
            // Wait, I can do:
            // var items = _context.CartItems.Include(i => i.ProductVariant).ThenInclude(v => v.Product).ThenInclude(p => p.Images).Where(...)
            // But I can't access context.
            
            // FIX: I will instantiate the DTOs and assume I might need to update Repo to `IQueryable` to chain includes?
            // Or just use the loop for now which is fine for small carts.
            // BUT, for each item, I will load Variant.
            
            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = userId,
                Items = new List<CartItemDto>()
            };

            foreach (var item in cartItems)
            {
                // Load Variant
                // We need the product info too.
                // Repository.cs GetByIdAsync doesn't include.
                // We use GetByIdWithIncludesAsync!
                
                // var variant = await _unitOfWork.Repository<ProductVariant>().GetByIdWithIncludesAsync(item.ProductVariantId, v => v.Product);
                // But Product needs Images...
                // Only one level supported by my params implementation (v => v.Product). Images are on Product.
                
                // My current implementation: 
                // query.Include(v => v.Product) -> Returns ProductVariant with Product.
                // But Product.Images is not included unless I do query.Include("Product.Images")
                
                // I will add another method or just string based include?
                // Let's stick to what we have.
                // I'll fetch Variant + Product.
                var variant = await _unitOfWork.Repository<ProductVariant>().GetByIdWithIncludesAsync(item.ProductVariantId, v => v.Product);
                
                // Determine Main Image manually?
                // We need to fetch images for product.
                // var images = await _unitOfWork.Repository<ProductImage>().FindAsync(img => img.ProductId == variant.ProductId && img.IsMainImage);
                // var mainImage = images.FirstOrDefault();
                
                // This is getting messy with many DB calls, but "correct" architecture with restricted Generic Repo.
                // For a "First create full fleged backend", this is acceptable if functional.
                
                if (variant != null)
                {
                     // Get Main Image
                     // I will assume the Product has images loaded? No.
                     var mainImage = (await _unitOfWork.Repository<ProductImage>().FindAsync(img => img.ProductId == variant.Product.Id && img.IsMainImage)).FirstOrDefault();
                     
                     cartDto.Items.Add(new CartItemDto
                     {
                         Id = item.Id,
                         ProductId = variant.Product.Id,
                         ProductName = variant.Product.Name,
                         VariantSku = variant.SKU,
                         Size = variant.Size,
                         Color = variant.Color,
                         Price = variant.Product.BasePrice + variant.PriceAdjustment,
                         Quantity = item.Quantity,
                         ProductVariantId = item.ProductVariantId,
                         ImageUrl = mainImage?.ImageUrl ?? ""
                     });
                }
            }
            
            cartDto.TotalAmount = cartDto.Items.Sum(i => i.Price * i.Quantity);
            return cartDto;
        }

        public async Task RemoveItemFromCartAsync(string userId, int cartItemId)
        {
            var cart = await GetOrCreateCart(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item != null)
            {
                _unitOfWork.Repository<CartItem>().Remove(item);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task<CartDto> UpdateItemQuantityAsync(string userId, UpdateCartItemDto updateCartItemDto)
        {
            var cart = await GetOrCreateCart(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == updateCartItemDto.CartItemId);
            
            if (item != null)
            {
                item.Quantity = updateCartItemDto.Quantity;
                await _unitOfWork.CompleteAsync();
            }
            
            return await GetCartByUserIdAsync(userId);
        }
        
        private async Task<Cart> GetOrCreateCart(string userId)
        {
            var cart = await _unitOfWork.Repository<Cart>().FindOneWithIncludesAsync(c => c.UserId == userId, c => c.Items);
            if (cart == null)
            {
               cart = new Cart { UserId = userId };
               await _unitOfWork.Repository<Cart>().AddAsync(cart);
               await _unitOfWork.CompleteAsync();
            }
            return cart;
        }
    }
}
