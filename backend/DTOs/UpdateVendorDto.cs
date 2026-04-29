using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.DTOs;

public class UpdateVendorDto
{
    [Required, MaxLength(200)]
    public string VendorName { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string ContactPerson { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}
