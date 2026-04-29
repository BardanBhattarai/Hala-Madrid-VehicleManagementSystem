using Microsoft.EntityFrameworkCore;
using VehicleManagement.DTOs;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;

    public CustomerService(AppDbContext db) => _db = db;

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
            return MapCustomerToDto(customer);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<CustomerDto>> GetAllAsync()
        => await _db.Customers.Select(c => MapCustomerToDto(c)).ToListAsync();

    public async Task<CustomerDto> GetByIdAsync(int id)
    {
        var customer = await _db.Customers.FindAsync(id)
            ?? throw new System.Exception($"Customer with id '{id}' was not found.");
        return MapCustomerToDto(customer);
    }

    public async Task<VehicleDto> AddVehicleAsync(int customerId, VehicleCreateDto dto)
    {
        _ = await _db.Customers.FindAsync(customerId)
            ?? throw new System.Exception($"Customer with id '{customerId}' was not found.");

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
            ?? throw new System.Exception($"Customer with id '{id}' was not found.");

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
            ?? throw new System.Exception($"Customer with id '{id}' was not found.");
        return await _db.Vehicles
            .Where(v => v.CustomerId == id)
            .Select(v => MapVehicleToDto(v))
            .ToListAsync();
    }

    public async Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(int id)
    {
        _ = await _db.Customers.FindAsync(id)
            ?? throw new System.Exception($"Customer with id '{id}' was not found.");

        return await _db.SalesInvoices
            .Where(si => (si.CustomerId ?? 0) == id)
            .Include(si => si.Items).ThenInclude(i => i.Part)
            .Select(si => MapInvoiceToHistory(si))
            .ToListAsync();
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
        Parts = si.Items.Select(i => i.Part.PartName).ToList()
    };
}
