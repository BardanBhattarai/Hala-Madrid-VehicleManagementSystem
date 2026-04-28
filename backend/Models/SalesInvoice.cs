using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class SalesInvoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

        [Required]
        public decimal TotalAmount { get; set; }

        public string CustomerName { get; set; } = string.Empty;
    }
}
