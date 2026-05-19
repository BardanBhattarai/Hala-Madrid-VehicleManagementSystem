using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(AppDbContext db, ILogger<AppointmentService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto)
    {
        // Validate appointment date is in the future
        if (dto.AppointmentDate <= DateTime.UtcNow)
            throw new ValidationException("Appointment date must be in the future.");

        // Validate customer exists
        var customer = await _db.Customers.FindAsync(dto.CustomerId)
            ?? throw new KeyNotFoundException($"Customer with id '{dto.CustomerId}' was not found.");

        // Validate vehicle exists and belongs to the customer
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(
                v => v.Id == dto.VehicleId && v.CustomerId == dto.CustomerId)
            ?? throw new KeyNotFoundException(
                $"Vehicle with id '{dto.VehicleId}' was not found for customer '{dto.CustomerId}'.");

        var appointment = new Appointment
        {
            CustomerId = dto.CustomerId,
            VehicleId = dto.VehicleId,
            AppointmentDate = dto.AppointmentDate,
            ServiceType = dto.ServiceType,
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Appointment {AppointmentId} created for Customer {CustomerId}, Vehicle {VehicleId}",
            appointment.Id, dto.CustomerId, dto.VehicleId);

        return await GetByIdAsync(appointment.Id);
    }

    public async Task<AppointmentResponseDto> UpdateAsync(int id, UpdateAppointmentDto dto)
    {
        var appointment = await _db.Appointments.FindAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with id '{id}' was not found.");

        // Validate appointment date is in the future
        if (dto.AppointmentDate <= DateTime.UtcNow)
            throw new ValidationException("Appointment date must be in the future.");

        // Prevent updates to cancelled or completed appointments
        if (appointment.Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot update a cancelled appointment.");

        if (appointment.Status == AppointmentStatus.Completed)
            throw new InvalidOperationException("Cannot update a completed appointment.");

        appointment.AppointmentDate = dto.AppointmentDate;
        appointment.ServiceType = dto.ServiceType;
        appointment.Status = dto.Status;
        appointment.Notes = dto.Notes;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Appointment {AppointmentId} updated — Status: {Status}, Date: {Date}",
            id, dto.Status, dto.AppointmentDate);

        return await GetByIdAsync(appointment.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var appointment = await _db.Appointments.FindAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with id '{id}' was not found.");

        _db.Appointments.Remove(appointment);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Appointment {AppointmentId} deleted.", id);
    }

    public async Task<AppointmentResponseDto> GetByIdAsync(int id)
    {
        var appointment = await _db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException($"Appointment with id '{id}' was not found.");

        return MapToDto(appointment);
    }

    public async Task<PaginatedResponseDto<AppointmentResponseDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            query = query.Where(a => 
                (a.Customer != null && a.Customer.FullName.ToLower().Contains(search)) ||
                (a.Vehicle != null && a.Vehicle.VehicleNumber.ToLower().Contains(search)));
        }

        // Filter
        if (!string.IsNullOrWhiteSpace(param.FilterBy))
        {
            if (Enum.TryParse<AppointmentStatus>(param.FilterBy, true, out var status))
            {
                query = query.Where(a => a.Status == status);
            }
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "date" => param.SortDescending ? query.OrderByDescending(a => a.AppointmentDate) : query.OrderBy(a => a.AppointmentDate),
                "customer" => param.SortDescending ? query.OrderByDescending(a => a.Customer.FullName) : query.OrderBy(a => a.Customer.FullName),
                "status" => param.SortDescending ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
                _ => param.SortDescending ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(a => a.AppointmentDate) : query.OrderBy(a => a.AppointmentDate);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<AppointmentResponseDto>(items.Select(MapToDto).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task<List<AppointmentResponseDto>> GetByCustomerIdAsync(int customerId)
    {
        _ = await _db.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with id '{customerId}' was not found.");

        var appointments = await _db.Appointments
            .AsNoTracking()
            .Where(a => a.CustomerId == customerId)
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();

        return appointments.Select(MapToDto).ToList();
    }

    public async Task<AppointmentResponseDto> UpdateStatusAsync(int id, AppointmentStatus status)
    {
        var appointment = await _db.Appointments.FindAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with id '{id}' was not found.");

        // Validate status transitions
        if (appointment.Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot change status of a cancelled appointment.");

        if (appointment.Status == AppointmentStatus.Completed && status != AppointmentStatus.Completed)
            throw new InvalidOperationException("Cannot change status of a completed appointment.");

        _logger.LogInformation("Appointment {AppointmentId} status changed from {OldStatus} to {NewStatus}",
            id, appointment.Status, status);

        appointment.Status = status;
        await _db.SaveChangesAsync();

        return await GetByIdAsync(appointment.Id);
    }

    private static AppointmentResponseDto MapToDto(Appointment a) => new()
    {
        Id = a.Id,
        CustomerId = a.CustomerId,
        CustomerName = a.Customer?.FullName ?? "Unknown Customer",
        CustomerPhone = a.Customer?.PhoneNumber ?? string.Empty,
        VehicleId = a.VehicleId,
        VehicleNumber = a.Vehicle?.VehicleNumber ?? string.Empty,
        VehicleBrand = a.Vehicle?.Brand ?? string.Empty,
        VehicleModel = a.Vehicle?.Model ?? string.Empty,
        AppointmentDate = a.AppointmentDate,
        ServiceType = a.ServiceType,
        Status = a.Status.ToString(),
        Notes = a.Notes,
        CreatedAt = a.CreatedAt
    };
}
