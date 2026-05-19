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

    public class CustomerReportsDto
    {
        public List<RegularCustomerDto> Regulars { get; set; } = new();
        public List<HighSpenderDto> HighSpenders { get; set; } = new();
        public List<PendingCreditCustomerDto> PendingCredits { get; set; } = new();
    }

    public class RegularCustomerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int PurchaseCount { get; set; }
    }

    public class HighSpenderDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
    }

    public class PendingCreditCustomerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal CreditBalance { get; set; }
    }
}
