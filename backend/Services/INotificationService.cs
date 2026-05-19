using VehicleManagement.DTOs;

namespace VehicleManagement.Services;

public interface INotificationService
{
    Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
    Task<List<NotificationDto>> GetUnreadAsync();
    Task<PaginatedResponseDto<NotificationDto>> GetAllAsync(PaginationParamsDto param);
    Task MarkAsReadAsync(int id);
}
