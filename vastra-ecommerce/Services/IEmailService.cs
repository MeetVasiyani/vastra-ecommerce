using System.Threading.Tasks;

namespace EcommerceApplication.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}
