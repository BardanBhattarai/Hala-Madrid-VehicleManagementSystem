using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;



using VehicleManagement.Models;
namespace VehicleManagement.Services
{
    public class PartService : IPartService
    {
        private readonly AppDbContext _context;

        public PartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PartResponseDto>> GetAllPartsAsync()
        {
            return await _context.Parts
                .Select(p => new PartResponseDto
                {
                    Id = p.Id,
                    PartName = p.PartName,
                    Category = p.Category,
                    UnitPrice = p.UnitPrice,
                    StockQuantity = p.StockQuantity,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<PartResponseDto?> GetPartByIdAsync(int id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return null;

            return new PartResponseDto
            {
                Id = part.Id,
                PartName = part.PartName,
                Category = part.Category,
                UnitPrice = part.UnitPrice,
                StockQuantity = part.StockQuantity,
                CreatedAt = part.CreatedAt
            };
        }

        public async Task<PartResponseDto> CreatePartAsync(PartCreateDto dto)
        {
            var part = new Part
            {
                PartName = dto.PartName,
                Category = dto.Category,
                UnitPrice = dto.UnitPrice,
                StockQuantity = dto.StockQuantity,
                CreatedAt = DateTime.UtcNow
            };

            _context.Parts.Add(part);
            await _context.SaveChangesAsync();

            return new PartResponseDto
            {
                Id = part.Id,
                PartName = part.PartName,
                Category = part.Category,
                UnitPrice = part.UnitPrice,
                StockQuantity = part.StockQuantity,
                CreatedAt = part.CreatedAt
            };
        }

        public async Task<PartResponseDto?> UpdatePartAsync(int id, PartUpdateDto dto)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return null;

            part.PartName = dto.PartName;
            part.Category = dto.Category;
            part.UnitPrice = dto.UnitPrice;
            part.StockQuantity = dto.StockQuantity;

            await _context.SaveChangesAsync();

            return new PartResponseDto
            {
                Id = part.Id,
                PartName = part.PartName,
                Category = part.Category,
                UnitPrice = part.UnitPrice,
                StockQuantity = part.StockQuantity,
                CreatedAt = part.CreatedAt
            };
        }

        public async Task<bool> DeletePartAsync(int id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return false;

            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
