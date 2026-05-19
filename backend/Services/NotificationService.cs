using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(AppDbContext db, ILogger<NotificationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto)
    {
        // Prevent duplicate notifications with the same message within 24 hours
        var recentDuplicate = await _db.Notifications
            .AnyAsync(n => n.Message == dto.Message
                        && n.Type == dto.Type
                        && n.CreatedAt > DateTime.UtcNow.AddHours(-24));

        if (recentDuplicate)
        {
            _logger.LogInformation("Duplicate notification suppressed — Type: {Type}, Message: {Message}",
                dto.Type, dto.Message);

            // Return the existing notification instead of creating a duplicate
            var existing = await _db.Notifications
                .Where(n => n.Message == dto.Message && n.Type == dto.Type)
                .OrderByDescending(n => n.CreatedAt)
                .FirstAsync();

            return MapToDto(existing);
        }

        var notification = new Notification
        {
            Type = dto.Type,
            Message = dto.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Notification {NotificationId} created — Type: {Type}",
            notification.Id, dto.Type);

        return MapToDto(notification);
    }

    public async Task<List<NotificationDto>> GetUnreadAsync()
    {
        return await _db.Notifications
            .AsNoTracking()
            .Where(n => !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => MapToDto(n))
            .ToListAsync();
    }

    public async Task<PaginatedResponseDto<NotificationDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.Notifications.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            query = query.Where(n => n.Message.ToLower().Contains(search) || 
                                     n.Type.ToLower().Contains(search));
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "type" => param.SortDescending ? query.OrderByDescending(n => n.Type) : query.OrderBy(n => n.Type),
                "read" => param.SortDescending ? query.OrderByDescending(n => n.IsRead) : query.OrderBy(n => n.IsRead),
                _ => param.SortDescending ? query.OrderByDescending(n => n.CreatedAt) : query.OrderBy(n => n.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(n => n.CreatedAt) : query.OrderBy(n => n.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<NotificationDto>(items.Select(MapToDto).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task MarkAsReadAsync(int id)
    {
        var notification = await _db.Notifications.FindAsync(id)
            ?? throw new KeyNotFoundException($"Notification with id '{id}' was not found.");
            
        notification.IsRead = true;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Notification {NotificationId} marked as read.", id);
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        Type = n.Type,
        Message = n.Message,
        IsRead = n.IsRead,
        CreatedAt = n.CreatedAt
    };
}
