using EcommerceApplication.DTOs.Order;
using FluentValidation;

namespace EcommerceApplication.Validators
{
    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.ShippingAddress)
                .NotEmpty().WithMessage("Shipping address is required.");

            RuleFor(x => x.PaymentMethod)
                .NotEmpty().WithMessage("Payment method is required.");
        }
    }
}
