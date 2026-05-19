using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class PartRequestService : IPartRequestService
{
    private readonly AppDbContext _db;
    private readonly ILogger<PartRequestService> _logger;

    public PartRequestService(AppDbContext db, ILogger<PartRequestService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<PartRequestDto> CreateAsync(CreatePartRequestDto dto)
    {
        // Validate part name is not empty
        if (string.IsNullOrWhiteSpace(dto.PartName))
            throw new ValidationException("Part name cannot be empty.");

        // Validate quantity
        if (dto.Quantity <= 0)
            throw new ValidationException("Quantity must be at least 1.");

        // Validate customer exists
        var customer = await _db.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with id '{dto.CustomerId}' was not found.");

        var request = new PartRequest
        {
            CustomerId = dto.CustomerId,
            PartName = dto.PartName.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            Quantity = dto.Quantity,
            Status = PartRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.PartRequests.Add(request);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Part request {RequestId} created — Part: {PartName}, Customer: {CustomerId}, Qty: {Quantity}",
            request.Id, request.PartName, dto.CustomerId, dto.Quantity);

        return MapToDto(request, customer.FullName);
    }

    public async Task<PaginatedResponseDto<PartRequestDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.PartRequests
            .AsNoTracking()
            .Include(pr => pr.Customer)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            query = query.Where(pr => 
                (pr.Customer != null && pr.Customer.FullName.ToLower().Contains(search)) ||
                pr.PartName.ToLower().Contains(search));
        }

        // Filter
        if (!string.IsNullOrWhiteSpace(param.FilterBy))
        {
            if (Enum.TryParse<PartRequestStatus>(param.FilterBy, true, out var status))
            {
                query = query.Where(pr => pr.Status == status);
            }
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "part" => param.SortDescending ? query.OrderByDescending(pr => pr.PartName) : query.OrderBy(pr => pr.PartName),
                "customer" => param.SortDescending ? query.OrderByDescending(pr => pr.Customer.FullName) : query.OrderBy(pr => pr.Customer.FullName),
                "status" => param.SortDescending ? query.OrderByDescending(pr => pr.Status) : query.OrderBy(pr => pr.Status),
                _ => param.SortDescending ? query.OrderByDescending(pr => pr.CreatedAt) : query.OrderBy(pr => pr.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(pr => pr.CreatedAt) : query.OrderBy(pr => pr.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<PartRequestDto>(items.Select(pr => MapToDto(pr, pr.Customer?.FullName ?? "Unknown")).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task<PartRequestDto> GetByIdAsync(int id)
    {
        var request = await _db.PartRequests
            .AsNoTracking()
            .Include(pr => pr.Customer)
            .FirstOrDefaultAsync(pr => pr.Id == id)
            ?? throw new KeyNotFoundException($"Part request with id '{id}' was not found.");
            
        return MapToDto(request, request.Customer?.FullName ?? "Unknown");
    }

    public async Task<List<PartRequestDto>> GetByCustomerIdAsync(int customerId)
    {
        _ = await _db.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with id '{customerId}' was not found.");

        var requests = await _db.PartRequests
            .AsNoTracking()
            .Where(pr => pr.CustomerId == customerId)
            .Include(pr => pr.Customer)
            .OrderByDescending(pr => pr.CreatedAt)
            .ToListAsync();

        return requests.Select(pr => MapToDto(pr, pr.Customer?.FullName ?? "Unknown")).ToList();
    }

    public async Task<PartRequestDto> UpdateStatusAsync(int id, string status)
    {
        var request = await _db.PartRequests
            .Include(pr => pr.Customer)
            .FirstOrDefaultAsync(pr => pr.Id == id)
            ?? throw new KeyNotFoundException($"Part request with id '{id}' was not found.");

        if (string.IsNullOrWhiteSpace(status))
            throw new ValidationException("Status value is required.");

        if (!Enum.TryParse<PartRequestStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            var validValues = string.Join(", ", Enum.GetNames<PartRequestStatus>());
            throw new ValidationException($"Invalid status '{status}'. Valid values: {validValues}");
        }

        _logger.LogInformation("Part request {RequestId} status changed from {OldStatus} to {NewStatus}",
            id, request.Status, parsedStatus);

        request.Status = parsedStatus;
        await _db.SaveChangesAsync();

        return MapToDto(request, request.Customer?.FullName ?? "Unknown");
    }

    public async Task DeleteAsync(int id)
    {
        var request = await _db.PartRequests.FindAsync(id)
            ?? throw new KeyNotFoundException($"Part request with id '{id}' was not found.");

        _db.PartRequests.Remove(request);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Part request {RequestId} deleted.", id);
    }

    private static PartRequestDto MapToDto(PartRequest pr, string customerName) => new()
    {
        Id = pr.Id,
        CustomerId = pr.CustomerId,
        CustomerName = customerName,
        PartName = pr.PartName,
        Description = pr.Description,
        Quantity = pr.Quantity,
        Status = pr.Status.ToString(),
        CreatedAt = pr.CreatedAt
    };
}
