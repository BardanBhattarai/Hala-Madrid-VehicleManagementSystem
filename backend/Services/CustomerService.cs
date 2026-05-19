using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(AppDbContext db, ILogger<CustomerService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<CustomerDto> RegisterWithVehicleAsync(RegisterCustomerWithVehicleDto dto)
    {
        // Use a transaction to ensure both customer and vehicle are created together
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var customer = new Customer
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email ?? string.Empty,
                Address = dto.Address ?? string.Empty,
                CreditBalance = 0,
                CreatedAt = DateTime.UtcNow
            };

            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            var vehicle = new Vehicle
            {
                CustomerId = customer.Id,
                VehicleNumber = dto.Vehicle.VehicleNumber,
                Brand = dto.Vehicle.Brand,
                Model = dto.Vehicle.Model,
                VehicleType = dto.Vehicle.VehicleType ?? string.Empty,
                ManufactureYear = dto.Vehicle.ManufactureYear,
                Mileage = dto.Vehicle.Mileage,
                LastServiceDate = dto.Vehicle.LastServiceDate
            };

            _db.Vehicles.Add(vehicle);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation("Customer {CustomerId} registered with Vehicle {VehicleId}",
                customer.Id, vehicle.Id);

            return MapCustomerToDto(customer);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to register customer with vehicle");
            throw;
        }
    }

    public async Task<PaginatedResponseDto<CustomerDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.Customers.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var search = param.SearchTerm.ToLower();
            bool isInt = int.TryParse(param.SearchTerm, out int searchId);

            query = query.Where(c => c.FullName.ToLower().Contains(search) || 
                                     c.Email.ToLower().Contains(search) || 
                                     c.PhoneNumber.Contains(search) ||
                                     (isInt && c.Id == searchId) ||
                                     _db.Vehicles.Any(v => v.CustomerId == c.Id && v.VehicleNumber.ToLower().Contains(search)));
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(param.SortBy))
        {
            query = param.SortBy.ToLower() switch
            {
                "fullname" => param.SortDescending ? query.OrderByDescending(c => c.FullName) : query.OrderBy(c => c.FullName),
                "email" => param.SortDescending ? query.OrderByDescending(c => c.Email) : query.OrderBy(c => c.Email),
                "creditbalance" => param.SortDescending ? query.OrderByDescending(c => c.CreditBalance) : query.OrderBy(c => c.CreditBalance),
                _ => param.SortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt)
            };
        }
        else
        {
            query = param.SortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt);
        }

        var totalRecords = await query.CountAsync();
        
        var items = await query
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .ToListAsync();

        return new PaginatedResponseDto<CustomerDto>(items.Select(MapCustomerToDto).ToList(), totalRecords, param.PageNumber, param.PageSize);
    }

    public async Task<CustomerDto> GetByIdAsync(int id)
    {
        var customer = await _db.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Customer with id '{id}' was not found.");
        return MapCustomerToDto(customer);
    }

    public async Task<VehicleDto> AddVehicleAsync(int customerId, VehicleCreateDto dto)
    {
        _ = await _db.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with id '{customerId}' was not found.");

        var vehicle = new Vehicle
        {
            CustomerId = customerId,
            VehicleNumber = dto.VehicleNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            VehicleType = dto.VehicleType ?? string.Empty,
            ManufactureYear = dto.ManufactureYear,
            Mileage = dto.Mileage,
            LastServiceDate = dto.LastServiceDate
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Vehicle {VehicleId} added to Customer {CustomerId}", vehicle.Id, customerId);

        return MapVehicleToDto(vehicle);
    }

    public async Task<CustomerProfileDto> GetProfileAsync(int id)
    {
        var customer = await _db.Customers
            .AsNoTracking()
            .Include(c => c.Vehicles)
            .Include(c => c.SalesInvoices)
                .ThenInclude(si => si.Items)
                    .ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Customer with id '{id}' was not found.");

        return new CustomerProfileDto
        {
            Customer = MapCustomerToDto(customer),
            Vehicles = customer.Vehicles.Select(MapVehicleToDto).ToList(),
            PurchaseHistory = customer.SalesInvoices.Select(MapInvoiceToHistory).ToList()
        };
    }

    public async Task<List<VehicleDto>> GetVehiclesAsync(int id)
    {
        _ = await _db.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Customer with id '{id}' was not found.");
        return await _db.Vehicles
            .AsNoTracking()
            .Where(v => v.CustomerId == id)
            .Select(v => MapVehicleToDto(v))
            .ToListAsync();
    }

    public async Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(int id)
    {
        _ = await _db.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Customer with id '{id}' was not found.");

        var invoices = await _db.SalesInvoices
            .AsNoTracking()
            .Where(si => (si.CustomerId ?? 0) == id)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .ToListAsync();

        return invoices.Select(MapInvoiceToHistory).ToList();
    }

    public async Task<CustomerDto> UpdateProfileAsync(int id, CustomerUpdateDto dto)
    {
        var customer = await _db.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Customer with id '{id}' was not found.");

        customer.FullName = dto.FullName;
        customer.PhoneNumber = dto.PhoneNumber;
        customer.Email = dto.Email;
        customer.Address = dto.Address;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Customer profile {CustomerId} updated successfully.", id);

        return MapCustomerToDto(customer);
    }

    private static CustomerDto MapCustomerToDto(Customer c) => new()
    {
        Id = c.Id,
        FullName = c.FullName,
        PhoneNumber = c.PhoneNumber,
        Email = c.Email,
        Address = c.Address,
        CreditBalance = c.CreditBalance,
        CreatedAt = c.CreatedAt
    };

    private static VehicleDto MapVehicleToDto(Vehicle v) => new()
    {
        Id = v.Id,
        CustomerId = v.CustomerId,
        VehicleNumber = v.VehicleNumber,
        Brand = v.Brand,
        Model = v.Model,
        VehicleType = v.VehicleType,
        ManufactureYear = v.ManufactureYear,
        Mileage = v.Mileage,
        LastServiceDate = v.LastServiceDate
    };

    private static PurchaseHistoryDto MapInvoiceToHistory(SalesInvoice si) => new()
    {
        InvoiceId = si.Id,
        InvoiceDate = si.InvoiceDate,
        SubTotal = si.SubTotal,
        DiscountAmount = si.DiscountAmount,
        TotalAmount = si.TotalAmount,
        PaidAmount = si.PaidAmount,
        DueAmount = si.DueAmount,
        PaymentStatus = si.PaymentStatus.ToString(),
        Parts = si.Items.Select(i => i.Part?.PartName ?? "Unknown Part").ToList()
    };
}
