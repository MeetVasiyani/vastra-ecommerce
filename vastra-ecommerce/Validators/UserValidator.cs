using EcommerceApplication.DTOs.User;
using FluentValidation;

namespace EcommerceApplication.Validators
{
    public class CreateAddressDtoValidator : AbstractValidator<CreateAddressDto>
    {
        public CreateAddressDtoValidator()
        {
            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("Street is required.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("City is required.");

            RuleFor(x => x.State)
                .NotEmpty().WithMessage("State is required.");

            RuleFor(x => x.ZipCode)
                .NotEmpty().WithMessage("ZipCode is required.");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("Country is required.");
        }
    }
}
