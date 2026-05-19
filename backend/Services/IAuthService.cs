using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterUserAsync(RegisterDto model);
        Task<ApiResponse<AuthResponseDto>> LoginUserAsync(LoginDto model);
        Task<ApiResponse<AuthResponseDto>> GetCurrentUserAsync(string userId);
    }
}
