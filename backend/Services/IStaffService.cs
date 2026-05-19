using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services
{
    public interface IStaffService
    {
        Task<IEnumerable<StaffResponseDto>> GetAllStaffAsync();
        Task<StaffResponseDto?> GetStaffByIdAsync(string id);
        Task<StaffResponseDto> CreateStaffAsync(StaffCreateDto dto);
        Task<bool> UpdateStaffAsync(string id, StaffUpdateDto dto);
        Task<bool> DeleteStaffAsync(string id);
    }
}
