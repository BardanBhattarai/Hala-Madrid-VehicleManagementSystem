using VehicleManagement.DTOs;

namespace VehicleManagement.Services
{
    public interface IPartService
    {
        Task<IEnumerable<PartResponseDto>> GetAllPartsAsync();
        Task<PartResponseDto?> GetPartByIdAsync(int id);
        Task<PartResponseDto> CreatePartAsync(PartCreateDto dto);
        Task<PartResponseDto?> UpdatePartAsync(int id, PartUpdateDto dto);
        Task<bool> DeletePartAsync(int id);
    }
}
