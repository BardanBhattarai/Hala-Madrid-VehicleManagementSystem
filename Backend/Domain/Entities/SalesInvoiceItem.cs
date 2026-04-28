namespace VehiclePartsSystem.Domain.Entities;

public class SalesInvoiceItem
{
    public Guid Id { get; set; }
    public Guid SalesInvoiceId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public SalesInvoice SalesInvoice { get; set; } = null!;
    public Part Part { get; set; } = null!;
}
