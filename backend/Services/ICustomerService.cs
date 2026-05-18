using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services;

public interface ICustomerService
{
    Task<CustomerDto> RegisterWithVehicleAsync(RegisterCustomerWithVehicleDto dto);
    Task<List<CustomerDto>> GetAllAsync();
    Task<CustomerDto> GetByIdAsync(int id);
    Task<VehicleDto> AddVehicleAsync(int customerId, VehicleCreateDto dto);
    Task<CustomerProfileDto> GetProfileAsync(int id);
    Task<List<VehicleDto>> GetVehiclesAsync(int id);
    Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(int id);
}
