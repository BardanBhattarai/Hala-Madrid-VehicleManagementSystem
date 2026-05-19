using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


using VehicleManagement.DTOs;
using VehicleManagement.Services;

using VehicleManagement.Models;
namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/sales-invoices")]
// MERGE: Uncomment after JWT auth is configured by auth team member
// [Authorize(Roles = "Staff")]
public class SalesInvoicesController : ControllerBase
{
    private readonly ISalesInvoiceService _service;

    public SalesInvoicesController(ISalesInvoiceService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto)
    {
        try
        {
            var invoice = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id },
                ApiResponse<SalesInvoiceDto>.SuccessResponse(invoice, "Invoice created successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<SalesInvoiceDto>.Fail(ex.Message));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<SalesInvoiceDto>.Fail(ex.Message));
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _service.GetAllAsync();
        return Ok(ApiResponse<List<SalesInvoiceDto>>.SuccessResponse(invoices));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var invoice = await _service.GetByIdAsync(id);
            return Ok(ApiResponse<SalesInvoiceDto>.SuccessResponse(invoice));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<SalesInvoiceDto>.Fail(ex.Message));
        }
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        var invoices = await _service.GetByCustomerIdAsync(customerId);
        return Ok(ApiResponse<List<SalesInvoiceDto>>.SuccessResponse(invoices));
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 11: Resend Invoice Email
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// POST /api/sales-invoices/{id}/resend-email
    /// Resends the invoice email to the customer's registered email address.
    /// Sample response:
    /// { "isSuccess": true, "message": "Invoice email sent successfully." }
    /// </summary>
    [HttpPost("{id:int}/resend-email")]
    public async Task<IActionResult> ResendInvoiceEmail(int id)
    {
        var sent = await _service.ResendInvoiceEmailAsync(id);
        if (sent)
            return Ok(ApiResponse.SuccessResponse(new { InvoiceId = id }, "Invoice email sent successfully."));
        else
            return StatusCode(500, ApiResponse.Fail("Failed to send invoice email. Please try again later."));
    }
}
