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

        public async Task<PaginatedResponseDto<PartResponseDto>> GetAllPartsAsync(PaginationParamsDto param)
        {
            var query = _context.Parts.AsNoTracking().AsQueryable();

            // Search
            if (!string.IsNullOrWhiteSpace(param.SearchTerm))
            {
                var search = param.SearchTerm.ToLower();
                query = query.Where(p => p.PartName.ToLower().Contains(search) || 
                                         (p.Category != null && p.Category.ToLower().Contains(search)));
            }

            // Sort
            if (!string.IsNullOrWhiteSpace(param.SortBy))
            {
                query = param.SortBy.ToLower() switch
                {
                    "name" => param.SortDescending ? query.OrderByDescending(p => p.PartName) : query.OrderBy(p => p.PartName),
                    "price" => param.SortDescending ? query.OrderByDescending(p => p.UnitPrice) : query.OrderBy(p => p.UnitPrice),
                    "stock" => param.SortDescending ? query.OrderByDescending(p => p.StockQuantity) : query.OrderBy(p => p.StockQuantity),
                    _ => param.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
                };
            }
            else
            {
                query = param.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt);
            }

            var totalRecords = await query.CountAsync();
            
            var items = await query
                .Skip((param.PageNumber - 1) * param.PageSize)
                .Take(param.PageSize)
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

            return new PaginatedResponseDto<PartResponseDto>(items, totalRecords, param.PageNumber, param.PageSize);
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
