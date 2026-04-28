namespace VehiclePartsSystem.Features.Customers.DTOs;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal CreditBalance { get; set; }
    public DateTime CreatedAt { get; set; }
}
