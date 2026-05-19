using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Swashbuckle.AspNetCore.Annotations;

using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers;

/// <summary>
/// Manages service appointments for vehicles.
/// Provides endpoints to create, retrieve, update, and delete appointments,
/// as well as update appointment status and filter by customer.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentsController(IAppointmentService service) => _service = service;

    /// <summary>
    /// Create a new appointment.
    /// </summary>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/appointments
    ///     {
    ///         "customerId": 1,
    ///         "vehicleId": 2,
    ///         "appointmentDate": "2026-06-15T10:00:00",
    ///         "serviceType": "Full Service",
    ///         "notes": "Customer requests brake inspection"
    ///     }
    ///
    /// Validation rules:
    /// - **customerId** and **vehicleId** are required and must reference existing records.
    /// - **appointmentDate** must be a future date.
    /// - **serviceType** is required (max 100 characters).
    /// - **notes** is optional (max 500 characters).
    /// </remarks>
    /// <param name="dto">The appointment creation payload.</param>
    /// <returns>The newly created appointment.</returns>
    /// <response code="201">Appointment created successfully.</response>
    /// <response code="400">Validation failed or business rule violation.</response>
    /// <response code="404">Referenced customer or vehicle not found.</response>
    [HttpPost]
    [SwaggerOperation(
        Summary = "Create a new appointment",
        Description = "Schedules a new service appointment for a customer's vehicle. The appointment date must be in the future.",
        OperationId = "CreateAppointment",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        var appointment = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = appointment.Id },
            ApiResponse<AppointmentResponseDto>.SuccessResponse(appointment, "Appointment created successfully."));
    }

    /// <summary>
    /// Retrieve all appointments.
    /// </summary>
    /// <returns>A list of all appointments.</returns>
    /// <response code="200">List of appointments returned successfully.</response>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Get all appointments",
        Description = "Retrieves all appointments with customer and vehicle information.",
        OperationId = "GetAllAppointments",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponseDto<AppointmentResponseDto>>), StatusCodes.Status200OK)]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParamsDto param)
    {
        var appointments = await _service.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<AppointmentResponseDto>>.SuccessResponse(appointments));
    }

    /// <summary>
    /// Retrieve a single appointment by ID.
    /// </summary>
    /// <param name="id">The appointment ID.</param>
    /// <returns>The appointment matching the given ID.</returns>
    /// <response code="200">Appointment found and returned.</response>
    /// <response code="404">No appointment exists with the specified ID.</response>
    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Get appointment by ID",
        Description = "Retrieves a specific appointment by its unique identifier.",
        OperationId = "GetAppointmentById",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<AppointmentResponseDto>.SuccessResponse(appointment));
    }

    /// <summary>
    /// Retrieve all appointments for a specific customer.
    /// </summary>
    /// <param name="customerId">The customer ID to filter by.</param>
    /// <returns>A list of appointments belonging to the specified customer.</returns>
    /// <response code="200">Customer appointments returned (may be empty).</response>
    [HttpGet("customer/{customerId:int}")]
    [SwaggerOperation(
        Summary = "Get appointments by customer",
        Description = "Retrieves all appointments associated with a given customer ID.",
        OperationId = "GetAppointmentsByCustomer",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<List<AppointmentResponseDto>>), StatusCodes.Status200OK)]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        var appointments = await _service.GetByCustomerIdAsync(customerId);
        return Ok(ApiResponse<List<AppointmentResponseDto>>.SuccessResponse(appointments));
    }

    /// <summary>
    /// Update an existing appointment.
    /// </summary>
    /// <param name="id">The appointment ID to update.</param>
    /// <param name="dto">The updated appointment data.</param>
    /// <returns>The updated appointment.</returns>
    /// <response code="200">Appointment updated successfully.</response>
    /// <response code="404">Appointment not found.</response>
    [HttpPut("{id:int}")]
    [SwaggerOperation(
        Summary = "Update an appointment",
        Description = "Updates the details of an existing appointment including date, service type, status, and notes.",
        OperationId = "UpdateAppointment",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentDto dto)
    {
        var appointment = await _service.UpdateAsync(id, dto);
        return Ok(ApiResponse<AppointmentResponseDto>.SuccessResponse(appointment, "Appointment updated successfully."));
    }

    /// <summary>
    /// Update only the status of an appointment.
    /// </summary>
    /// <remarks>
    /// **Status enum values:**
    /// | Value | Name      | Description                        |
    /// |-------|-----------|-------------------------------------|
    /// | 0     | Pending   | Awaiting approval                  |
    /// | 1     | Approved  | Confirmed by staff                 |
    /// | 2     | Completed | Service finished                   |
    /// | 3     | Cancelled | Appointment cancelled              |
    ///
    /// Invalid status transitions (e.g. Completed → Pending) will return 409.
    /// </remarks>
    /// <param name="id">The appointment ID.</param>
    /// <param name="status">The new status value (enum integer).</param>
    /// <returns>The updated appointment.</returns>
    /// <response code="200">Status updated successfully.</response>
    /// <response code="409">Invalid status transition.</response>
    /// <response code="404">Appointment not found.</response>
    [HttpPatch("{id:int}/status")]
    [SwaggerOperation(
        Summary = "Update appointment status",
        Description = "Updates the status of an appointment (Pending → Approved → Completed, or Cancelled). Invalid transitions are rejected.",
        OperationId = "UpdateAppointmentStatus",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<AppointmentResponseDto>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] AppointmentStatus status)
    {
        var appointment = await _service.UpdateStatusAsync(id, status);
        return Ok(ApiResponse<AppointmentResponseDto>.SuccessResponse(appointment, "Appointment status updated successfully."));
    }

    /// <summary>
    /// Delete an appointment.
    /// </summary>
    /// <param name="id">The appointment ID to delete.</param>
    /// <returns>A success confirmation message.</returns>
    /// <response code="200">Appointment deleted successfully.</response>
    /// <response code="404">Appointment not found.</response>
    [HttpDelete("{id:int}")]
    [SwaggerOperation(
        Summary = "Delete an appointment",
        Description = "Permanently deletes the specified appointment.",
        OperationId = "DeleteAppointment",
        Tags = new[] { "Appointments" }
    )]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.SuccessResponse("Appointment deleted successfully."));
    }
}
