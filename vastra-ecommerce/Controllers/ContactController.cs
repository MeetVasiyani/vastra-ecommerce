using EcommerceApplication.DTOs.Contact;
using EcommerceApplication.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IEmailService emailService, ILogger<ContactController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitContactForm([FromBody] ContactDto contactDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ContactResponseDto
                {
                    IsSuccess = false,
                    Message = "Please fill in all required fields correctly."
                });
            }

            // Email to admin/support team
            var adminEmail = "support@vastra.com"; // This should be configured in appsettings.json
            var subject = $"New Contact Form Submission: {contactDto.Subject}";
            var message = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <h2 style='color: #800020;'>New Contact Form Submission</h2>
                        <div style='background-color: #f5f5f5; padding: 20px; border-radius: 8px;'>
                            <p><strong>Name:</strong> {contactDto.Name}</p>
                            <p><strong>Email:</strong> {contactDto.Email}</p>
                            <p><strong>Phone:</strong> {contactDto.Phone ?? "N/A"}</p>
                            <p><strong>Subject:</strong> {contactDto.Subject}</p>
                            <hr style='border: 1px solid #ddd;'/>
                            <p><strong>Message:</strong></p>
                            <p>{contactDto.Message.Replace("\n", "<br/>")}</p>
                        </div>
                        <p style='color: #666; font-size: 12px; margin-top: 20px;'>
                            This email was sent from the Vastra contact form.
                        </p>
                    </body>
                    </html>
                ";

            await _emailService.SendEmailAsync(adminEmail, subject, message);

            // Confirmation email to user
            var userSubject = "Thank you for contacting Vastra";
            var userMessage = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <h2 style='color: #800020;'>Thank you for contacting us!</h2>
                        <p>Dear {contactDto.Name},</p>
                        <p>We have received your message and will get back to you as soon as possible.</p>
                        <div style='background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                            <p><strong>Your message:</strong></p>
                            <p>{contactDto.Message.Replace("\n", "<br/>")}</p>
                        </div>
                        <p>If you have any urgent concerns, please feel free to call us directly.</p>
                        <p>Best regards,<br/>The Vastra Team</p>
                        <hr style='border: 1px solid #ddd; margin-top: 30px;'/>
                        <p style='color: #666; font-size: 12px;'>
                            This is an automated confirmation email. Please do not reply to this message.
                        </p>
                    </body>
                    </html>
                ";

            await _emailService.SendEmailAsync(contactDto.Email, userSubject, userMessage);

            _logger.LogInformation($"Contact form submitted by {contactDto.Email}");

            return Ok(new ContactResponseDto
            {
                IsSuccess = true,
                Message = "Thank you for contacting us! We'll get back to you soon."
            });
        }
    }
}
