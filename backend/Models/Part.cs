using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class Part
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PartName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        [Required]
        public decimal UnitPrice { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        public int LowStockThreshold { get; set; } = 10;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
