using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IAuthService _authService;

        public StaffController(IStaffService staffService, IAuthService authService)
        {
            _staffService = staffService;
            _authService = authService;
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

        [HttpPost("register")]
        public async Task<IActionResult> RegisterStaff([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Invalid payload", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList(), 400));
            }

            // Automatically force the role to Staff for this endpoint
            model.Role = "Staff";

            var response = await _authService.RegisterUserAsync(model);
            if (!response.IsSuccess)
            {
                return BadRequest(response);
            }

            return Ok(response);
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

        [HttpPost("login")]
        public async Task<ActionResult<StaffResponseDto>> Login(StaffLoginDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _staffService.LoginAsync(dto);
            if (result == null) return Unauthorized(new { message = "Invalid email or password" });

            return Ok(result);
        }
    }
}
