using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagement.Models
{
    public class PurchaseInvoiceItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PurchaseInvoiceId { get; set; }

        [Required]
        public int PartId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        [Required]
        public decimal TotalPrice { get; set; }

        [ForeignKey("PurchaseInvoiceId")]
        public PurchaseInvoice? PurchaseInvoice { get; set; }

        [ForeignKey("PartId")]
        public Part? Part { get; set; }
    }
}
