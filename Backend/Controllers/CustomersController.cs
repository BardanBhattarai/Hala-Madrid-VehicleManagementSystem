using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsSystem.Common.Exceptions;
using VehiclePartsSystem.Common.Responses;
using VehiclePartsSystem.Features.Customers.DTOs;
using VehiclePartsSystem.Features.Customers.Services;

namespace VehiclePartsSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
// MERGE: Uncomment after JWT auth is configured by auth team member
// [Authorize(Roles = "Staff")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service) => _service = service;

    [HttpPost("register-with-vehicle")]
    public async Task<IActionResult> RegisterWithVehicle([FromBody] RegisterCustomerWithVehicleDto dto)
    {
        var customer = await _service.RegisterWithVehicleAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = customer.Id },
            ApiResponse<CustomerDto>.SuccessResponse(customer, "Customer registered successfully."));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _service.GetAllAsync();
        return Ok(ApiResponse<List<CustomerDto>>.SuccessResponse(customers));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var customer = await _service.GetByIdAsync(id);
            return Ok(ApiResponse<CustomerDto>.SuccessResponse(customer));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CustomerDto>.Fail(ex.Message));
        }
    }

    [HttpPost("{id:guid}/vehicles")]
    public async Task<IActionResult> AddVehicle(Guid id, [FromBody] VehicleCreateDto dto)
    {
        try
        {
            var vehicle = await _service.AddVehicleAsync(id, dto);
            return Ok(ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Vehicle added successfully."));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<VehicleDto>.Fail(ex.Message));
        }
    }

    [HttpGet("{id:guid}/profile")]
    public async Task<IActionResult> GetProfile(Guid id)
    {
        try
        {
            var profile = await _service.GetProfileAsync(id);
            return Ok(ApiResponse<CustomerProfileDto>.SuccessResponse(profile));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CustomerProfileDto>.Fail(ex.Message));
        }
    }

    [HttpGet("{id:guid}/vehicles")]
    public async Task<IActionResult> GetVehicles(Guid id)
    {
        try
        {
            var vehicles = await _service.GetVehiclesAsync(id);
            return Ok(ApiResponse<List<VehicleDto>>.SuccessResponse(vehicles));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<List<VehicleDto>>.Fail(ex.Message));
        }
    }

    [HttpGet("{id:guid}/purchase-history")]
    public async Task<IActionResult> GetPurchaseHistory(Guid id)
    {
        try
        {
            var history = await _service.GetPurchaseHistoryAsync(id);
            return Ok(ApiResponse<List<PurchaseHistoryDto>>.SuccessResponse(history));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<List<PurchaseHistoryDto>>.Fail(ex.Message));
        }
    }
}
