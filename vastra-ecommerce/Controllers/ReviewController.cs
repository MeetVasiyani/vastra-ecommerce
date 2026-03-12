using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Common;
using EcommerceApplication.DTOs.Review;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewController(AppDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductReviews(int productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.Date);

            var totalCount = await query.CountAsync();
            var reviews = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    Date = r.Date,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    UserName = r.User.FirstName + " " + r.User.LastName
                })
                .ToListAsync();

            var result = new PagedResult<ReviewDto>
            {
                Items = reviews,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();

                // Check if product exists
                var productExists = await _context.Products.AnyAsync(p => p.Id == createReviewDto.ProductId);
                if (!productExists) return NotFound("Product not found");

                // Check if user already reviewed this product
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == createReviewDto.ProductId);

                if (existingReview != null)
                {
                    return BadRequest("You have already reviewed this product. Please update your existing review.");
                }

                var review = new Review
                {
                    Rating = createReviewDto.Rating,
                    Comment = createReviewDto.Comment,
                    ProductId = createReviewDto.ProductId,
                    UserId = userId,
                    Date = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Fetch user details for response
                var user = await _context.Users.FindAsync(userId);

                var reviewDto = new ReviewDto
                {
                    Id = review.Id,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    Date = review.Date,
                    ProductId = review.ProductId,
                    UserId = review.UserId,
                    UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown"
                };

                return CreatedAtAction(nameof(GetProductReviews), 
                    new { productId = review.ProductId }, reviewDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto updateReviewDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserId();
            var review = await _context.Reviews.FindAsync(id);

            if (review == null) return NotFound("Review not found");

            // Ensure user can only update their own review
            if (review.UserId != userId) return Forbid();

            review.Rating = updateReviewDto.Rating;
            review.Comment = updateReviewDto.Comment;
            review.Date = DateTime.UtcNow; // Update timestamp

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetUserId();
            var review = await _context.Reviews.FindAsync(id);

            if (review == null) return NotFound("Review not found");

            // Ensure user can only delete their own review
            if (review.UserId != userId) return Forbid();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("my-reviews")]
        public async Task<IActionResult> GetMyReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var userId = GetUserId();
            var query = _context.Reviews
                .Include(r => r.Product)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.Date);

            var totalCount = await query.CountAsync();
            var reviews = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    Date = r.Date,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    UserId = r.UserId
                })
                .ToListAsync();

            var result = new PagedResult<ReviewDto>
            {
                Items = reviews,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReviewsAdmin([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] int? rating = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .AsQueryable();

            if (rating.HasValue && rating.Value >= 1 && rating.Value <= 5)
            {
                query = query.Where(r => r.Rating == rating.Value);
            }

            var totalCount = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    Date = r.Date,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    UserId = r.UserId,
                    UserName = r.User.FirstName + " " + r.User.LastName
                })
                .ToListAsync();

            var result = new PagedResult<ReviewDto>
            {
                Items = reviews,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReviewAdmin(int id)
        {
            var review = await _context.Reviews.FindAsync(id);

            if (review == null) return NotFound("Review not found");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
