using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services;

public interface ISalesInvoiceService
{
    Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto);
    Task<PaginatedResponseDto<SalesInvoiceDto>> GetAllAsync(PaginationParamsDto param);
    Task<SalesInvoiceDto> GetByIdAsync(int id);
    Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId);
    Task<bool> SendInvoiceEmailAsync(int invoiceId);
}
