using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class Staff
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty; // Simple for coursework

        [Required]
        public string Role { get; set; } = "Staff"; // Admin or Staff

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
