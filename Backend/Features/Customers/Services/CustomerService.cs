using Microsoft.EntityFrameworkCore;
using VehiclePartsSystem.Common.Exceptions;
using VehiclePartsSystem.Domain.Entities;
using VehiclePartsSystem.Features.Customers.DTOs;
using VehiclePartsSystem.Infrastructure.Data;

namespace VehiclePartsSystem.Features.Customers.Services;

public class CustomerService : ICustomerService
{
    private readonly ApplicationDbContext _db;

    public CustomerService(ApplicationDbContext db) => _db = db;

    public async Task<CustomerDto> RegisterWithVehicleAsync(RegisterCustomerWithVehicleDto dto)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Address = dto.Address,
            CreditBalance = 0,
            CreatedAt = DateTime.UtcNow
        };
        _db.Customers.Add(customer);

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            VehicleNumber = dto.Vehicle.VehicleNumber,
            Brand = dto.Vehicle.Brand,
            Model = dto.Vehicle.Model,
            VehicleType = dto.Vehicle.VehicleType,
            ManufactureYear = dto.Vehicle.ManufactureYear,
            Mileage = dto.Vehicle.Mileage,
            LastServiceDate = dto.Vehicle.LastServiceDate
        };
        _db.Vehicles.Add(vehicle);

        await _db.SaveChangesAsync();
        return MapCustomerToDto(customer);
    }

    public async Task<List<CustomerDto>> GetAllAsync()
        => await _db.Customers.Select(c => MapCustomerToDto(c)).ToListAsync();

    public async Task<CustomerDto> GetByIdAsync(Guid id)
    {
        var customer = await _db.Customers.FindAsync(id)
            ?? throw new NotFoundException($"Customer with id '{id}' was not found.");
        return MapCustomerToDto(customer);
    }

    public async Task<VehicleDto> AddVehicleAsync(Guid customerId, VehicleCreateDto dto)
    {
        _ = await _db.Customers.FindAsync(customerId)
            ?? throw new NotFoundException($"Customer with id '{customerId}' was not found.");

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            VehicleNumber = dto.VehicleNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            VehicleType = dto.VehicleType,
            ManufactureYear = dto.ManufactureYear,
            Mileage = dto.Mileage,
            LastServiceDate = dto.LastServiceDate
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();
        return MapVehicleToDto(vehicle);
    }

    public async Task<CustomerProfileDto> GetProfileAsync(Guid id)
    {
        var customer = await _db.Customers
            .Include(c => c.Vehicles)
            .Include(c => c.SalesInvoices)
                .ThenInclude(si => si.Items)
                    .ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException($"Customer with id '{id}' was not found.");

        return new CustomerProfileDto
        {
            Customer = MapCustomerToDto(customer),
            Vehicles = customer.Vehicles.Select(MapVehicleToDto).ToList(),
            PurchaseHistory = customer.SalesInvoices.Select(MapInvoiceToHistory).ToList()
        };
    }

    public async Task<List<VehicleDto>> GetVehiclesAsync(Guid id)
    {
        _ = await _db.Customers.FindAsync(id)
            ?? throw new NotFoundException($"Customer with id '{id}' was not found.");
        return await _db.Vehicles
            .Where(v => v.CustomerId == id)
            .Select(v => MapVehicleToDto(v))
            .ToListAsync();
    }

    public async Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(Guid id)
    {
        _ = await _db.Customers.FindAsync(id)
            ?? throw new NotFoundException($"Customer with id '{id}' was not found.");

        return await _db.SalesInvoices
            .Where(si => si.CustomerId == id)
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

    private static PurchaseHistoryDto MapInvoiceToHistory(Domain.Entities.SalesInvoice si) => new()
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
