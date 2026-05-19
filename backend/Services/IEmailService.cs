namespace VehicleManagement.Services;

public interface IEmailService
{
    /// <summary>
    /// Sends an email with retry logic.
    /// Returns true if the email was sent successfully, false otherwise.
    /// </summary>
    Task<bool> SendEmailAsync(string to, string subject, string body);
}
