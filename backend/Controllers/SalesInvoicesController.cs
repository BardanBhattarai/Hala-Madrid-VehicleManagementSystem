using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/sales-invoices")]
[Produces("application/json")]
[Authorize]
public class SalesInvoicesController : ControllerBase
{
    private readonly ISalesInvoiceService _service;

    public SalesInvoicesController(ISalesInvoiceService service) => _service = service;

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SalesInvoiceDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<SalesInvoiceDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<SalesInvoiceDto>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto)
    {
        var invoice = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = invoice.Id },
            ApiResponse<SalesInvoiceDto>.SuccessResponse(invoice, "Invoice created successfully."));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponseDto<SalesInvoiceDto>>), StatusCodes.Status200OK)]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParamsDto param)
    {
        var invoices = await _service.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<SalesInvoiceDto>>.SuccessResponse(invoices));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<SalesInvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SalesInvoiceDto>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetById(int id)
    {
        var invoice = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<SalesInvoiceDto>.SuccessResponse(invoice));
    }

    [HttpGet("customer/{customerId:int}")]
    [ProducesResponseType(typeof(ApiResponse<List<SalesInvoiceDto>>), StatusCodes.Status200OK)]
    [Authorize(Roles = "Admin,Staff,Customer")]
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
