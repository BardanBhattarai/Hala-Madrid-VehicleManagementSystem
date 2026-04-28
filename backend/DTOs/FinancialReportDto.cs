namespace VehicleManagement.DTOs
{
    public class FinancialReportDto
    {
        public decimal TotalSales { get; set; }
        public decimal TotalPurchases { get; set; }
        public decimal ProfitOrLoss { get; set; }
        public int SalesInvoiceCount { get; set; }
        public int PurchaseInvoiceCount { get; set; }
        public string ReportPeriod { get; set; } = string.Empty;
    }

    public class ReportSummaryDto
    {
        public decimal TotalSales { get; set; }
        public decimal TotalPurchases { get; set; }
        public decimal ProfitOrLoss { get; set; }
        public int LowStockCount { get; set; }
        public List<RecentInvoiceDto> RecentInvoices { get; set; } = new();
    }

    public class RecentInvoiceDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // Sales or Purchase
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
    }
}
