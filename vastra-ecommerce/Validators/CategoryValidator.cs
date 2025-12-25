using EcommerceApplication.DTOs.Category;
using FluentValidation;

namespace EcommerceApplication.Validators
{
    public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Category name is required.");
        }
    }
}
