using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("unread")]
    [ProducesResponseType(typeof(ApiResponse<List<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetUnread()
    {
        var notifications = await _notificationService.GetUnreadAsync();
        return Ok(ApiResponse<List<NotificationDto>>.SuccessResponse(notifications));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponseDto<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParamsDto param)
    {
        var notifications = await _notificationService.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<NotificationDto>>.SuccessResponse(notifications));
    }

    [HttpPatch("{id:int}/read")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(int id)
    {
        await _notificationService.MarkAsReadAsync(id);
        return Ok(ApiResponse<object>.SuccessResponse(new object(), "Notification marked as read"));
    }
}
