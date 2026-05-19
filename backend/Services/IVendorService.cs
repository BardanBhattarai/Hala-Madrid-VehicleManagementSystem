using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services;

public interface IVendorService
{
    Task<PaginatedResponseDto<VendorDto>> GetAllAsync(PaginationParamsDto param);
    Task<VendorDto> GetByIdAsync(int id);
    Task<VendorDto> CreateAsync(CreateVendorDto dto);
    Task<VendorDto> UpdateAsync(int id, UpdateVendorDto dto);
    Task DeleteAsync(int id);
}
