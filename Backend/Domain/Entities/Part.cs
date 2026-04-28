namespace VehiclePartsSystem.Domain.Entities;

// MERGE: This is a stub. Replace with the shared Part entity from the inventory team member.
// Fields required by SalesInvoice: Id, PartName, StockQuantity, UnitPrice
public class Part
{
    public Guid Id { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}
