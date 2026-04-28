using Microsoft.EntityFrameworkCore;
using VehiclePartsSystem.Common.Exceptions;
using VehiclePartsSystem.Domain.Entities;
using VehiclePartsSystem.Features.SalesInvoices.DTOs;
using VehiclePartsSystem.Infrastructure.Data;

namespace VehiclePartsSystem.Features.SalesInvoices.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly ApplicationDbContext _db;

    public SalesInvoiceService(ApplicationDbContext db) => _db = db;

    public async Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto)
    {
        // 1. Validate customer exists
        _ = await _db.Customers.FindAsync(dto.CustomerId)
            ?? throw new NotFoundException($"Customer with id '{dto.CustomerId}' was not found.");

        // 2. Validate and load all requested parts
        var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
        var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        foreach (var item in dto.Items)
        {
            var part = parts.FirstOrDefault(p => p.Id == item.PartId)
                ?? throw new NotFoundException($"Part with id '{item.PartId}' was not found.");

            if (part.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for '{part.PartName}'. Available: {part.StockQuantity}, Requested: {item.Quantity}.");
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

        // 4. Persist inside a transaction: invoice + items + stock deduction
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var invoice = new SalesInvoice
            {
                Id = Guid.NewGuid(),
                CustomerId = dto.CustomerId,
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

            foreach (var itemDto in dto.Items)
            {
                var part = parts.First(p => p.Id == itemDto.PartId);
                _db.SalesInvoiceItems.Add(new SalesInvoiceItem
                {
                    Id = Guid.NewGuid(),
                    SalesInvoiceId = invoice.Id,
                    PartId = itemDto.PartId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = part.UnitPrice,
                    TotalPrice = itemDto.Quantity * part.UnitPrice
                });
                part.StockQuantity -= itemDto.Quantity;
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetByIdAsync(invoice.Id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<SalesInvoiceDto>> GetAllAsync()
        => await _db.SalesInvoices
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .Select(si => MapToDto(si))
            .ToListAsync();

    public async Task<SalesInvoiceDto> GetByIdAsync(Guid id)
    {
        var invoice = await _db.SalesInvoices
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(si => si.Id == id)
            ?? throw new NotFoundException($"Invoice with id '{id}' was not found.");
        return MapToDto(invoice);
    }

    public async Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(Guid customerId)
        => await _db.SalesInvoices
            .Where(si => si.CustomerId == customerId)
            .Include(si => si.Customer)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .Select(si => MapToDto(si))
            .ToListAsync();

    private static SalesInvoiceDto MapToDto(SalesInvoice si) => new()
    {
        Id = si.Id,
        CustomerId = si.CustomerId,
        CustomerName = si.Customer.FullName,
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
            PartName = i.Part.PartName,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            TotalPrice = i.TotalPrice
        }).ToList()
    };
}
