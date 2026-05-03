using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Coupon;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CouponController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCoupons()
        {
            var coupons = await _context.Coupons
                .Select(c => new CouponDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    DiscountAmount = c.DiscountAmount,
                    DiscountPercentage = c.DiscountPercentage,
                    ExpirationDate = c.ExpirationDate,
                    IsActive = c.IsActive,
                    MinimumOrderAmount = c.MinimumOrderAmount
                })
                .ToListAsync();

            return Ok(coupons);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveCoupons()
        {
            var now = DateTime.UtcNow;
            var coupons = await _context.Coupons
                .Where(c => c.IsActive && c.ExpirationDate > now)
                .Select(c => new CouponDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    DiscountAmount = c.DiscountAmount,
                    DiscountPercentage = c.DiscountPercentage,
                    ExpirationDate = c.ExpirationDate,
                    IsActive = c.IsActive,
                    MinimumOrderAmount = c.MinimumOrderAmount
                })
                .ToListAsync();

            return Ok(coupons);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();

            var couponDto = new CouponDto
            {
                Id = coupon.Id,
                Code = coupon.Code,
                DiscountAmount = coupon.DiscountAmount,
                DiscountPercentage = coupon.DiscountPercentage,
                ExpirationDate = coupon.ExpirationDate,
                IsActive = coupon.IsActive,
                MinimumOrderAmount = coupon.MinimumOrderAmount
            };

            return Ok(couponDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto createCouponDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Check if code already exists
            var existingCoupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == createCouponDto.Code);

            if (existingCoupon != null)
            {
                return BadRequest("A coupon with this code already exists");
            }


            var coupon = new Coupon
            {
                Code = createCouponDto.Code.ToUpper(),
                DiscountAmount = createCouponDto.DiscountAmount,
                DiscountPercentage = createCouponDto.DiscountPercentage,
                ExpirationDate = createCouponDto.ExpirationDate,
                MinimumOrderAmount = createCouponDto.MinimumOrderAmount,
                IsActive = true
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            var couponDto = new CouponDto
            {
                Id = coupon.Id,
                Code = coupon.Code,
                DiscountAmount = coupon.DiscountAmount,
                DiscountPercentage = coupon.DiscountPercentage,
                ExpirationDate = coupon.ExpirationDate,
                IsActive = coupon.IsActive,
                MinimumOrderAmount = coupon.MinimumOrderAmount
            };

            return CreatedAtAction(nameof(GetById), new { id = coupon.Id }, couponDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCoupon(int id, [FromBody] CreateCouponDto createCouponDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();

            // Check if new code conflicts with existing coupon
            if (coupon.Code != createCouponDto.Code.ToUpper())
            {
                var existingCoupon = await _context.Coupons
                    .FirstOrDefaultAsync(c => c.Code == createCouponDto.Code && c.Id != id);

                if (existingCoupon != null)
                {
                    return BadRequest("A coupon with this code already exists");
                }
            }

            coupon.Code = createCouponDto.Code.ToUpper();
            coupon.DiscountAmount = createCouponDto.DiscountAmount;
            coupon.DiscountPercentage = createCouponDto.DiscountPercentage;
            coupon.ExpirationDate = createCouponDto.ExpirationDate;
            coupon.MinimumOrderAmount = createCouponDto.MinimumOrderAmount;
            coupon.IsActive = createCouponDto.IsActive; // was silently ignored before

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();

            // Soft delete - just deactivate
            coupon.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto validateCouponDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == validateCouponDto.Code.ToUpper());

            if (coupon == null)
            {
                return Ok(new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Invalid coupon code"
                });
            }

            if (!coupon.IsActive)
            {
                return Ok(new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "This coupon is no longer active"
                });
            }

            if (coupon.ExpirationDate <= DateTime.UtcNow)
            {
                return Ok(new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "This coupon has expired"
                });
            }

            if (validateCouponDto.OrderAmount < coupon.MinimumOrderAmount)
            {
                return Ok(new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = $"Minimum order amount of {coupon.MinimumOrderAmount:C} required"
                });
            }

            // Calculate discount
            decimal discountAmount;
            if (coupon.DiscountPercentage > 0)
            {
                discountAmount = (validateCouponDto.OrderAmount * coupon.DiscountPercentage) / 100;
            }
            else
            {
                discountAmount = coupon.DiscountAmount;
            }

            // Ensure discount doesn't exceed order amount
            discountAmount = Math.Min(discountAmount, validateCouponDto.OrderAmount);

            return Ok(new CouponValidationResultDto
            {
                IsValid = true,
                Message = "Coupon is valid",
                DiscountAmount = discountAmount,
                CouponId = coupon.Id
            });
        }
    }
}
