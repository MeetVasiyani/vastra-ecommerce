using EcommerceApplication.DTOs.User;
using EcommerceApplication.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userService.GetUserProfileAsync(GetUserId());
            return Ok(user);
        }

        [HttpPost("addresses")]
        public async Task<IActionResult> AddAddress([FromBody] CreateAddressDto addressDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var address = await _userService.AddAddressAsync(GetUserId(), addressDto);
            return Ok(address);
        }

        [HttpDelete("addresses/{addressId}")]
        public async Task<IActionResult> RemoveAddress(int addressId)
        {
            await _userService.RemoveAddressAsync(GetUserId(), addressId);
            return NoContent();
        }
    }
}
