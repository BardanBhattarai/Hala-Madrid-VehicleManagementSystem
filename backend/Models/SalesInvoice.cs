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

        public int? CustomerId { get; set; }
        public string StaffId { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Customer? Customer { get; set; }
        public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
    }
}
