using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services
{
    public interface IStaffService
    {
        Task<IEnumerable<StaffResponseDto>> GetAllStaffAsync();
        Task<StaffResponseDto?> GetStaffByIdAsync(int id);
        Task<StaffResponseDto> CreateStaffAsync(StaffCreateDto dto);
        Task<bool> UpdateStaffAsync(int id, StaffUpdateDto dto);
        Task<bool> DeleteStaffAsync(int id);
    }
}
