using EcommerceApplication.DTOs.Product;
using EcommerceApplication.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? categoryId)
        {
            var products = await _productService.GetAllProductsAsync(search, categoryId);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var product = await _productService.CreateProductAsync(createProductDto);
                return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                // Log error
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _productService.UpdateProductAsync(id, createProductDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _productService.DeleteProductAsync(id);
            return NoContent();
        }
    }
}
