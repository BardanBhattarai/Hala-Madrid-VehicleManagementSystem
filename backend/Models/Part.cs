using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class Part
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        public int LowStockThreshold { get; set; } = 10;
    }
}
