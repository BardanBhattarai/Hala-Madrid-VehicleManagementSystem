using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VehicleManagement.DTOs;
using VehicleManagement.Services;

using VehicleManagement.Models;
namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class PartsController : ControllerBase
    {
        private readonly IPartService _partService;

        public PartsController(IPartService partService)
        {
            _partService = partService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllParts([FromQuery] PaginationParamsDto param)
        {
            var parts = await _partService.GetAllPartsAsync(param);
            return Ok(ApiResponse<PaginatedResponseDto<PartResponseDto>>.SuccessResponse(parts));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PartResponseDto>> GetPartById(int id)
        {
            var part = await _partService.GetPartByIdAsync(id);
            if (part == null) return NotFound();
            return Ok(part);
        }

        [HttpPost]
        public async Task<ActionResult<PartResponseDto>> CreatePart(PartCreateDto dto)
        {
            var part = await _partService.CreatePartAsync(dto);
            return CreatedAtAction(nameof(GetPartById), new { id = part.Id }, part);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePart(int id, PartUpdateDto dto)
        {
            var updatedPart = await _partService.UpdatePartAsync(id, dto);
            if (updatedPart == null) return NotFound();
            return Ok(updatedPart);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePart(int id)
        {
            var result = await _partService.DeletePartAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
