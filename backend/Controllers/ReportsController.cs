using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Services;

using VehicleManagement.Models;
namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("daily")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date)
        {
            var reportDate = date ?? DateTime.UtcNow;
            var report = await _reportService.GetDailyReportAsync(reportDate);
            return Ok(report);
        }

        [HttpGet("monthly")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMonthlyReport([FromQuery] int? year, [FromQuery] int? month)
        {
            var reportYear = year ?? DateTime.UtcNow.Year;
            var reportMonth = month ?? DateTime.UtcNow.Month;

            if (reportMonth < 1 || reportMonth > 12)
                return BadRequest("Invalid month value.");

            var report = await _reportService.GetMonthlyReportAsync(reportYear, reportMonth);
            return Ok(report);
        }

        [HttpGet("yearly")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetYearlyReport([FromQuery] int? year)
        {
            var reportYear = year ?? DateTime.UtcNow.Year;
            var report = await _reportService.GetYearlyReportAsync(reportYear);
            return Ok(report);
        }

        [HttpGet("summary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _reportService.GetSummaryReportAsync();
            return Ok(summary);
        }

        [HttpGet("customers")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetCustomerReports()
        {
            var reports = await _reportService.GetCustomerReportsAsync();
            return Ok(reports);
        }
    }
}
