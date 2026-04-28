namespace VehiclePartsSystem.Domain.Entities;

public class SalesInvoice
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    // MERGE: StaffId will become FK to ApplicationUser.Id (string) after auth team merges
    public string StaffId { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime CreatedAt { get; set; }

    public Customer Customer { get; set; } = null!;
    public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
}
