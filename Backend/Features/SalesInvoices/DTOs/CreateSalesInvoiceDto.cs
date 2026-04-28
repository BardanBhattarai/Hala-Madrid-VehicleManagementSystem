using System.ComponentModel.DataAnnotations;

namespace VehiclePartsSystem.Features.SalesInvoices.DTOs;

public class CreateSalesInvoiceDto
{
    [Required]
    public Guid CustomerId { get; set; }

    // MERGE: Replace with User.Id extracted from JWT claims after auth team merges
    public string StaffId { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Paid amount cannot be negative.")]
    public decimal PaidAmount { get; set; }

    [Required, MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<SalesInvoiceItemCreateDto> Items { get; set; } = new();
}
