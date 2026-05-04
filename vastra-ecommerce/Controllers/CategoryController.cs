using EcommerceApplication.Data;
using EcommerceApplication.DTOs.Category;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description ?? string.Empty,
                    ImageUrl = c.ImageUrl ?? string.Empty,
                    ParentCategoryId = c.ParentCategoryId
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            return Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description ?? string.Empty,
                ImageUrl = category.ImageUrl ?? string.Empty,
                ParentCategoryId = category.ParentCategoryId
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto createCategoryDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                ImageUrl = createCategoryDto.ImageUrl
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = category.Id }, new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description ?? string.Empty,
                ImageUrl = category.ImageUrl ?? string.Empty
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateCategoryDto createCategoryDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            category.Name = createCategoryDto.Name;
            category.Description = createCategoryDto.Description;
            category.ImageUrl = createCategoryDto.ImageUrl;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
