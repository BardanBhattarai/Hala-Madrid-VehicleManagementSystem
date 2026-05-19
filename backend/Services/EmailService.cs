using System.Net.Mail;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace VehicleManagement.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    private const int MaxRetryAttempts = 3;
    private static readonly TimeSpan[] RetryDelays = 
    {
        TimeSpan.FromSeconds(1),
        TimeSpan.FromSeconds(3),
        TimeSpan.FromSeconds(5)
    };

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        // ── Validate email address ───────────────────────────────────
        if (string.IsNullOrWhiteSpace(to))
        {
            _logger.LogWarning("Email send skipped — recipient address is empty");
            return false;
        }

        if (!IsValidEmail(to))
        {
            _logger.LogWarning("Email send skipped — invalid recipient address: {To}", to);
            return false;
        }

        // ── Retry loop ──────────────────────────────────────────────
        for (int attempt = 1; attempt <= MaxRetryAttempts; attempt++)
        {
            try
            {
                await SendMailInternalAsync(to, subject, body);

                _logger.LogInformation(
                    "Email sent successfully to {To} — Subject: {Subject} (attempt {Attempt})",
                    to, subject, attempt);

                return true;
            }
            catch (MailKit.Security.AuthenticationException ex)
            {
                // Authentication failures won't be fixed by retrying
                _logger.LogError(ex,
                    "SMTP authentication failed sending email to {To} — aborting retries: {Message}",
                    to, ex.Message);
                return false;
            }
            catch (SmtpCommandException ex)
            {
                _logger.LogError(ex,
                    "SMTP command error sending email to {To} — attempt {Attempt}/{Max}: {Message}",
                    to, attempt, MaxRetryAttempts, ex.Message);
            }
            catch (SmtpProtocolException ex)
            {
                _logger.LogError(ex,
                    "SMTP protocol error sending email to {To} — attempt {Attempt}/{Max}: {Message}",
                    to, attempt, MaxRetryAttempts, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Unexpected error sending email to {To} — attempt {Attempt}/{Max}: {Message}",
                    to, attempt, MaxRetryAttempts, ex.Message);
            }

            // Wait before retrying (except on last attempt)
            if (attempt < MaxRetryAttempts)
            {
                var delay = RetryDelays[attempt - 1];
                _logger.LogWarning("Retrying email send to {To} after {Delay}s...", to, delay.TotalSeconds);
                await Task.Delay(delay);
            }
        }

        _logger.LogError("All {MaxRetryAttempts} email send attempts failed for {To}", MaxRetryAttempts, to);
        return false;
    }

    // ── Internal send method ─────────────────────────────────────────

    private async Task SendMailInternalAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        var senderName = _config["SmtpSettings:SenderName"] ?? "FleetFlow";
        var senderEmail = _config["SmtpSettings:SenderEmail"] ?? "noreply@halamadrid.com";

        email.From.Add(new MailboxAddress(senderName, senderEmail));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = body };
        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();
        var server = _config["SmtpSettings:Server"] ?? "smtp.ethereal.email";
        var port = int.Parse(_config["SmtpSettings:Port"] ?? "587");
        var username = _config["SmtpSettings:Username"] ?? string.Empty;
        var password = _config["SmtpSettings:Password"] ?? string.Empty;

        await smtp.ConnectAsync(server, port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(username, password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }

    // ── Helper ───────────────────────────────────────────────────────

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
