using VehiclePartsSystem.Features.Customers.DTOs;

namespace VehiclePartsSystem.Features.Customers.Services;

public interface ICustomerService
{
    Task<CustomerDto> RegisterWithVehicleAsync(RegisterCustomerWithVehicleDto dto);
    Task<List<CustomerDto>> GetAllAsync();
    Task<CustomerDto> GetByIdAsync(Guid id);
    Task<VehicleDto> AddVehicleAsync(Guid customerId, VehicleCreateDto dto);
    Task<CustomerProfileDto> GetProfileAsync(Guid id);
    Task<List<VehicleDto>> GetVehiclesAsync(Guid id);
    Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(Guid id);
}
