using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FinancialReportDto> GetDailyReportAsync(DateTime date)
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            var sales = await _context.SalesInvoices
                .Where(s => s.InvoiceDate >= dayStart && s.InvoiceDate < dayEnd)
                .ToListAsync();

            var purchases = await _context.PurchaseInvoices
                .Where(p => p.PurchaseDate >= dayStart && p.PurchaseDate < dayEnd)
                .ToListAsync();

            var totalSales = sales.Sum(s => s.TotalAmount);
            var totalPurchases = purchases.Sum(p => p.TotalAmount);

            return new FinancialReportDto
            {
                TotalSales = totalSales,
                TotalPurchases = totalPurchases,
                ProfitOrLoss = totalSales - totalPurchases,
                SalesInvoiceCount = sales.Count,
                PurchaseInvoiceCount = purchases.Count,
                ReportPeriod = date.ToString("yyyy-MM-dd")
            };
        }

        public async Task<FinancialReportDto> GetMonthlyReportAsync(int year, int month)
        {
            var monthStart = new DateTime(year, month, 1);
            var monthEnd = monthStart.AddMonths(1);

            var sales = await _context.SalesInvoices
                .Where(s => s.InvoiceDate >= monthStart && s.InvoiceDate < monthEnd)
                .ToListAsync();

            var purchases = await _context.PurchaseInvoices
                .Where(p => p.PurchaseDate >= monthStart && p.PurchaseDate < monthEnd)
                .ToListAsync();

            var totalSales = sales.Sum(s => s.TotalAmount);
            var totalPurchases = purchases.Sum(p => p.TotalAmount);

            return new FinancialReportDto
            {
                TotalSales = totalSales,
                TotalPurchases = totalPurchases,
                ProfitOrLoss = totalSales - totalPurchases,
                SalesInvoiceCount = sales.Count,
                PurchaseInvoiceCount = purchases.Count,
                ReportPeriod = monthStart.ToString("MMMM yyyy")
            };
        }

        public async Task<FinancialReportDto> GetYearlyReportAsync(int year)
        {
            var yearStart = new DateTime(year, 1, 1);
            var yearEnd = yearStart.AddYears(1);

            var sales = await _context.SalesInvoices
                .Where(s => s.InvoiceDate >= yearStart && s.InvoiceDate < yearEnd)
                .ToListAsync();

            var purchases = await _context.PurchaseInvoices
                .Where(p => p.PurchaseDate >= yearStart && p.PurchaseDate < yearEnd)
                .ToListAsync();

            var totalSales = sales.Sum(s => s.TotalAmount);
            var totalPurchases = purchases.Sum(p => p.TotalAmount);

            return new FinancialReportDto
            {
                TotalSales = totalSales,
                TotalPurchases = totalPurchases,
                ProfitOrLoss = totalSales - totalPurchases,
                SalesInvoiceCount = sales.Count,
                PurchaseInvoiceCount = purchases.Count,
                ReportPeriod = year.ToString()
            };
        }

        public async Task<ReportSummaryDto> GetSummaryReportAsync()
        {
            try 
            {
                var totalSales = await _context.SalesInvoices.SumAsync(s => s.TotalAmount);
                var totalPurchases = await _context.PurchaseInvoices.SumAsync(p => p.TotalAmount);
                var lowStockCount = await _context.Parts.CountAsync(p => p.StockQuantity <= p.LowStockThreshold);

                var recentSales = await _context.SalesInvoices
                    .OrderByDescending(s => s.InvoiceDate)
                    .Take(5)
                    .Select(s => new RecentInvoiceDto { Id = s.Id, Type = "Sales", Amount = s.TotalAmount, Date = s.InvoiceDate })
                    .ToListAsync();

                var recentPurchases = await _context.PurchaseInvoices
                    .OrderByDescending(p => p.PurchaseDate)
                    .Take(5)
                    .Select(p => new RecentInvoiceDto { Id = p.Id, Type = "Purchase", Amount = p.TotalAmount, Date = p.PurchaseDate })
                    .ToListAsync();

                var recentInvoices = recentSales.Concat(recentPurchases)
                    .OrderByDescending(i => i.Date)
                    .Take(5)
                    .ToList();

                return new ReportSummaryDto
                {
                    TotalSales = totalSales,
                    TotalPurchases = totalPurchases,
                    ProfitOrLoss = totalSales - totalPurchases,
                    LowStockCount = lowStockCount,
                    RecentInvoices = recentInvoices
                };
            }
            catch (Exception)
            {
                return new ReportSummaryDto
                {
                    TotalSales = 0,
                    TotalPurchases = 0,
                    ProfitOrLoss = 0,
                    LowStockCount = 0,
                    RecentInvoices = new List<RecentInvoiceDto>()
                };
            }
        }

        public async Task<CustomerReportsDto> GetCustomerReportsAsync()
        {
            try
            {
                // 1. Regulars
                var regularsGroup = await _context.SalesInvoices
                    .AsNoTracking()
                    .Where(si => si.CustomerId != null)
                    .GroupBy(si => si.CustomerId)
                    .Select(g => new { CustomerId = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(10)
                    .ToListAsync();

                var regularCustomerIds = regularsGroup.Select(x => x.CustomerId!.Value).ToList();
                var regularCustomers = await _context.Customers
                    .AsNoTracking()
                    .Where(c => regularCustomerIds.Contains(c.Id))
                    .ToListAsync();

                var regularsList = regularsGroup.Select(rg => 
                {
                    var cust = regularCustomers.FirstOrDefault(c => c.Id == rg.CustomerId);
                    return new RegularCustomerDto
                    {
                        Id = rg.CustomerId ?? 0,
                        FullName = cust?.FullName ?? "Unknown",
                        PhoneNumber = cust?.PhoneNumber ?? string.Empty,
                        Email = cust?.Email ?? string.Empty,
                        PurchaseCount = rg.Count
                    };
                }).ToList();

                // 2. High Spenders
                var spendersGroup = await _context.SalesInvoices
                    .AsNoTracking()
                    .Where(si => si.CustomerId != null)
                    .GroupBy(si => si.CustomerId)
                    .Select(g => new { CustomerId = g.Key, Total = g.Sum(x => x.TotalAmount) })
                    .OrderByDescending(x => x.Total)
                    .Take(10)
                    .ToListAsync();

                var spenderCustomerIds = spendersGroup.Select(x => x.CustomerId!.Value).ToList();
                var spenderCustomers = await _context.Customers
                    .AsNoTracking()
                    .Where(c => spenderCustomerIds.Contains(c.Id))
                    .ToListAsync();

                var spendersList = spendersGroup.Select(sg => 
                {
                    var cust = spenderCustomers.FirstOrDefault(c => c.Id == sg.CustomerId);
                    return new HighSpenderDto
                    {
                        Id = sg.CustomerId ?? 0,
                        FullName = cust?.FullName ?? "Unknown",
                        PhoneNumber = cust?.PhoneNumber ?? string.Empty,
                        Email = cust?.Email ?? string.Empty,
                        TotalSpent = sg.Total
                    };
                }).ToList();

                // 3. Pending Credits
                var pendingCreditsList = await _context.Customers
                    .AsNoTracking()
                    .Where(c => c.CreditBalance > 0)
                    .OrderByDescending(c => c.CreditBalance)
                    .Take(10)
                    .Select(c => new PendingCreditCustomerDto
                    {
                        Id = c.Id,
                        FullName = c.FullName,
                        PhoneNumber = c.PhoneNumber,
                        Email = c.Email,
                        CreditBalance = c.CreditBalance
                    })
                    .ToListAsync();

                return new CustomerReportsDto
                {
                    Regulars = regularsList,
                    HighSpenders = spendersList,
                    PendingCredits = pendingCreditsList
                };
            }
            catch (Exception)
            {
                return new CustomerReportsDto();
            }
        }
    }
}
