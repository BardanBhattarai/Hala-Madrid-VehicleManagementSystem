namespace VehicleManagement.DTOs;

public class SalesInvoiceDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string StaffId { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<SalesInvoiceItemDto> Items { get; set; } = new();
}

public class SalesInvoiceItemDto
{
    public int Id { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
