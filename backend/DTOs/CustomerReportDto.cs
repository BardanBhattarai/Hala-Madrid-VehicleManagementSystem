namespace VehicleManagement.DTOs;

/// <summary>
/// DTO for customer report responses — includes spending and purchase frequency data.
/// Used by the high-spending, regular customer, and pending credit report endpoints.
/// </summary>
public class CustomerReportDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    /// <summary>Total amount spent across all invoices.</summary>
    public decimal TotalSpending { get; set; }

    /// <summary>Number of completed purchases/invoices.</summary>
    public int PurchaseCount { get; set; }

    /// <summary>Outstanding credit balance (amount still owed).</summary>
    public decimal CreditBalance { get; set; }

    /// <summary>Date the customer registered.</summary>
    public DateTime CreatedAt { get; set; }
}
