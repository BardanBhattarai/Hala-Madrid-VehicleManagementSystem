using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "System";

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
