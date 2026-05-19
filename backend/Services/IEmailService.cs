using VehicleManagement.DTOs;

namespace VehicleManagement.Services;

/// <summary>
/// Service interface for email operations.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a formatted HTML invoice email to the customer.
    /// </summary>
    Task<bool> SendInvoiceEmailAsync(string toEmail, string customerName, SalesInvoiceDto invoice);

    /// <summary>
    /// Sends a raw HTML email with subject and body. Used by background services.
    /// </summary>
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody);
}
