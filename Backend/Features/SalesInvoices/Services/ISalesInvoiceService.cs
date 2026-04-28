using VehiclePartsSystem.Features.SalesInvoices.DTOs;

namespace VehiclePartsSystem.Features.SalesInvoices.Services;

public interface ISalesInvoiceService
{
    Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto);
    Task<List<SalesInvoiceDto>> GetAllAsync();
    Task<SalesInvoiceDto> GetByIdAsync(Guid id);
    Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(Guid customerId);
}
