using VehicleManagement.DTOs;


using VehicleManagement.Models;
namespace VehicleManagement.Services
{
    public interface IReportService
    {
        Task<FinancialReportDto> GetDailyReportAsync(DateTime date);
        Task<FinancialReportDto> GetMonthlyReportAsync(int year, int month);
        Task<FinancialReportDto> GetYearlyReportAsync(int year);
        Task<ReportSummaryDto> GetSummaryReportAsync();
    }
}
