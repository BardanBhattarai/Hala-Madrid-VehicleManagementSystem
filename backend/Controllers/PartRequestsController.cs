using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PartRequestsController : ControllerBase
{
    private readonly IPartRequestService _partRequestService;

    public PartRequestsController(IPartRequestService partRequestService)
    {
        _partRequestService = partRequestService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PartRequestDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<PartRequestDto>>> Create([FromBody] CreatePartRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PartRequestDto>.Fail("Invalid data"));

        var request = await _partRequestService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = request.Id },
            ApiResponse<PartRequestDto>.SuccessResponse(request, "Part request created successfully"));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponseDto<PartRequestDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResponseDto<PartRequestDto>>>> GetAll([FromQuery] PaginationParamsDto param)
    {
        var requests = await _partRequestService.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<PartRequestDto>>.SuccessResponse(requests));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PartRequestDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PartRequestDto>>> GetById(int id)
    {
        var request = await _partRequestService.GetByIdAsync(id);
        return Ok(ApiResponse<PartRequestDto>.SuccessResponse(request));
    }

    [HttpGet("customer/{customerId:int}")]
    [ProducesResponseType(typeof(ApiResponse<List<PartRequestDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<PartRequestDto>>>> GetByCustomerId(int customerId)
    {
        var requests = await _partRequestService.GetByCustomerIdAsync(customerId);
        return Ok(ApiResponse<List<PartRequestDto>>.SuccessResponse(requests));
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<PartRequestDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PartRequestDto>>> UpdateStatus(int id, [FromBody] string status)
    {
        // Clean the status string (remove surrounding quotes if sent raw)
        status = status?.Trim().Trim('"') ?? string.Empty;

        var request = await _partRequestService.UpdateStatusAsync(id, status);
        return Ok(ApiResponse<PartRequestDto>.SuccessResponse(request, "Status updated successfully"));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await _partRequestService.DeleteAsync(id);
        return Ok(ApiResponse<object>.SuccessResponse(new object(), "Part request deleted successfully"));
    }
}
