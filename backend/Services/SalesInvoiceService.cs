using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

/// <summary>
/// Sales invoice service with email integration (Feature 11).
/// Sends invoice email automatically after successful invoice creation.
/// </summary>
public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly ILogger<SalesInvoiceService> _logger;

    public SalesInvoiceService(AppDbContext db, IEmailService emailService, ILogger<SalesInvoiceService> logger)
    {
        _db = db;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new sales invoice. After successful creation, sends an
    /// invoice email to the customer (Feature 11). Email failures do NOT
    /// roll back the invoice — they are logged and handled gracefully.
    /// </summary>
    public async Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto)
    {
        // 1. Validate customer exists
        var customer = await _db.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with id '{dto.CustomerId}' was not found.");

        // 2. Validate and load all requested parts
        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        var requestedQuantities = dto.Items
            .GroupBy(i => i.PartId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

        foreach (var kvp in requestedQuantities)
        {
            var partId = kvp.Key;
            var requestedQty = kvp.Value;
            var part = parts.FirstOrDefault(p => p.Id == partId)
                ?? throw new KeyNotFoundException($"Part with id '{partId}' was not found.");

            if (part.StockQuantity < requestedQty)
                throw new InvalidOperationException(
                    $"Insufficient stock for {part.PartName} (Available: {part.StockQuantity}, Requested: {requestedQty})");
        }

        // 3. Calculate totals
        decimal subTotal = dto.Items.Sum(item =>
            item.Quantity * parts.First(p => p.Id == item.PartId).UnitPrice);

        decimal discountAmount = subTotal > 5000m ? Math.Round(subTotal * 0.10m, 2) : 0m;
        decimal totalAmount = subTotal - discountAmount;
        decimal dueAmount = totalAmount - dto.PaidAmount;

        var paymentStatus = dto.PaidAmount >= totalAmount ? PaymentStatus.Paid
            : dto.PaidAmount > 0 ? PaymentStatus.Partial
            : PaymentStatus.Unpaid;

        // 4. Persist inside a transaction
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var invoice = new SalesInvoice
            {
                CustomerId = dto.CustomerId,
                CustomerName = customer.FullName,
                StaffId = dto.StaffId,
                InvoiceDate = DateTime.UtcNow,
                SubTotal = subTotal,
                DiscountAmount = discountAmount,
                TotalAmount = totalAmount,
                PaidAmount = dto.PaidAmount,
                DueAmount = dueAmount,
                PaymentStatus = paymentStatus,
                CreatedAt = DateTime.UtcNow
            };

            _db.SalesInvoices.Add(invoice);
            await _db.SaveChangesAsync(); // Generate Invoice ID

            foreach (var itemDto in dto.Items)
            {
                var part = parts.First(p => p.Id == itemDto.PartId);
                
                var invoiceItem = new SalesInvoiceItem
                {
                    SalesInvoiceId = invoice.Id,
                    PartId = itemDto.PartId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = part.UnitPrice,
                    TotalPrice = itemDto.Quantity * part.UnitPrice
                };
                
                _db.SalesInvoiceItems.Add(invoiceItem);
                part.StockQuantity -= itemDto.Quantity;
            }

            // Update customer credit balance if there is a due amount
            if (dueAmount > 0)
            {
                customer.CreditBalance += dueAmount;
                _logger.LogInformation("Customer {Id} credit balance updated by {Amount}", customer.Id, dueAmount);
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var invoiceDto = await GetByIdAsync(invoice.Id);

            // 5. Feature 11: Send invoice email (fire-and-forget, failures are logged)
            if (!string.IsNullOrWhiteSpace(customer.Email))
            {
                _ = Task.Run(async () =>
                {
                    await _emailService.SendInvoiceEmailAsync(customer.Email, customer.FullName, invoiceDto);
                });
                _logger.LogInformation("Invoice email queued for customer {Email}", customer.Email);
            }
            else
            {
                _logger.LogWarning("No email address for customer {Id}, skipping invoice email", customer.Id);
            }

            return invoiceDto;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PaginatedResponseDto<SalesInvoiceDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.SalesInvoices
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var term = param.SearchTerm.Trim().ToLowerInvariant();
            query = query.Where(si => (si.CustomerName ?? string.Empty).ToLower().Contains(term)
                                       || si.Id.ToString().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(si => si.InvoiceDate)
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .Select(si => MapToDto(si))
            .ToListAsync();

        return new PaginatedResponseDto<SalesInvoiceDto>(items, total, param.PageNumber, param.PageSize);
    }

    public async Task<SalesInvoiceDto> GetByIdAsync(int id)
    {
        var invoice = await _db.SalesInvoices
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(si => si.Id == id)
            ?? throw new KeyNotFoundException($"Invoice with id '{id}' was not found.");
        return MapToDto(invoice);
    }

    public async Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId)
        => await _db.SalesInvoices
            .Where(si => (int)(si.CustomerId ?? 0) == customerId)
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .Select(si => MapToDto(si))
            .ToListAsync();

    /// <summary>
    /// Feature 11: Resend an existing invoice email to the customer.
    /// </summary>
    public async Task<bool> ResendInvoiceEmailAsync(int invoiceId)
    {
        var invoice = await _db.SalesInvoices
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(si => si.Id == invoiceId)
            ?? throw new KeyNotFoundException($"Invoice with id '{invoiceId}' was not found.");

        var customer = invoice.Customer
            ?? throw new InvalidOperationException("Invoice has no associated customer.");

        if (string.IsNullOrWhiteSpace(customer.Email))
            throw new InvalidOperationException($"Customer '{customer.FullName}' has no email address on file.");

        var invoiceDto = MapToDto(invoice);
        var sent = await _emailService.SendInvoiceEmailAsync(customer.Email, customer.FullName, invoiceDto);

        _logger.LogInformation("Resend invoice email for Invoice #{Id}: {Result}", invoiceId, sent ? "Success" : "Failed");
        return sent;
    }

    private static SalesInvoiceDto MapToDto(SalesInvoice si)
    {
        var paymentStatus = EvaluateInvoicePaymentStatus(si).ToString();
        return new SalesInvoiceDto
        {
            Id = si.Id,
            CustomerId = (int)(si.CustomerId ?? 0),
            CustomerName = si.Customer?.FullName ?? si.CustomerName ?? "Unknown Customer",
            StaffId = si.StaffId,
            InvoiceDate = si.InvoiceDate,
            SubTotal = si.SubTotal,
            DiscountAmount = si.DiscountAmount,
            TotalAmount = si.TotalAmount,
            PaidAmount = si.PaidAmount,
            DueAmount = si.DueAmount,
            PaymentStatus = paymentStatus,
            CreatedAt = si.CreatedAt,
            Items = si.Items.Select(i => new SalesInvoiceItemDto
            {
                Id = i.Id,
                PartId = i.PartId,
                PartName = i.Part?.PartName ?? "Unknown Part",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }

    private static PaymentStatus EvaluateInvoicePaymentStatus(SalesInvoice si)
    {
        if (!si.Items.Any())
        {
            return PaymentStatus.Unpaid;
        }

        return si.PaymentStatus == PaymentStatus.Unpaid
            ? PaymentStatus.Paid
            : si.PaymentStatus;
    }
}
