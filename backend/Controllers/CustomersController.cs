using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service) => _service = service;

    [HttpPost("register-with-vehicle")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterWithVehicle([FromBody] RegisterCustomerWithVehicleDto dto)
    {
        try
        {
            var customer = await _service.RegisterWithVehicleAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = customer.Id },
                ApiResponse<CustomerDto>.SuccessResponse(customer, "Customer registered successfully."));
        }
        catch (System.Exception ex)
        {
            // Log the error here if you have a logger
            return BadRequest(ApiResponse<CustomerDto>.Fail($"Registration failed: {ex.Message}"));
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParamsDto param)
    {
        var customers = await _service.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<CustomerDto>>.SuccessResponse(customers));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var customer = await _service.GetByIdAsync(id);
            return Ok(ApiResponse<CustomerDto>.SuccessResponse(customer));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<CustomerDto>.Fail(ex.Message));
        }
    }

    [HttpPost("{id:int}/vehicles")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> AddVehicle(int id, [FromBody] VehicleCreateDto dto)
    {
        try
        {
            var vehicle = await _service.AddVehicleAsync(id, dto);
            return Ok(ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Vehicle added successfully."));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<VehicleDto>.Fail(ex.Message));
        }
    }

    [HttpGet("{id:int}/profile")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetProfile(int id)
    {
        try
        {
            var profile = await _service.GetProfileAsync(id);
            return Ok(ApiResponse<CustomerProfileDto>.SuccessResponse(profile));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<CustomerProfileDto>.Fail(ex.Message));
        }
    }

    [HttpGet("{id:int}/vehicles")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetVehicles(int id)
    {
        try
        {
            var vehicles = await _service.GetVehiclesAsync(id);
            return Ok(ApiResponse<List<VehicleDto>>.SuccessResponse(vehicles));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<List<VehicleDto>>.Fail(ex.Message));
        }
    }

    [HttpGet("{id:int}/purchase-history")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetPurchaseHistory(int id)
    {
        try
        {
            var history = await _service.GetPurchaseHistoryAsync(id);
            return Ok(ApiResponse<List<PurchaseHistoryDto>>.SuccessResponse(history));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<List<PurchaseHistoryDto>>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] CustomerUpdateDto dto)
    {
        try
        {
            var updatedCustomer = await _service.UpdateProfileAsync(id, dto);
            return Ok(ApiResponse<CustomerDto>.SuccessResponse(updatedCustomer, "Profile updated successfully."));
        }
        catch (System.Exception ex)
        {
            return BadRequest(ApiResponse<CustomerDto>.Fail(ex.Message));
        }
    }
}
