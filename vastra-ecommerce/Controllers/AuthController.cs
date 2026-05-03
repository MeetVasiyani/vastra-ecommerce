using EcommerceApplication.DTOs.Auth;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommerceApplication.Services;
using System.Web;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;

        private readonly IEmailService _emailService;

        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "User already exists with this email"
                });
            }

            var user = new User
            {
                Email = registerDto.Email,
                UserName = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                });
            }

            // Assign default Customer role
            await _userManager.AddToRoleAsync(user, "Customer");

            var token = await GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Email = user.Email!,
                UserId = user.Id,
                Message = "User registered successfully"
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
            {
                return Unauthorized(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid email or password"
                });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid email or password"
                });
            }

            var token = await GenerateJwtToken(user, loginDto.RememberMe);

            return Ok(new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Email = user.Email!,
                UserId = user.Id,
                Message = "Login successful"
            });
        }

        private async Task<string> GenerateJwtToken(User user, bool rememberMe = false)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add user roles to claims
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Remember Me: 30-day token; otherwise a short 1-hour session token
            var expiry = rememberMe
                ? DateTime.UtcNow.AddDays(30)
                : DateTime.UtcNow.AddHours(1);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiry,
                SigningCredentials = creds,
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return Ok(new { Message = "If an account with that email exists, a password reset link has been sent." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // In a real app, this URL should be configurable or constructed based on the request
            var frontendUrl = "http://localhost:5173"; 
            var resetLink = $"{frontendUrl}/reset-password?token={HttpUtility.UrlEncode(token)}&email={HttpUtility.UrlEncode(user.Email)}";
            
            var subject = "Reset your password";
            var message = $"Please reset your password by clicking here: <a href='{resetLink}'>link</a>";

            await _emailService.SendEmailAsync(user.Email!, subject, message);

            return Ok(new { Message = "If an account with that email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return BadRequest(new { Message = "Invalid request." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Password has been reset successfully." });
            }

            return BadRequest(new { Message = string.Join(", ", result.Errors.Select(e => e.Description)) });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Password changed successfully." });
            }

            return BadRequest(new { Message = string.Join(", ", result.Errors.Select(e => e.Description)) });
        }

        [HttpGet("Users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            // In a real app, use pagination. For now, list all.
            var users = _userManager.Users.ToList(); // Note: This might be slow if many users, good for now.
            
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

        public class AdminResetPasswordDto 
        {
            public string NewPassword { get; set; } = string.Empty;
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
    }
}
