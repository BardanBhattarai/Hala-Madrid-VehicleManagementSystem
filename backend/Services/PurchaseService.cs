using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services
{
    public class PurchaseService : IPurchaseService
    {
        private readonly AppDbContext _context;

        public PurchaseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PurchaseInvoiceResponseDto> CreatePurchaseInvoiceAsync(PurchaseInvoiceCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoice = new PurchaseInvoice
                {
                    InvoiceNumber = dto.InvoiceNumber,
                    PurchaseDate = dto.PurchaseDate,
                    SupplierName = dto.SupplierName,
                    TotalAmount = 0 // Will calculate
                };

                decimal totalAmount = 0;

                foreach (var itemDto in dto.Items)
                {
                    var part = await _context.Parts.FindAsync(itemDto.PartId);
                    if (part == null)
                        throw new Exception($"Part with ID {itemDto.PartId} not found.");

                    // Increase stock logic
                    part.StockQuantity += itemDto.Quantity;

                    var item = new PurchaseInvoiceItem
                    {
                        PartId = itemDto.PartId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.UnitPrice,
                        TotalPrice = itemDto.Quantity * itemDto.UnitPrice
                    };

                    invoice.Items.Add(item);
                    totalAmount += item.TotalPrice;
                }

                invoice.TotalAmount = totalAmount;

                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetInvoiceByIdAsync(invoice.Id) ?? throw new Exception("Error retrieving created invoice.");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<PurchaseInvoiceResponseDto>> GetAllInvoicesAsync()
        {
            return await _context.PurchaseInvoices
                .Include(i => i.Items)
                .ThenInclude(it => it.Part)
                .OrderByDescending(i => i.PurchaseDate)
                .Select(i => MapToResponse(i))
                .ToListAsync();
        }

        public async Task<PurchaseInvoiceResponseDto?> GetInvoiceByIdAsync(int id)
        {
            var invoice = await _context.PurchaseInvoices
                .Include(i => i.Items)
                .ThenInclude(it => it.Part)
                .FirstOrDefaultAsync(i => i.Id == id);

            return invoice != null ? MapToResponse(invoice) : null;
        }

        private static PurchaseInvoiceResponseDto MapToResponse(PurchaseInvoice i)
        {
            return new PurchaseInvoiceResponseDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                PurchaseDate = i.PurchaseDate,
                TotalAmount = i.TotalAmount,
                SupplierName = i.SupplierName,
                CreatedAt = i.CreatedAt,
                Items = i.Items.Select(it => new PurchaseInvoiceItemResponseDto
                {
                    Id = it.Id,
                    PartId = it.PartId,
                    PartName = it.Part?.PartName ?? "Unknown Part",
                    Quantity = it.Quantity,
                    UnitPrice = it.UnitPrice,
                    TotalPrice = it.TotalPrice
                }).ToList()
            };
        }
    }
}
