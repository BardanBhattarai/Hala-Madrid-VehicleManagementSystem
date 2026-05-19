using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly AppDbContext _db;
    private readonly ILogger<SalesInvoiceService> _logger;

    public SalesInvoiceService(AppDbContext db, ILogger<SalesInvoiceService> logger)
    {
        _db = db;
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
