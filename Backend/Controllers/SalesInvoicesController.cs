using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsSystem.Common.Exceptions;
using VehiclePartsSystem.Common.Responses;
using VehiclePartsSystem.Features.SalesInvoices.DTOs;
using VehiclePartsSystem.Features.SalesInvoices.Services;

namespace VehiclePartsSystem.Controllers;

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
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<SalesInvoiceDto>.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<SalesInvoiceDto>.Fail(ex.Message));
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _service.GetAllAsync();
        return Ok(ApiResponse<List<SalesInvoiceDto>>.SuccessResponse(invoices));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var invoice = await _service.GetByIdAsync(id);
            return Ok(ApiResponse<SalesInvoiceDto>.SuccessResponse(invoice));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<SalesInvoiceDto>.Fail(ex.Message));
        }
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<IActionResult> GetByCustomer(Guid customerId)
    {
        var invoices = await _service.GetByCustomerIdAsync(customerId);
        return Ok(ApiResponse<List<SalesInvoiceDto>>.SuccessResponse(invoices));
    }
}
