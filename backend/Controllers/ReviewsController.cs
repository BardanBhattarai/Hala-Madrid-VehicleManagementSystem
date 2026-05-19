using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VehicleManagement.DTOs;
using VehicleManagement.Services;
using VehicleManagement.Models;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "Admin,Staff,Customer")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> Create([FromBody] CreateReviewDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<ReviewDto>.Fail("Invalid data"));

        var review = await _reviewService.CreateAsync(dto);
        return Ok(ApiResponse<ReviewDto>.SuccessResponse(review, "Review submitted successfully"));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponseDto<ReviewDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResponseDto<ReviewDto>>>> GetAll([FromQuery] PaginationParamsDto param)
    {
        var reviews = await _reviewService.GetAllAsync(param);
        return Ok(ApiResponse<PaginatedResponseDto<ReviewDto>>.SuccessResponse(reviews));
    }

    [HttpGet("customer/{customerId:int}")]
    [ProducesResponseType(typeof(ApiResponse<List<ReviewDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<ReviewDto>>>> GetByCustomerId(int customerId)
    {
        var reviews = await _reviewService.GetByCustomerIdAsync(customerId);
        return Ok(ApiResponse<List<ReviewDto>>.SuccessResponse(reviews));
    }

    [HttpGet("average")]
    [ProducesResponseType(typeof(ApiResponse<double>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<double>>> GetAverageRating()
    {
        var average = await _reviewService.GetAverageRatingAsync();
        return Ok(ApiResponse<double>.SuccessResponse(average));
    }
}
