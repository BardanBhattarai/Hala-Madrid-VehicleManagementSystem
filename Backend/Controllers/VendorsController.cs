using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsSystem.Common.Exceptions;
using VehiclePartsSystem.Common.Responses;
using VehiclePartsSystem.Features.Vendors.DTOs;
using VehiclePartsSystem.Features.Vendors.Services;

namespace VehiclePartsSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
// MERGE: Uncomment after JWT auth is configured by auth team member
// [Authorize(Roles = "Admin")]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _service;

    public VendorsController(IVendorService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var vendors = await _service.GetAllAsync();
        return Ok(ApiResponse<List<VendorDto>>.SuccessResponse(vendors));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var vendor = await _service.GetByIdAsync(id);
            return Ok(ApiResponse<VendorDto>.SuccessResponse(vendor));
        }
        catch (NotFoundException ex)
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVendorDto dto)
    {
        try
        {
            var vendor = await _service.UpdateAsync(id, dto);
            return Ok(ApiResponse<VendorDto>.SuccessResponse(vendor, "Vendor updated successfully."));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<VendorDto>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return Ok(ApiResponse<string>.SuccessResponse("Vendor deleted successfully."));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<string>.Fail(ex.Message));
        }
    }
}
