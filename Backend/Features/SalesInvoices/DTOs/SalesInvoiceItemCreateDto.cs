using System.ComponentModel.DataAnnotations;

namespace VehiclePartsSystem.Features.SalesInvoices.DTOs;

public class SalesInvoiceItemCreateDto
{
    [Required]
    public Guid PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}
