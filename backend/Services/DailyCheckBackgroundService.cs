using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class DailyCheckBackgroundService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<DailyCheckBackgroundService> _logger;

    public DailyCheckBackgroundService(IServiceProvider services, ILogger<DailyCheckBackgroundService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyCheckBackgroundService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DoWorkAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("DailyCheckBackgroundService is stopping due to cancellation.");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in DailyCheckBackgroundService. Service will retry in 24 hours.");
            }

            // Check once every 24 hours
            try
            {
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("DailyCheckBackgroundService stopped.");
    }

    private async Task DoWorkAsync(CancellationToken stoppingToken)
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        _logger.LogInformation("Running daily checks for overdue invoices and low stock...");

        await CheckOverdueInvoicesAsync(db, emailService, notificationService, stoppingToken);
        await CheckLowStockAsync(db, emailService, notificationService, stoppingToken);

        _logger.LogInformation("Daily checks completed.");
    }

    // ── Overdue Invoice Check ────────────────────────────────────────

    private async Task CheckOverdueInvoicesAsync(
        AppDbContext db,
        IEmailService emailService,
        INotificationService notificationService,
        CancellationToken stoppingToken)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var overdueInvoices = await db.SalesInvoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .Where(i => i.PaymentStatus != PaymentStatus.Paid && i.InvoiceDate < thirtyDaysAgo)
            .ToListAsync(stoppingToken);

        _logger.LogInformation("Found {Count} overdue invoices (>30 days unpaid).", overdueInvoices.Count);

        int emailsSent = 0;
        int emailsFailed = 0;

        foreach (var invoice in overdueInvoices)
        {
            stoppingToken.ThrowIfCancellationRequested();

            // ── Send email reminder ──────────────────────────────────
            try
            {
                if (!string.IsNullOrEmpty(invoice.Customer?.Email))
                {
                    string subject = $"Payment Reminder: Invoice #{invoice.Id}";
                    string body = $@"
                        <h3>Payment Reminder</h3>
                        <p>Dear {invoice.Customer.FullName},</p>
                        <p>This is a reminder that your invoice #{invoice.Id} for {invoice.DueAmount:C} is overdue.</p>
                        <p>Please arrange payment as soon as possible.</p>
                    ";

                    var success = await emailService.SendEmailAsync(invoice.Customer.Email, subject, body);
                    if (success) emailsSent++;
                    else emailsFailed++;
                }
            }
            catch (Exception ex)
            {
                emailsFailed++;
                _logger.LogError(ex, "Failed to send overdue reminder email for Invoice #{InvoiceId}", invoice.Id);
            }

            // ── Create notification (duplicate-safe via NotificationService) ──
            try
            {
                await notificationService.CreateAsync(new DTOs.CreateNotificationDto
                {
                    Type = "Alert",
                    Message = $"Invoice #{invoice.Id} for {invoice.CustomerName} is overdue (>30 days). Due: {invoice.DueAmount:C}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create notification for overdue Invoice #{InvoiceId}", invoice.Id);
            }
        }

        if (overdueInvoices.Count > 0)
        {
            _logger.LogInformation(
                "Overdue invoice processing complete — Emails sent: {Sent}, Failed: {Failed}",
                emailsSent, emailsFailed);
        }
    }

    // ── Low Stock Check ──────────────────────────────────────────────

    private async Task CheckLowStockAsync(
        AppDbContext db,
        IEmailService emailService,
        INotificationService notificationService,
        CancellationToken stoppingToken)
    {
        var lowStockParts = await db.Parts
            .AsNoTracking()
            .Where(p => p.StockQuantity < p.LowStockThreshold)
            .ToListAsync(stoppingToken);

        _logger.LogInformation("Found {Count} parts with low stock.", lowStockParts.Count);

        if (!lowStockParts.Any()) return;

        // ── Create individual notifications (duplicate-safe) ─────────
        foreach (var part in lowStockParts)
        {
            stoppingToken.ThrowIfCancellationRequested();

            try
            {
                await notificationService.CreateAsync(new DTOs.CreateNotificationDto
                {
                    Type = "System",
                    Message = $"Low stock alert: {part.PartName} has only {part.StockQuantity} units left."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create low-stock notification for Part {PartName}", part.PartName);
            }
        }

        // ── Send summary email to admin ──────────────────────────────
        try
        {
            string adminEmail = "admin@halamadrid.com";
            string subject = "Low Stock Alert!";
            string body = "<h3>The following parts are running low on stock:</h3><ul>";

            foreach (var part in lowStockParts)
            {
                body += $"<li>{part.PartName} — {part.StockQuantity} left (threshold: {part.LowStockThreshold})</li>";
            }
            body += "</ul>";

            var success = await emailService.SendEmailAsync(adminEmail, subject, body);
            if (!success)
                _logger.LogWarning("Failed to send low-stock summary email to admin.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send low-stock summary email to admin.");
        }
    }
}
