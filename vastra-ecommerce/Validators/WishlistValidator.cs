using EcommerceApplication.DTOs.Wishlist;
using FluentValidation;

namespace EcommerceApplication.Validators
{
    public class AddToWishlistValidator : AbstractValidator<AddToWishlistDto>
    {
        public AddToWishlistValidator()
        {
            RuleFor(x => x.ProductVariantId)
                .GreaterThan(0)
                .WithMessage("Valid product variant ID is required");
        }
    }
}
