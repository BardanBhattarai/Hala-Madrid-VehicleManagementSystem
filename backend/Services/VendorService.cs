using Microsoft.EntityFrameworkCore;


using VehicleManagement.DTOs;
using VehicleManagement.Data;


using VehicleManagement.Models;
namespace VehicleManagement.Services;

public class VendorService : IVendorService
{
    private readonly AppDbContext _db;

    public VendorService(AppDbContext db) => _db = db;

    public async Task<PaginatedResponseDto<VendorDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.Vendors.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            query = query.Where(v => v.VendorName.ToLower().Contains(search) || 
                                     (v.CompanyName != null && v.CompanyName.ToLower().Contains(search)));
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "name" => param.SortDescending ? query.OrderByDescending(v => v.VendorName) : query.OrderBy(v => v.VendorName),
                "company" => param.SortDescending ? query.OrderByDescending(v => v.CompanyName) : query.OrderBy(v => v.CompanyName),
                _ => param.SortDescending ? query.OrderByDescending(v => v.CreatedAt) : query.OrderBy(v => v.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(v => v.CreatedAt) : query.OrderBy(v => v.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<VendorDto>(items.Select(MapToDto).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task<VendorDto> GetByIdAsync(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id)
            ?? throw new System.Exception($"Vendor with id '{id}' was not found.");
        return MapToDto(vendor);
    }

    public async Task<VendorDto> CreateAsync(CreateVendorDto dto)
    {
        var vendor = new Vendor
        {
            Id = 0,
            VendorName = dto.VendorName,
            ContactPerson = dto.ContactPerson,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Address = dto.Address,
            CompanyName = dto.CompanyName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync();
        return MapToDto(vendor);
    }

    public async Task<VendorDto> UpdateAsync(int id, UpdateVendorDto dto)
    {
        var vendor = await _db.Vendors.FindAsync(id)
            ?? throw new System.Exception($"Vendor with id '{id}' was not found.");

        vendor.VendorName = dto.VendorName;
        vendor.ContactPerson = dto.ContactPerson;
        vendor.PhoneNumber = dto.PhoneNumber;
        vendor.Email = dto.Email;
        vendor.Address = dto.Address;
        vendor.CompanyName = dto.CompanyName;
        vendor.IsActive = dto.IsActive;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(vendor);
    }

    public async Task DeleteAsync(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id)
            ?? throw new System.Exception($"Vendor with id '{id}' was not found.");
        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync();
    }

    private static VendorDto MapToDto(Vendor v) => new()
    {
        Id = v.Id,
        VendorName = v.VendorName,
        ContactPerson = v.ContactPerson,
        PhoneNumber = v.PhoneNumber,
        Email = v.Email,
        Address = v.Address,
        CompanyName = v.CompanyName,
        IsActive = v.IsActive,
        CreatedAt = v.CreatedAt,
        UpdatedAt = v.UpdatedAt
    };
}
