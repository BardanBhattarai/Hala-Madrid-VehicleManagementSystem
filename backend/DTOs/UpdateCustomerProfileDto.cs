using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.DTOs;

/// <summary>
/// DTO for updating an existing customer's profile information.
/// All fields are optional — only provided fields will be updated.
/// </summary>
public class UpdateCustomerProfileDto
{
    [MaxLength(200)]
    public string? FullName { get; set; }

    [Phone, MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// Optional new password. If provided, it will be hashed and stored.
    /// </summary>
    [MinLength(6)]
    public string? Password { get; set; }
}
