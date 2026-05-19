using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

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

    public async Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto)
    {
        // 1. Validate customer exists
        var customer = await _db.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with id '{dto.CustomerId}' was not found.");

        // 2. Validate paid amount is not negative
        if (dto.PaidAmount < 0)
            throw new ValidationException("Paid amount cannot be negative.");

        // 3. Validate items exist
        if (dto.Items == null || dto.Items.Count == 0)
            throw new ValidationException("At least one invoice item is required.");

        // 4. Validate and load all requested parts
        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        foreach (var item in dto.Items)
        {
            var part = parts.FirstOrDefault(p => p.Id == item.PartId)
                ?? throw new KeyNotFoundException($"Part with id '{item.PartId}' was not found.");

            if (item.Quantity <= 0)
                throw new ValidationException($"Quantity for part '{part.PartName}' must be at least 1.");

            if (part.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for '{part.PartName}'. Available: {part.StockQuantity}, Requested: {item.Quantity}.");
        }

        // 5. Calculate totals
        decimal subTotal = dto.Items.Sum(item =>
            item.Quantity * parts.First(p => p.Id == item.PartId).UnitPrice);

        // Feature 16: Loyalty Program Logic
        // Apply 10% discount ONLY if a SINGLE purchase total exceeds 5000.
        // This is backend validated and prevents duplicate discount application.
        decimal discountAmount = subTotal > 5000m ? Math.Round(subTotal * 0.10m, 2) : 0m;
        decimal totalAmount = subTotal - discountAmount;

        // Ensure total is never negative
        if (totalAmount < 0)
        {
            _logger.LogWarning(
                "Discount calculation resulted in negative total. SubTotal: {SubTotal}, Discount: {Discount}. Clamping to 0.",
                subTotal, discountAmount);
            totalAmount = 0;
        }

        // Ensure paid amount does not exceed total
        if (dto.PaidAmount > totalAmount)
            throw new ValidationException(
                $"Paid amount ({dto.PaidAmount:C}) cannot exceed total amount ({totalAmount:C}).");

        decimal dueAmount = totalAmount - dto.PaidAmount;

        var paymentStatus = dto.PaidAmount >= totalAmount ? PaymentStatus.Paid
            : dto.PaidAmount > 0 ? PaymentStatus.Partial
            : PaymentStatus.Unpaid;

        if (discountAmount > 0)
        {
            _logger.LogInformation(
                "Loyalty discount applied — Customer: {CustomerId}, SubTotal: {SubTotal:C}, Discount: {Discount:C} (10%)",
                dto.CustomerId, subTotal, discountAmount);
        }

        // 6. Persist inside a transaction
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

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Invoice {InvoiceId} created — Customer: {CustomerId}, Total: {Total:C}, Status: {Status}",
                invoice.Id, dto.CustomerId, totalAmount, paymentStatus);

            return await GetByIdAsync(invoice.Id);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Transaction rolled back for invoice creation — Customer: {CustomerId}", dto.CustomerId);
            throw;
        }
    }

    public async Task<PaginatedResponseDto<SalesInvoiceDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.SalesInvoices
            .AsNoTracking()
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            query = query.Where(si => 
                (si.CustomerName != null && si.CustomerName.ToLower().Contains(search)) ||
                (si.Customer != null && si.Customer.FullName.ToLower().Contains(search)));
        }

        // Filter
        if (!string.IsNullOrWhiteSpace(param.FilterBy))
        {
            if (Enum.TryParse<PaymentStatus>(param.FilterBy, true, out var status))
            {
                query = query.Where(si => si.PaymentStatus == status);
            }
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "date" => param.SortDescending ? query.OrderByDescending(si => si.InvoiceDate) : query.OrderBy(si => si.InvoiceDate),
                "customer" => param.SortDescending ? query.OrderByDescending(si => si.CustomerName ?? (si.Customer != null ? si.Customer.FullName : "")) : query.OrderBy(si => si.CustomerName ?? (si.Customer != null ? si.Customer.FullName : "")),
                "total" => param.SortDescending ? query.OrderByDescending(si => si.TotalAmount) : query.OrderBy(si => si.TotalAmount),
                "status" => param.SortDescending ? query.OrderByDescending(si => si.PaymentStatus) : query.OrderBy(si => si.PaymentStatus),
                _ => param.SortDescending ? query.OrderByDescending(si => si.CreatedAt) : query.OrderBy(si => si.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(si => si.CreatedAt) : query.OrderBy(si => si.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<SalesInvoiceDto>(items.Select(MapToDto).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task<SalesInvoiceDto> GetByIdAsync(int id)
    {
        var invoice = await _db.SalesInvoices
            .AsNoTracking()
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(si => si.Id == id)
            ?? throw new KeyNotFoundException($"Invoice with id '{id}' was not found.");
        return MapToDto(invoice);
    }

    public async Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId)
    {
        var invoices = await _db.SalesInvoices
            .AsNoTracking()
            .Where(si => (int)(si.CustomerId ?? 0) == customerId)
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .OrderByDescending(si => si.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<bool> SendInvoiceEmailAsync(int invoiceId)
    {
        var invoice = await _db.SalesInvoices
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(si => si.Id == invoiceId)
            ?? throw new KeyNotFoundException($"Invoice with id '{invoiceId}' was not found.");

        var customerEmail = invoice.Customer?.Email ?? string.Empty;
        if (string.IsNullOrWhiteSpace(customerEmail))
        {
            _logger.LogWarning("Cannot send invoice email — customer email is empty");
            return false;
        }

        var subject = $"Invoice #{invoice.Id} - FleetFlow Vehicle Management";

        var itemsRows = string.Join("\n", invoice.Items.Select(item => $@"
            <tr>
                <td style='padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;'>{item.Part?.PartName ?? "Unknown Part"}</td>
                <td style='padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;'>{item.Quantity}</td>
                <td style='padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;'>Rs. {item.UnitPrice:N2}</td>
                <td style='padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;'>Rs. {item.TotalPrice:N2}</td>
            </tr>"));

        var body = $@"
        <div style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;"">
            <div style=""text-align: center; margin-bottom: 30px;"">
                <h2 style=""color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800;"">FleetFlow</h2>
                <p style=""color: #64748b; margin: 5px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; tracking-wider: 1px;"">Vehicle Management System</p>
            </div>
            
            <div style=""background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;"">
                <h3 style=""margin-top: 0; color: #1e293b; font-size: 18px;"">Invoice Details</h3>
                <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b; font-weight: 600;"">Invoice ID:</td>
                        <td style=""padding: 4px 0; color: #1e293b; font-weight: 700; text-align: right;"">#{invoice.Id}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b; font-weight: 600;"">Date:</td>
                        <td style=""padding: 4px 0; color: #1e293b; text-align: right;"">{invoice.InvoiceDate:MMMM dd, yyyy}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b; font-weight: 600;"">Customer Name:</td>
                        <td style=""padding: 4px 0; color: #1e293b; font-weight: 700; text-align: right;"">{invoice.Customer?.FullName ?? invoice.CustomerName}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b; font-weight: 600;"">Payment Status:</td>
                        <td style=""padding: 4px 0; text-align: right;"">
                            <span style=""background-color: {(invoice.PaymentStatus == PaymentStatus.Paid ? "#d1fae5" : invoice.PaymentStatus == PaymentStatus.Partial ? "#fef3c7" : "#fee2e2")}; color: {(invoice.PaymentStatus == PaymentStatus.Paid ? "#065f46" : invoice.PaymentStatus == PaymentStatus.Partial ? "#92400e" : "#991b1b")}; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase;"">{invoice.PaymentStatus}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <h3 style=""color: #1e293b; margin-bottom: 15px; font-size: 16px;"">Items Ordered</h3>
            <table style=""width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;"">
                <thead>
                    <tr style=""background-color: #f1f5f9; text-align: left;"">
                        <th style=""padding: 10px; color: #475569; font-weight: bold; border-bottom: 2px solid #cbd5e1;"">Item Name</th>
                        <th style=""padding: 10px; color: #475569; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-align: center;"">Qty</th>
                        <th style=""padding: 10px; color: #475569; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-align: right;"">Unit Price</th>
                        <th style=""padding: 10px; color: #475569; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-align: right;"">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsRows}
                </tbody>
            </table>

            <div style=""width: 100%; max-width: 250px; margin-left: auto; font-size: 14px; color: #1e293b;"">
                <table style=""width: 100%; border-collapse: collapse;"">
                    <tr>
                        <td style=""padding: 6px 0; color: #64748b; font-weight: 600;"">Subtotal:</td>
                        <td style=""padding: 6px 0; text-align: right;"">Rs. {invoice.SubTotal:N2}</td>
                    </tr>
                    {(invoice.DiscountAmount > 0 ? $@"
                    <tr>
                        <td style='padding: 6px 0; color: #16a34a; font-weight: 600;'>Discount (10%):</td>
                        <td style='padding: 6px 0; text-align: right; color: #16a34a;'>- Rs. {invoice.DiscountAmount:N2}</td>
                    </tr>" : "")}
                    <tr style=""border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: bold;"">
                        <td style=""padding: 10px 0; color: #1e293b;"">Grand Total:</td>
                        <td style=""padding: 10px 0; text-align: right; color: #4f46e5; font-size: 18px;"">Rs. {invoice.TotalAmount:N2}</td>
                    </tr>
                    <tr style=""font-weight: bold;"">
                        <td style=""padding: 6px 0; color: #64748b;"">Amount Paid:</td>
                        <td style=""padding: 6px 0; text-align: right;"">Rs. {invoice.PaidAmount:N2}</td>
                    </tr>
                    <tr style=""font-weight: bold; border-top: 1px dashed #e2e8f0;"">
                        <td style=""padding: 10px 0; color: #991b1b;"">Balance Due:</td>
                        <td style=""padding: 10px 0; text-align: right; color: #991b1b;"">Rs. {invoice.DueAmount:N2}</td>
                    </tr>
                </table>
            </div>

            <div style=""text-align: center; border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px; color: #64748b; font-size: 12px; font-weight: 500;"">
                <p style=""margin: 0;"">Thank you for your business!</p>
                <p style=""margin: 5px 0 0 0;"">For support or queries, contact us at contact@fleetflow.com</p>
            </div>
        </div>";

        return await _emailService.SendEmailAsync(customerEmail, subject, body);
    }

    private static SalesInvoiceDto MapToDto(SalesInvoice si) => new()
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
        PaymentStatus = si.PaymentStatus.ToString(),
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
