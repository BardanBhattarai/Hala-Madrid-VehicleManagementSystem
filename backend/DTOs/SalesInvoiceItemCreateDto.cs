using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.DTOs;

public class SalesInvoiceItemCreateDto
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}
