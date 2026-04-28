namespace VehiclePartsSystem.Features.Customers.DTOs;

public class CustomerProfileDto
{
    public CustomerDto Customer { get; set; } = new();
    public List<VehicleDto> Vehicles { get; set; } = new();
    public List<PurchaseHistoryDto> PurchaseHistory { get; set; } = new();
}
