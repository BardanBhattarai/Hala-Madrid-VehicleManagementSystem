using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(AppDbContext db, ILogger<ReviewService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ReviewDto> CreateAsync(CreateReviewDto dto)
    {
        // Validate rating range at service level
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ValidationException("Rating must be between 1 and 5.");

        // Validate comment length
        if (dto.Comment?.Length > 1000)
            throw new ValidationException("Comment cannot exceed 1000 characters.");

        // Validate customer exists
        var customer = await _db.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with id '{dto.CustomerId}' was not found.");

        // Validate appointment exists (if provided)
        if (dto.AppointmentId.HasValue)
        {
            _ = await _db.Appointments.FindAsync(dto.AppointmentId.Value)
                ?? throw new KeyNotFoundException($"Appointment with id '{dto.AppointmentId.Value}' was not found.");

            // Prevent duplicate reviews for the same appointment by the same customer
            var existingReview = await _db.Reviews
                .AnyAsync(r => r.CustomerId == dto.CustomerId && r.AppointmentId == dto.AppointmentId.Value);

            if (existingReview)
                throw new InvalidOperationException(
                    $"Customer '{customer.FullName}' has already submitted a review for appointment #{dto.AppointmentId.Value}.");
        }

        var review = new Review
        {
            CustomerId = dto.CustomerId,
            AppointmentId = dto.AppointmentId,
            Rating = dto.Rating,
            Comment = dto.Comment?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Review {ReviewId} created — Customer: {CustomerId}, Rating: {Rating}",
            review.Id, dto.CustomerId, dto.Rating);

        return MapToDto(review, customer.FullName);
    }

    public async Task<PaginatedResponseDto<ReviewDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.Reviews
            .AsNoTracking()
            .Include(r => r.Customer)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            query = query.Where(r => 
                (r.Customer != null && r.Customer.FullName.ToLower().Contains(search)) ||
                (r.Comment != null && r.Comment.ToLower().Contains(search)));
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "rating" => param.SortDescending ? query.OrderByDescending(r => r.Rating) : query.OrderBy(r => r.Rating),
                "customer" => param.SortDescending ? query.OrderByDescending(r => r.Customer.FullName) : query.OrderBy(r => r.Customer.FullName),
                _ => param.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<ReviewDto>(items.Select(r => MapToDto(r, r.Customer?.FullName ?? "Anonymous")).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task<List<ReviewDto>> GetByCustomerIdAsync(int customerId)
    {
        _ = await _db.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with id '{customerId}' was not found.");

        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.CustomerId == customerId)
            .Include(r => r.Customer)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => MapToDto(r, r.Customer?.FullName ?? "Anonymous")).ToList();
    }

    public async Task<double> GetAverageRatingAsync()
    {
        var count = await _db.Reviews.CountAsync();
        if (count == 0) return 0;
        return Math.Round(await _db.Reviews.AverageAsync(r => r.Rating), 1);
    }

    private static ReviewDto MapToDto(Review r, string customerName) => new()
    {
        Id = r.Id,
        CustomerId = r.CustomerId,
        CustomerName = customerName,
        AppointmentId = r.AppointmentId,
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt
    };
}
