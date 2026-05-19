using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public interface IAppointmentService
{
    Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto);
    Task<AppointmentResponseDto> UpdateAsync(int id, UpdateAppointmentDto dto);
    Task DeleteAsync(int id);
    Task<AppointmentResponseDto> GetByIdAsync(int id);
    Task<PaginatedResponseDto<AppointmentResponseDto>> GetAllAsync(PaginationParamsDto param);
    Task<List<AppointmentResponseDto>> GetByCustomerIdAsync(int customerId);
    Task<AppointmentResponseDto> UpdateStatusAsync(int id, AppointmentStatus status);
}
