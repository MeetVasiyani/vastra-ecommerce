using EcommerceApplication.DTOs.Product;
using FluentValidation;

namespace EcommerceApplication.Validators
{
    public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Product name is required.")
                .MaximumLength(100).WithMessage("Product name must not exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.");

            RuleFor(x => x.BasePrice)
                .GreaterThanOrEqualTo(0).WithMessage("Base price must be simpler or equal to 0.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Valid CategoryId is required.");

            RuleForEach(x => x.Variants).SetValidator(new CreateProductVariantDtoValidator());
        }
    }

    public class CreateProductVariantDtoValidator : AbstractValidator<CreateProductVariantDto>
    {
        public CreateProductVariantDtoValidator()
        {
            RuleFor(x => x.SKU)
                .NotEmpty().WithMessage("SKU is required.");
            
            RuleFor(x => x.Size)
                .NotEmpty().WithMessage("Size is required.");
                
            RuleFor(x => x.Color)
                .NotEmpty().WithMessage("Color is required.");
                
            RuleFor(x => x.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");
        }
    }
}
