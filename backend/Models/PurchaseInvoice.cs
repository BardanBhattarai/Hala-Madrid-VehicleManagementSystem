using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class PurchaseInvoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

        [Required]
        public decimal TotalCost { get; set; }

        public string SupplierName { get; set; } = string.Empty;
    }
}
