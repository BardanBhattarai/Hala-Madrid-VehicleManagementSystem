using VehicleManagement.DTOs;

namespace VehicleManagement.Services;

public interface IPartRequestService
{
    Task<PartRequestDto> CreateAsync(CreatePartRequestDto dto);
    Task<PaginatedResponseDto<PartRequestDto>> GetAllAsync(PaginationParamsDto param);
    Task<PartRequestDto> GetByIdAsync(int id);
    Task<List<PartRequestDto>> GetByCustomerIdAsync(int customerId);
    Task<PartRequestDto> UpdateStatusAsync(int id, string status);
    Task DeleteAsync(int id);
}
