using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.DTOs
{
    public class PurchaseInvoiceCreateDto
    {
        [Required]
        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

        public string SupplierName { get; set; } = string.Empty;

        [Required]
        [MinLength(1, ErrorMessage = "Invoice must contain at least one item.")]
        public List<PurchaseInvoiceItemCreateDto> Items { get; set; } = new List<PurchaseInvoiceItemCreateDto>();
    }

    public class PurchaseInvoiceItemCreateDto
    {
        [Required]
        public int PartId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0.")]
        public decimal UnitPrice { get; set; }
    }

    public class PurchaseInvoiceResponseDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<PurchaseInvoiceItemResponseDto> Items { get; set; } = new List<PurchaseInvoiceItemResponseDto>();
    }

    public class PurchaseInvoiceItemResponseDto
    {
        public int Id { get; set; }
        public int PartId { get; set; }
        public string PartName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
