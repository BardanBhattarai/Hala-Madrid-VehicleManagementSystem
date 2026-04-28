using System.ComponentModel.DataAnnotations;

namespace VehiclePartsSystem.Features.Customers.DTOs;

public class VehicleDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public int ManufactureYear { get; set; }
    public int Mileage { get; set; }
    public DateTime? LastServiceDate { get; set; }
}

public class VehicleCreateDto
{
    [Required, MaxLength(50)]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [MaxLength(50)]
    public string VehicleType { get; set; } = string.Empty;

    public int ManufactureYear { get; set; }

    public int Mileage { get; set; }

    public DateTime? LastServiceDate { get; set; }
}
