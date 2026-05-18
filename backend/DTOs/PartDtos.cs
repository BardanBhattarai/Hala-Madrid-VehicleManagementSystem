using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.DTOs
{
    public class PartResponseDto
    {
        public int Id { get; set; }
        public string PartName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int StockQuantity { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PartCreateDto
    {
        [Required(ErrorMessage = "Part name is required")]
        public string PartName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0")]
        public decimal UnitPrice { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; }
    }

    public class PartUpdateDto
    {
        [Required(ErrorMessage = "Part name is required")]
        public string PartName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0")]
        public decimal UnitPrice { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; }
    }
}
