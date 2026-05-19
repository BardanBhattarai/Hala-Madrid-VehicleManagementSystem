using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class Review
    {
        public int Id { get; set; }
        
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
