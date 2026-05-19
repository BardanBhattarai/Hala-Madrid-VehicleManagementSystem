using VehicleManagement.DTOs;

namespace VehicleManagement.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(CreateReviewDto dto);
    Task<PaginatedResponseDto<ReviewDto>> GetAllAsync(PaginationParamsDto param);
    Task<List<ReviewDto>> GetByCustomerIdAsync(int customerId);
    Task<double> GetAverageRatingAsync();
}
