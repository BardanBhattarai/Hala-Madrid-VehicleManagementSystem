using VehicleManagement.DTOs;

namespace VehicleManagement.Services
{
    public interface IPurchaseService
    {
        Task<PurchaseInvoiceResponseDto> CreatePurchaseInvoiceAsync(PurchaseInvoiceCreateDto dto);
        Task<List<PurchaseInvoiceResponseDto>> GetAllInvoicesAsync();
        Task<PurchaseInvoiceResponseDto?> GetInvoiceByIdAsync(int id);
    }
}
