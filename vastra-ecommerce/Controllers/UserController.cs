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

            return Ok(MapToUserDto(user, addresses));
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserId();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.PhoneNumber = updateDto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            var addresses = await _context.Addresses.Where(a => a.UserId == userId).ToListAsync();
            return Ok(MapToUserDto(user, addresses));
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

            return Ok(MapToAddressDto(address));
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

        [HttpPut("addresses/{addressId}")]
        public async Task<IActionResult> UpdateAddress(int addressId, [FromBody] CreateAddressDto addressDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var address = await _context.Addresses.FindAsync(addressId);
            if (address == null || address.UserId != GetUserId())
            {
                return NotFound("Address not found or unauthorized");
            }

            address.Street = addressDto.Street;
            address.City = addressDto.City;
            address.State = addressDto.State;
            address.ZipCode = addressDto.ZipCode;
            address.Country = addressDto.Country;

            await _context.SaveChangesAsync();

            return Ok(MapToAddressDto(address));
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = GetUserId();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return NoContent();
        }

        [HttpGet("Users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();

            var userDtos = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = roles,
                    IsDeactivated = user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow
                });
            }

            return Ok(userDtos);
        }

        [HttpPost("Users/{id}/promote")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PromoteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var result = await _userManager.AddToRoleAsync(user, "Admin");
            if (result.Succeeded)
            {
                return Ok(new { Message = "User successfully promoted to Admin." });
            }

            return BadRequest(new { Message = string.Join(", ", result.Errors.Select(e => e.Description)) });
        }

        [HttpPost("Users/{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserStatus(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains("Admin"))
            {
                return BadRequest(new { Message = "Cannot deactivate an Admin user." });
            }

            bool isCurrentlyDeactivated = user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow;

            IdentityResult result;
            if (isCurrentlyDeactivated)
            {
                // Unban
                result = await _userManager.SetLockoutEndDateAsync(user, null);
                if (result.Succeeded)
                {
                    return Ok(new { Message = "User successfully activated.", isDeactivated = false });
                }
            }
            else
            {
                // Ban
                result = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
                if (result.Succeeded)
                {
                    return Ok(new { Message = "User successfully deactivated.", isDeactivated = true });
                }
            }

            return BadRequest(new { Message = string.Join(", ", result.Errors.Select(e => e.Description)) });
        }

        [HttpPost("Users/{id}/reset-password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminResetPassword(string id, [FromBody] AdminResetPasswordDto request)
        {
            if (string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { Message = "New password is required." });
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

            if (result.Succeeded)
            {
                return Ok(new { Message = "User password forcefully reset successfully." });
            }

            return BadRequest(new { Message = string.Join(", ", result.Errors.Select(e => e.Description)) });
        }

        private static UserDto MapToUserDto(User user, List<Address> addresses)
        {
            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                PhoneNumber = user.PhoneNumber,
                Addresses = addresses.Select(MapToAddressDto).ToList()
            };
        }

        private static AddressDto MapToAddressDto(Address address)
        {
            return new AddressDto
            {
                Id = address.Id,
                Street = address.Street,
                City = address.City,
                State = address.State,
                ZipCode = address.ZipCode,
                Country = address.Country
            };
        }

    }
}
