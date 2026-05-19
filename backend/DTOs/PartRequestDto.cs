using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.DTOs
{
    public class CreatePartRequestDto
    {
        [Required]
        public int CustomerId { get; set; }

        [Required]
        [StringLength(200)]
        public string PartName { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(1, 1000)]
        public int Quantity { get; set; }
    }

    public class UpdatePartRequestStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class PartRequestDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string PartName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
