using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services;

public interface ISalesInvoiceService
{
    Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto);
    Task<List<SalesInvoiceDto>> GetAllAsync();
    Task<SalesInvoiceDto> GetByIdAsync(int id);
    Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId);
}
