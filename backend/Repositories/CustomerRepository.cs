using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.Models;

namespace VehicleManagement.Repositories;

/// <summary>
/// Concrete implementation of ICustomerRepository.
/// Uses EF Core with efficient LINQ queries for reports and search.
/// </summary>
public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _db;

    public CustomerRepository(AppDbContext db) => _db = db;

    // ── Basic CRUD ──────────────────────────────────────────────────────

    public async Task<Customer?> GetByIdAsync(int id)
        => await _db.Customers.FindAsync(id);

    public async Task<Customer?> GetByIdWithDetailsAsync(int id)
        => await _db.Customers
            .Include(c => c.Vehicles)
            .Include(c => c.SalesInvoices)
                .ThenInclude(si => si.Items)
                    .ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<List<Customer>> GetAllAsync()
        => await _db.Customers.ToListAsync();

    public async Task AddAsync(Customer customer)
    {
        _db.Customers.Add(customer);
        await Task.CompletedTask;
    }

    public void Update(Customer customer)
        => _db.Customers.Update(customer);

    public async Task SaveChangesAsync()
        => await _db.SaveChangesAsync();

    // ── Reports (Feature 9) ─────────────────────────────────────────────

    /// <summary>
    /// High-spending customers: joins Customers → SalesInvoices, groups by customer,
    /// filters by total TotalAmount > threshold.
    /// </summary>
    public async Task<(List<Customer> Items, int TotalCount)> GetHighSpendingCustomersAsync(
        decimal threshold, int page, int pageSize, string? sortBy, bool sortDescending)
    {
        // Get customer IDs whose total spending exceeds threshold
        var highSpenderIds = await _db.SalesInvoices
            .Where(si => si.CustomerId != null)
            .GroupBy(si => si.CustomerId)
            .Where(g => g.Sum(si => si.TotalAmount) > threshold)
            .Select(g => g.Key!.Value)
            .ToListAsync();

        var query = _db.Customers
            .Where(c => highSpenderIds.Contains(c.Id))
            .Include(c => c.SalesInvoices);

        var totalCount = await _db.Customers
            .Where(c => highSpenderIds.Contains(c.Id))
            .CountAsync();

        var items = await ApplySorting(_db.Customers.Where(c => highSpenderIds.Contains(c.Id))
            .Include(c => c.SalesInvoices), sortBy, sortDescending)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    /// <summary>
    /// Regular customers: customers with invoice count >= minPurchases.
    /// </summary>
    public async Task<(List<Customer> Items, int TotalCount)> GetRegularCustomersAsync(
        int minPurchases, int page, int pageSize, string? sortBy, bool sortDescending)
    {
        var regularIds = await _db.SalesInvoices
            .Where(si => si.CustomerId != null)
            .GroupBy(si => si.CustomerId)
            .Where(g => g.Count() >= minPurchases)
            .Select(g => g.Key!.Value)
            .ToListAsync();

        var totalCount = await _db.Customers
            .Where(c => regularIds.Contains(c.Id))
            .CountAsync();

        var items = await ApplySorting(_db.Customers.Where(c => regularIds.Contains(c.Id))
            .Include(c => c.SalesInvoices), sortBy, sortDescending)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    /// <summary>
    /// Customers with pending credits: CreditBalance > 0.
    /// </summary>
    public async Task<(List<Customer> Items, int TotalCount)> GetCustomersWithPendingCreditsAsync(
        int page, int pageSize, string? sortBy, bool sortDescending)
    {
        var baseQuery = _db.Customers
            .Where(c => c.CreditBalance > 0)
            .Include(c => c.SalesInvoices);

        var totalCount = await _db.Customers
            .Where(c => c.CreditBalance > 0)
            .CountAsync();

        var items = await ApplySorting(_db.Customers.Where(c => c.CreditBalance > 0)
            .Include(c => c.SalesInvoices), sortBy, sortDescending)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    // ── Search (Feature 10) ─────────────────────────────────────────────

    /// <summary>
    /// Flexible search: builds query dynamically based on non-null parameters.
    /// All string comparisons are case-insensitive via EF.Functions.ILike (PostgreSQL).
    /// </summary>
    public async Task<(List<Customer> Items, int TotalCount)> SearchCustomersAsync(
        string? name, string? phone, int? customerId, string? vehicleNumber,
        int page, int pageSize)
    {
        var query = _db.Customers
            .Include(c => c.Vehicles)
            .AsQueryable();

        // Filter by customer ID (exact match)
        if (customerId.HasValue)
            query = query.Where(c => c.Id == customerId.Value);

        // Filter by name (case-insensitive partial match using PostgreSQL ILike)
        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(c => EF.Functions.ILike(c.FullName, $"%{name}%"));

        // Filter by phone number (case-insensitive partial match)
        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(c => EF.Functions.ILike(c.PhoneNumber, $"%{phone}%"));

        // Filter by vehicle number (case-insensitive partial match via navigation)
        if (!string.IsNullOrWhiteSpace(vehicleNumber))
            query = query.Where(c => c.Vehicles.Any(
                v => EF.Functions.ILike(v.VehicleNumber, $"%{vehicleNumber}%")));

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(c => c.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /// <summary>Applies dynamic sorting to a customer query.</summary>
    private static IQueryable<Customer> ApplySorting(
        IQueryable<Customer> query, string? sortBy, bool descending)
    {
        return (sortBy?.ToLower()) switch
        {
            "name" => descending ? query.OrderByDescending(c => c.FullName) : query.OrderBy(c => c.FullName),
            "credit" => descending ? query.OrderByDescending(c => c.CreditBalance) : query.OrderBy(c => c.CreditBalance),
            "date" => descending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => query.OrderBy(c => c.Id)
        };
    }
}
