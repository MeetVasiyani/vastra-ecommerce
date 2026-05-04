using EcommerceApplication.Settings;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace EcommerceApplication.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            if (string.IsNullOrEmpty(_emailSettings.Host) || string.IsNullOrEmpty(_emailSettings.Username))
            {
                _logger.LogWarning("Email settings are incomplete. Skipping send for {Recipient} with subject {Subject}.", toEmail, subject);
                return;
            }

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
                Subject = subject,
                Body = message,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            _logger.LogInformation(
                "Sending email through {Host}:{Port} as {Username}",
                _emailSettings.Host,
                _emailSettings.Port,
                _emailSettings.Username);

            using var smtpClient = new SmtpClient(_emailSettings.Host, _emailSettings.Port);
            smtpClient.UseDefaultCredentials = false;

            var password = _emailSettings.Password.Replace(" ", "");
            smtpClient.Credentials = new NetworkCredential(_emailSettings.Username, password);
            smtpClient.EnableSsl = true;

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
