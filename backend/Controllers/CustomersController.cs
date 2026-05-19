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

    // ═══════════════════════════════════════════════════════════════════
    // EXISTING ENDPOINTS (preserved)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// POST /api/customers/register-with-vehicle
    /// Registers a new customer along with their first vehicle.
    /// </summary>
    [HttpPost("register-with-vehicle")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterWithVehicle([FromBody] RegisterCustomerWithVehicleDto dto)
    {
        var customer = await _service.RegisterWithVehicleAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = customer.Id },
            ApiResponse<CustomerDto>.SuccessResponse(customer, "Customer registered successfully."));
    }

    /// <summary>
    /// GET /api/customers
    /// Returns all customers.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParamsDto param)
    {
        var customers = await _service.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<CustomerDto>>.SuccessResponse(customers));
    }

    /// <summary>
    /// GET /api/customers/{id}
    /// Returns a single customer by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<CustomerDto>.SuccessResponse(customer));
    }

    /// <summary>
    /// POST /api/customers/{id}/vehicles
    /// Adds a new vehicle to an existing customer.
    /// </summary>
    [HttpPost("{id:int}/vehicles")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> AddVehicle(int id, [FromBody] VehicleCreateDto dto)
    {
        var vehicle = await _service.AddVehicleAsync(id, dto);
        return Ok(ApiResponse<VehicleDto>.SuccessResponse(vehicle, "Vehicle added successfully."));
    }

    /// <summary>
    /// GET /api/customers/{id}/profile
    /// Returns the full customer profile with vehicles and purchase history.
    /// </summary>
    [HttpGet("{id:int}/profile")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetProfile(int id)
    {
        var profile = await _service.GetProfileAsync(id);
        return Ok(ApiResponse<CustomerProfileDto>.SuccessResponse(profile));
    }

    /// <summary>
    /// GET /api/customers/{id}/vehicles
    /// Returns all vehicles belonging to a customer.
    /// </summary>
    [HttpGet("{id:int}/vehicles")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetVehicles(int id)
    {
        var vehicles = await _service.GetVehiclesAsync(id);
        return Ok(ApiResponse<List<VehicleDto>>.SuccessResponse(vehicles));
    }

    /// <summary>
    /// GET /api/customers/{id}/purchase-history
    /// Returns all purchase invoices for a customer.
    /// </summary>
    [HttpGet("{id:int}/purchase-history")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetPurchaseHistory(int id)
    {
        var history = await _service.GetPurchaseHistoryAsync(id);
        return Ok(ApiResponse<List<PurchaseHistoryDto>>.SuccessResponse(history));
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 12: Profile Update
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// PUT /api/customers/{id}/profile
    /// Updates the customer's profile information. Only provided fields are updated.
    /// Sample request body:
    /// {
    ///   "fullName": "Ram Bahadur",
    ///   "phoneNumber": "9841234567",
    ///   "email": "ram@example.com",
    ///   "address": "Kathmandu, Nepal",
    ///   "password": "newSecurePass123"
    /// }
    /// </summary>
    [HttpPut("{id:int}/profile")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateCustomerProfileDto dto)
    {
        var updated = await _service.UpdateProfileAsync(id, dto);
        return Ok(ApiResponse<CustomerDto>.SuccessResponse(updated, "Profile updated successfully."));
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 9: Customer Reports
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// GET /api/customers/reports/high-spending?threshold=10000&amp;page=1&amp;pageSize=10&amp;sortBy=name&amp;sortDesc=false
    /// Returns customers whose total spending exceeds the threshold.
    /// Sample response:
    /// {
    ///   "isSuccess": true,
    ///   "data": {
    ///     "items": [ { "id": 1, "fullName": "...", "totalSpending": 15000, ... } ],
    ///     "totalCount": 5, "page": 1, "pageSize": 10, "totalPages": 1
    ///   }
    /// }
    /// </summary>
    [HttpGet("reports/high-spending")]
    public async Task<IActionResult> GetHighSpendingCustomers(
        [FromQuery] decimal threshold = 10000,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDesc = false)
    {
        var result = await _service.GetHighSpendingCustomersAsync(threshold, page, pageSize, sortBy, sortDesc);
        return Ok(ApiResponse<PagedResult<CustomerReportDto>>.SuccessResponse(result));
    }

    /// <summary>
    /// GET /api/customers/reports/regular?minPurchases=3&amp;page=1&amp;pageSize=10
    /// Returns customers who have made at least minPurchases number of purchases.
    /// </summary>
    [HttpGet("reports/regular")]
    public async Task<IActionResult> GetRegularCustomers(
        [FromQuery] int minPurchases = 3,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDesc = false)
    {
        var result = await _service.GetRegularCustomersAsync(minPurchases, page, pageSize, sortBy, sortDesc);
        return Ok(ApiResponse<PagedResult<CustomerReportDto>>.SuccessResponse(result));
    }

    /// <summary>
    /// GET /api/customers/reports/pending-credits?page=1&amp;pageSize=10
    /// Returns customers with outstanding credit balances (CreditBalance > 0).
    /// </summary>
    [HttpGet("reports/pending-credits")]
    public async Task<IActionResult> GetCustomersWithPendingCredits(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDesc = false)
    {
        var result = await _service.GetCustomersWithPendingCreditsAsync(page, pageSize, sortBy, sortDesc);
        return Ok(ApiResponse<PagedResult<CustomerReportDto>>.SuccessResponse(result));
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEATURE 10: Customer Search
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// GET /api/customers/search?name=Ram&amp;phone=984&amp;customerId=5&amp;vehicleNumber=BA1
    /// Flexible search — all query parameters are optional.
    /// Combines conditions with AND logic. Case-insensitive.
    /// Sample response:
    /// {
    ///   "isSuccess": true,
    ///   "data": {
    ///     "items": [ { "id": 1, "fullName": "Ram Bahadur", ... } ],
    ///     "totalCount": 1, "page": 1, "pageSize": 10, "totalPages": 1
    ///   }
    /// }
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchCustomers(
        [FromQuery] string? name = null,
        [FromQuery] string? phone = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? vehicleNumber = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.SearchCustomersAsync(name, phone, customerId, vehicleNumber, page, pageSize);
        return Ok(ApiResponse<PagedResult<CustomerDto>>.SuccessResponse(result));
    }
}
