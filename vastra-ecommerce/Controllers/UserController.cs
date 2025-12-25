using EcommerceApplication.Data;
using EcommerceApplication.DTOs.User;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;

        public UserController(UserManager<User> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            var addresses = await _context.Addresses.Where(a => a.UserId == userId).ToListAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                Addresses = addresses.Select(a => new AddressDto
                {
                    Id = a.Id,
                    Street = a.Street,
                    City = a.City,
                    State = a.State,
                    ZipCode = a.ZipCode,
                    Country = a.Country
                }).ToList()
            });
        }

        [HttpPost("addresses")]
        public async Task<IActionResult> AddAddress([FromBody] CreateAddressDto addressDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var address = new Address
            {
                UserId = GetUserId(),
                Street = addressDto.Street,
                City = addressDto.City,
                State = addressDto.State,
                ZipCode = addressDto.ZipCode,
                Country = addressDto.Country
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return Ok(new AddressDto
            {
                Id = address.Id,
                Street = address.Street,
                City = address.City,
                State = address.State,
                ZipCode = address.ZipCode,
                Country = address.Country
            });
        }

        [HttpDelete("addresses/{addressId}")]
        public async Task<IActionResult> RemoveAddress(int addressId)
        {
            var address = await _context.Addresses.FindAsync(addressId);
            if (address != null && address.UserId == GetUserId())
            {
                _context.Addresses.Remove(address);
                await _context.SaveChangesAsync();
            }
            return NoContent();
        }
    }
}
