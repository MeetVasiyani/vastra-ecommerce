using EcommerceApplication.Models;
using FluentValidation;

namespace vastra_ecommerce.Validators
{
    public class AddressValidator : AbstractValidator<Address>
    {
        public AddressValidator()
        {
            RuleFor(x => x.Street).NotEmpty().WithMessage("Street Name is Required");
        }
    }
}
