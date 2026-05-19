using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


using VehicleManagement.DTOs;
using VehicleManagement.Services;

using VehicleManagement.Models;
namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _service;

    public VendorsController(IVendorService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParamsDto param)
    {
        var vendors = await _service.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<VendorDto>>.SuccessResponse(vendors));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var vendor = await _service.GetByIdAsync(id);
            return Ok(ApiResponse<VendorDto>.SuccessResponse(vendor));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<VendorDto>.Fail(ex.Message));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorDto dto)
    {
        var vendor = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id },
            ApiResponse<VendorDto>.SuccessResponse(vendor, "Vendor created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorDto dto)
    {
        try
        {
            var vendor = await _service.UpdateAsync(id, dto);
            return Ok(ApiResponse<VendorDto>.SuccessResponse(vendor, "Vendor updated successfully."));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<VendorDto>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return Ok(ApiResponse<string>.SuccessResponse("Vendor deleted successfully."));
        }
        catch (System.Exception ex)
        {
            return NotFound(ApiResponse<string>.Fail(ex.Message));
        }
    }
}
