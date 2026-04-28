using System.ComponentModel.DataAnnotations;

namespace VehiclePartsSystem.Features.Customers.DTOs;

public class RegisterCustomerWithVehicleDto
{
    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    [Required]
    public VehicleCreateDto Vehicle { get; set; } = new();
}
