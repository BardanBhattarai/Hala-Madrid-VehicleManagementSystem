using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services;

/// <summary>
/// Service interface for customer-related business logic.
/// Covers registration, profile management, reports, and search.
/// </summary>
public interface ICustomerService
{
    // ── Existing CRUD & Profile ─────────────────────────────────────────
    Task<CustomerDto> RegisterWithVehicleAsync(RegisterCustomerWithVehicleDto dto);
    Task<PaginatedResponseDto<CustomerDto>> GetAllAsync(PaginationParamsDto param);
    Task<CustomerDto> GetByIdAsync(int id);
    Task<VehicleDto> AddVehicleAsync(int customerId, VehicleCreateDto dto);
    Task<CustomerProfileDto> GetProfileAsync(int id);
    Task<List<VehicleDto>> GetVehiclesAsync(int id);
    Task<List<PurchaseHistoryDto>> GetPurchaseHistoryAsync(int id);

    // ── Feature 12: Profile Update ──────────────────────────────────────
    Task<CustomerDto> UpdateProfileAsync(int customerId, UpdateCustomerProfileDto dto);

    // ── Feature 9: Customer Reports ─────────────────────────────────────
    Task<PagedResult<CustomerReportDto>> GetHighSpendingCustomersAsync(
        decimal threshold, int page, int pageSize, string? sortBy, bool sortDescending);

    Task<PagedResult<CustomerReportDto>> GetRegularCustomersAsync(
        int minPurchases, int page, int pageSize, string? sortBy, bool sortDescending);

    Task<PagedResult<CustomerReportDto>> GetCustomersWithPendingCreditsAsync(
        int page, int pageSize, string? sortBy, bool sortDescending);

    // ── Feature 10: Customer Search ─────────────────────────────────────
    Task<PagedResult<CustomerDto>> SearchCustomersAsync(
        string? name, string? phone, int? customerId, string? vehicleNumber,
        int page, int pageSize);
}
