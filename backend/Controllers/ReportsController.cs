using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Services;

namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Uncomment when authentication is fully set up
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("daily")]
        public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date)
        {
            var reportDate = date ?? DateTime.UtcNow;
            var report = await _reportService.GetDailyReportAsync(reportDate);
            return Ok(report);
        }

        [HttpGet("monthly")]
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
        public async Task<IActionResult> GetYearlyReport([FromQuery] int? year)
        {
            var reportYear = year ?? DateTime.UtcNow.Year;
            var report = await _reportService.GetYearlyReportAsync(reportYear);
            return Ok(report);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _reportService.GetSummaryReportAsync();
            return Ok(summary);
        }
    }
}
