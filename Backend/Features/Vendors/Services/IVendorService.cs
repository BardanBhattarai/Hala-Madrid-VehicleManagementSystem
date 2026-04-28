using VehiclePartsSystem.Features.Vendors.DTOs;

namespace VehiclePartsSystem.Features.Vendors.Services;

public interface IVendorService
{
    Task<List<VendorDto>> GetAllAsync();
    Task<VendorDto> GetByIdAsync(Guid id);
    Task<VendorDto> CreateAsync(CreateVendorDto dto);
    Task<VendorDto> UpdateAsync(Guid id, UpdateVendorDto dto);
    Task DeleteAsync(Guid id);
}
