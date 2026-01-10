using EcommerceApplication.DTOs.Coupon;
using FluentValidation;

namespace EcommerceApplication.Validators
{
    public class CreateCouponValidator : AbstractValidator<CreateCouponDto>
    {
        public CreateCouponValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Coupon code is required")
                .MaximumLength(50)
                .WithMessage("Code cannot exceed 50 characters")
                .Matches(@"^[A-Z0-9_-]+$")
                .WithMessage("Code must contain only uppercase letters, numbers, hyphens, and underscores");

            RuleFor(x => x.DiscountAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Discount amount must be positive");

            RuleFor(x => x.DiscountPercentage)
                .InclusiveBetween(0, 100)
                .WithMessage("Discount percentage must be between 0 and 100");

            RuleFor(x => x)
                .Must(x => x.DiscountAmount > 0 || x.DiscountPercentage > 0)
                .WithMessage("Either discount amount or discount percentage must be greater than zero");

            RuleFor(x => x.ExpirationDate)
                .GreaterThan(DateTime.UtcNow)
                .WithMessage("Expiration date must be in the future");

            RuleFor(x => x.MinimumOrderAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Minimum order amount must be positive");
        }
    }

    public class ValidateCouponValidator : AbstractValidator<ValidateCouponDto>
    {
        public ValidateCouponValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Coupon code is required");

            RuleFor(x => x.OrderAmount)
                .GreaterThan(0)
                .WithMessage("Order amount must be greater than zero");
        }
    }
}
