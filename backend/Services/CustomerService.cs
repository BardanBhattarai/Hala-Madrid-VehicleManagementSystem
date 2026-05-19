using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;
using VehicleManagement.Repositories;

namespace VehicleManagement.Services;

/// <summary>
/// Customer service handling registration, profile management,
/// reports (Feature 9), search (Feature 10), and profile updates (Feature 12).
/// Uses the Repository pattern for data access.
/// </summary>
public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;
    private readonly ICustomerRepository _repo;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(AppDbContext db, ICustomerRepository repo, ILogger<CustomerService> logger)
    {
        _db = db;
        _repo = repo;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════════════════════════
    // EXISTING METHODS (preserved from original)
    // ═══════════════════════════════════════════════════════════════════

    public async Task<CustomerDto> RegisterWithVehicleAsync(RegisterCustomerWithVehicleDto dto)
    {
        _logger.LogInformation("Registering new customer: {Name}", dto.FullName);

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
                CreatedAt = DateTime.UtcNow,
                // Hash password if provided in a future DTO extension
                PasswordHash = string.Empty
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

            _logger.LogInformation("Customer registered successfully with ID {Id}", customer.Id);
            return MapCustomerToDto(customer);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PaginatedResponseDto<CustomerDto>> GetAllAsync(PaginationParamsDto param)
    {
        var query = _db.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(param.SearchTerm))
        {
            var term = param.SearchTerm.Trim().ToLowerInvariant();
            query = query.Where(c => c.FullName.ToLower().Contains(term)
                                     || c.PhoneNumber.ToLower().Contains(term)
                                     || c.Email.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.Id)
            .Skip((param.PageNumber - 1) * param.PageSize)
            .Take(param.PageSize)
            .Select(c => MapCustomerToDto(c))
            .ToListAsync();

        return new PaginatedResponseDto<CustomerDto>(items, total, param.PageNumber, param.PageSize);
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

        _logger.LogInformation("Vehicle {Number} added for customer {Id}", dto.VehicleNumber, customerId);
        return MapVehicleToDto(vehicle);
    }

    public async Task<CustomerProfileDto> GetProfileAsync(int id)
    {
        var customer = await _db.Customers
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
            .Where(v => v.CustomerId == id)
            .Select(v => MapVehicleToDto(v))
            .ToListAsync();
    }

    public async Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(int id)
    {
        _ = await _db.Customers.FindAsync(id)
            ?? throw new KeyNotFoundException($"Customer with id '{id}' was not found.");

        return await _db.SalesInvoices
            .Where(si => (si.CustomerId ?? 0) == id)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .Select(si => MapInvoiceToHistory(si))
            .ToListAsync();
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 12: Profile Update
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Updates a customer's profile. Only provided (non-null) fields are updated.
    /// If a new password is provided, it is hashed before storage.
    /// </summary>
    public async Task<CustomerDto> UpdateProfileAsync(int customerId, UpdateCustomerProfileDto dto)
    {
        var customer = await _db.Customers.FindAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer with id '{customerId}' was not found.");

        // Only update fields that are provided
        if (!string.IsNullOrWhiteSpace(dto.FullName))
            customer.FullName = dto.FullName;

        if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            customer.PhoneNumber = dto.PhoneNumber;

        if (!string.IsNullOrWhiteSpace(dto.Email))
            customer.Email = dto.Email;

        if (!string.IsNullOrWhiteSpace(dto.Address))
            customer.Address = dto.Address;

        // Hash password if a new one is provided
        if (!string.IsNullOrWhiteSpace(dto.Password))
            customer.PasswordHash = HashPassword(dto.Password);

        await _db.SaveChangesAsync();

        _logger.LogInformation("Profile updated for customer {Id}", customerId);
        return MapCustomerToDto(customer);
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 9: Customer Reports
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Returns paginated list of customers whose total purchases exceed the threshold.
    /// </summary>
    public async Task<PagedResult<CustomerReportDto>> GetHighSpendingCustomersAsync(
        decimal threshold, int page, int pageSize, string? sortBy, bool sortDescending)
    {
        _logger.LogInformation("Fetching high-spending customers (threshold: {Threshold})", threshold);

        var (items, totalCount) = await _repo.GetHighSpendingCustomersAsync(
            threshold, page, pageSize, sortBy, sortDescending);

        return new PagedResult<CustomerReportDto>
        {
            Items = items.Select(MapToReportDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Returns paginated list of regular customers (purchase count >= minPurchases).
    /// </summary>
    public async Task<PagedResult<CustomerReportDto>> GetRegularCustomersAsync(
        int minPurchases, int page, int pageSize, string? sortBy, bool sortDescending)
    {
        _logger.LogInformation("Fetching regular customers (min purchases: {Min})", minPurchases);

        var (items, totalCount) = await _repo.GetRegularCustomersAsync(
            minPurchases, page, pageSize, sortBy, sortDescending);

        return new PagedResult<CustomerReportDto>
        {
            Items = items.Select(MapToReportDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Returns paginated list of customers with outstanding credit balances.
    /// </summary>
    public async Task<PagedResult<CustomerReportDto>> GetCustomersWithPendingCreditsAsync(
        int page, int pageSize, string? sortBy, bool sortDescending)
    {
        _logger.LogInformation("Fetching customers with pending credits");

        var (items, totalCount) = await _repo.GetCustomersWithPendingCreditsAsync(
            page, pageSize, sortBy, sortDescending);

        return new PagedResult<CustomerReportDto>
        {
            Items = items.Select(MapToReportDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 10: Customer Search
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Flexible search across multiple fields with pagination.
    /// All query parameters are optional — a request with no params returns all customers.
    /// </summary>
    public async Task<PagedResult<CustomerDto>> SearchCustomersAsync(
        string? name, string? phone, int? customerId, string? vehicleNumber,
        int page, int pageSize)
    {
        _logger.LogInformation("Searching customers: name={Name}, phone={Phone}, id={Id}, vehicle={Vehicle}",
            name, phone, customerId, vehicleNumber);

        var (items, totalCount) = await _repo.SearchCustomersAsync(
            name, phone, customerId, vehicleNumber, page, pageSize);

        return new PagedResult<CustomerDto>
        {
            Items = items.Select(MapCustomerToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>Hashes a password using PBKDF2 with a random salt.</summary>
    private static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 32));

        // Store salt + hash together separated by a dot
        return $"{Convert.ToBase64String(salt)}.{hashed}";
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

    private static PurchaseHistoryDto MapInvoiceToHistory(SalesInvoice si)
    {
        var paymentStatus = EvaluateInvoicePaymentStatus(si).ToString();
        return new PurchaseHistoryDto
        {
            InvoiceId = si.Id,
            InvoiceDate = si.InvoiceDate,
            SubTotal = si.SubTotal,
            DiscountAmount = si.DiscountAmount,
            TotalAmount = si.TotalAmount,
            PaidAmount = si.PaidAmount,
            DueAmount = si.DueAmount,
            PaymentStatus = paymentStatus,
            Parts = si.Items.Select(i => i.Part.PartName).ToList()
        };
    }

    private static PaymentStatus EvaluateInvoicePaymentStatus(SalesInvoice si)
    {
        if (!si.Items.Any())
        {
            return PaymentStatus.Unpaid;
        }

        return si.PaymentStatus == PaymentStatus.Unpaid
            ? PaymentStatus.Paid
            : si.PaymentStatus;
    }

    private static CustomerReportDto MapToReportDto(Customer c)
    {
        var invoices = c.SalesInvoices ?? new List<SalesInvoice>();
        var purchaseCount = invoices.Count(si => si.Items != null && si.Items.Any());
        var totalSpending = invoices.Sum(si => si.TotalAmount);

        return new CustomerReportDto
        {
            Id = c.Id,
            FullName = c.FullName,
            PhoneNumber = c.PhoneNumber,
            Email = c.Email,
            Address = c.Address,
            TotalSpending = totalSpending,
            PurchaseCount = purchaseCount,
            CreditBalance = c.CreditBalance,
            CreatedAt = c.CreatedAt
        };
    }
}
