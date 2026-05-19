using System.Net;
using System.Net.Mail;
using VehicleManagement.DTOs;

namespace VehicleManagement.Services;

/// <summary>
/// Email service implementation using SMTP.
/// Sends formatted HTML invoice emails to customers after purchase.
/// Handles failures gracefully by logging errors and returning false.
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Sends a beautifully formatted HTML invoice email to the customer.
    /// </summary>
    public async Task<bool> SendInvoiceEmailAsync(string toEmail, string customerName, SalesInvoiceDto invoice)
    {
        try
        {
            // Read SMTP settings from appsettings.json
            var smtpHost = _config["SmtpSettings:Host"] ?? "smtp.mailtrap.io";
            var smtpPort = int.Parse(_config["SmtpSettings:Port"] ?? "587");
            var smtpUser = _config["SmtpSettings:Username"] ?? "";
            var smtpPass = _config["SmtpSettings:Password"] ?? "";
            var fromEmail = _config["SmtpSettings:FromEmail"] ?? "noreply@vehicleparts.com";
            var fromName = _config["SmtpSettings:FromName"] ?? "Vehicle Parts System";
            var enableSsl = bool.Parse(_config["SmtpSettings:EnableSsl"] ?? "true");

            // Build the HTML email body
            var htmlBody = BuildInvoiceHtml(customerName, invoice);

            using var message = new MailMessage();
            message.From = new MailAddress(fromEmail, fromName);
            message.To.Add(new MailAddress(toEmail, customerName));
            message.Subject = $"Invoice #{invoice.Id} — Vehicle Parts Purchase";
            message.Body = htmlBody;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(smtpHost, smtpPort);
            client.Credentials = new NetworkCredential(smtpUser, smtpPass);
            client.EnableSsl = enableSsl;

            await client.SendMailAsync(message);

            _logger.LogInformation("Invoice email sent successfully to {Email} for Invoice #{InvoiceId}",
                toEmail, invoice.Id);
            return true;
        }
        catch (Exception ex)
        {
            // Graceful failure: log and return false — don't crash the invoice flow
            _logger.LogError(ex, "Failed to send invoice email to {Email} for Invoice #{InvoiceId}",
                toEmail, invoice.Id);
            return false;
        }
    }

    /// <summary>
    /// Builds a professional HTML email template for the invoice.
    /// </summary>
    private static string BuildInvoiceHtml(string customerName, SalesInvoiceDto invoice)
    {
        // Build the items table rows
        var itemRows = string.Join("", invoice.Items.Select(item =>
            $@"<tr>
                <td style='padding:10px 15px;border-bottom:1px solid #eee;'>{item.PartName}</td>
                <td style='padding:10px 15px;border-bottom:1px solid #eee;text-align:center;'>{item.Quantity}</td>
                <td style='padding:10px 15px;border-bottom:1px solid #eee;text-align:right;'>Rs. {item.UnitPrice:N2}</td>
                <td style='padding:10px 15px;border-bottom:1px solid #eee;text-align:right;'>Rs. {item.TotalPrice:N2}</td>
            </tr>"));

        return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f7;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f7;padding:30px 0;'>
    <tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);'>

        <!-- Header -->
        <tr>
          <td style='background:linear-gradient(135deg,#1a237e,#283593);padding:30px 40px;'>
            <h1 style='color:#fff;margin:0;font-size:24px;'>Vehicle Parts System</h1>
            <p style='color:#c5cae9;margin:5px 0 0;font-size:14px;'>Purchase Invoice</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style='padding:30px 40px 10px;'>
            <p style='font-size:16px;color:#333;'>Dear <strong>{customerName}</strong>,</p>
            <p style='font-size:14px;color:#555;line-height:1.6;'>
              Thank you for your purchase! Here is a summary of your invoice.
            </p>
          </td>
        </tr>

        <!-- Invoice Meta -->
        <tr>
          <td style='padding:10px 40px;'>
            <table width='100%' style='background:#f8f9fa;border-radius:6px;padding:15px;'>
              <tr>
                <td style='padding:5px 15px;color:#666;font-size:13px;'><strong>Invoice #</strong></td>
                <td style='padding:5px 15px;color:#333;font-size:13px;'>{invoice.Id}</td>
                <td style='padding:5px 15px;color:#666;font-size:13px;'><strong>Date</strong></td>
                <td style='padding:5px 15px;color:#333;font-size:13px;'>{invoice.InvoiceDate:MMM dd, yyyy}</td>
              </tr>
              <tr>
                <td style='padding:5px 15px;color:#666;font-size:13px;'><strong>Status</strong></td>
                <td style='padding:5px 15px;font-size:13px;'>
                  <span style='background:{(invoice.PaymentStatus == "Paid" ? "#4caf50" : "#ff9800")};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;'>{invoice.PaymentStatus}</span>
                </td>
                <td colspan='2'></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items Table -->
        <tr>
          <td style='padding:20px 40px;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #eee;border-radius:6px;overflow:hidden;'>
              <tr style='background:#1a237e;'>
                <th style='padding:12px 15px;color:#fff;text-align:left;font-size:13px;'>Part</th>
                <th style='padding:12px 15px;color:#fff;text-align:center;font-size:13px;'>Qty</th>
                <th style='padding:12px 15px;color:#fff;text-align:right;font-size:13px;'>Unit Price</th>
                <th style='padding:12px 15px;color:#fff;text-align:right;font-size:13px;'>Total</th>
              </tr>
              {itemRows}
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style='padding:0 40px 30px;'>
            <table width='100%' style='border-top:2px solid #1a237e;padding-top:15px;'>
              <tr>
                <td style='padding:4px 0;color:#666;font-size:14px;'>Sub Total</td>
                <td style='padding:4px 0;text-align:right;color:#333;font-size:14px;'>Rs. {invoice.SubTotal:N2}</td>
              </tr>
              <tr>
                <td style='padding:4px 0;color:#666;font-size:14px;'>Discount</td>
                <td style='padding:4px 0;text-align:right;color:#4caf50;font-size:14px;'>- Rs. {invoice.DiscountAmount:N2}</td>
              </tr>
              <tr>
                <td style='padding:8px 0 4px;color:#333;font-size:16px;font-weight:bold;border-top:1px solid #eee;'>Total Amount</td>
                <td style='padding:8px 0 4px;text-align:right;color:#1a237e;font-size:16px;font-weight:bold;border-top:1px solid #eee;'>Rs. {invoice.TotalAmount:N2}</td>
              </tr>
              <tr>
                <td style='padding:4px 0;color:#666;font-size:14px;'>Paid</td>
                <td style='padding:4px 0;text-align:right;color:#333;font-size:14px;'>Rs. {invoice.PaidAmount:N2}</td>
              </tr>
              <tr>
                <td style='padding:4px 0;color:#666;font-size:14px;'>Due</td>
                <td style='padding:4px 0;text-align:right;color:{(invoice.DueAmount > 0 ? "#f44336" : "#4caf50")};font-size:14px;font-weight:bold;'>Rs. {invoice.DueAmount:N2}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;'>
            <p style='color:#999;font-size:12px;margin:0;'>This is an auto-generated email. Please do not reply.</p>
            <p style='color:#999;font-size:12px;margin:5px 0 0;'>© {DateTime.Now.Year} Vehicle Parts System. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";
    }
}
