namespace VehiclePartsSystem.Domain.Entities;

public class Vehicle
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

    public Customer Customer { get; set; } = null!;
}
