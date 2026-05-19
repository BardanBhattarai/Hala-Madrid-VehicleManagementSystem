using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

/// <summary>
/// Service interface for sales invoice operations.
/// </summary>
public interface ISalesInvoiceService
{
    Task<SalesInvoiceDto> CreateAsync(CreateSalesInvoiceDto dto);
    Task<PaginatedResponseDto<SalesInvoiceDto>> GetAllAsync(PaginationParamsDto param);
    Task<SalesInvoiceDto> GetByIdAsync(int id);
    Task<List<SalesInvoiceDto>> GetByCustomerIdAsync(int customerId);

    /// <summary>Feature 11: Resend an existing invoice by email.</summary>
    Task<bool> ResendInvoiceEmailAsync(int invoiceId);
}
