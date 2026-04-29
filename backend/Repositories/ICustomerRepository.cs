using VehicleManagement.Models;

namespace VehicleManagement.Repositories;

/// <summary>
/// Repository interface for Customer-specific data access operations.
/// Provides methods for reports, search, and CRUD beyond basic EF queries.
/// </summary>
public interface ICustomerRepository
{
    // ── Basic CRUD ──────────────────────────────────────────────────────
    Task<Customer?> GetByIdAsync(int id);
    Task<Customer?> GetByIdWithDetailsAsync(int id);
    Task<List<Customer>> GetAllAsync();
    Task AddAsync(Customer customer);
    void Update(Customer customer);
    Task SaveChangesAsync();

    // ── Reports (Feature 9) ─────────────────────────────────────────────
    /// <summary>Customers whose total invoice amount exceeds the threshold.</summary>
    Task<(List<Customer> Items, int TotalCount)> GetHighSpendingCustomersAsync(
        decimal threshold, int page, int pageSize, string? sortBy, bool sortDescending);

    /// <summary>Customers with purchase count >= minPurchases.</summary>
    Task<(List<Customer> Items, int TotalCount)> GetRegularCustomersAsync(
        int minPurchases, int page, int pageSize, string? sortBy, bool sortDescending);

    /// <summary>Customers with CreditBalance > 0 (pending credits/dues).</summary>
    Task<(List<Customer> Items, int TotalCount)> GetCustomersWithPendingCreditsAsync(
        int page, int pageSize, string? sortBy, bool sortDescending);

    // ── Search (Feature 10) ─────────────────────────────────────────────
    /// <summary>
    /// Flexible search across Name, Phone, Customer ID, and Vehicle Number.
    /// All parameters are optional; combines conditions with AND logic.
    /// </summary>
    Task<(List<Customer> Items, int TotalCount)> SearchCustomersAsync(
        string? name, string? phone, int? customerId, string? vehicleNumber,
        int page, int pageSize);
}
