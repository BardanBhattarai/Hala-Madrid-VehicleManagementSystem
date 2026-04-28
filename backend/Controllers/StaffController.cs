using Microsoft.AspNetCore.Mvc;
using VehicleManagement.DTOs;
using VehicleManagement.Services;

namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Uncomment when auth is fully setup
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffResponseDto>>> GetAll()
        {
            var staff = await _staffService.GetAllStaffAsync();
            return Ok(staff);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffResponseDto>> GetById(int id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null) return NotFound(new { message = "Staff not found" });
            return Ok(staff);
        }

        [HttpPost]
        public async Task<ActionResult<StaffResponseDto>> Create(StaffCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            try 
            {
                var result = await _staffService.CreateStaffAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, StaffUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _staffService.UpdateStaffAsync(id, dto);
            if (!success) return NotFound(new { message = "Staff not found" });

            return Ok(new { message = "Staff updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _staffService.DeleteStaffAsync(id);
            if (!success) return NotFound(new { message = "Staff not found" });

            return Ok(new { message = "Staff deleted successfully" });
        }
    }
}
