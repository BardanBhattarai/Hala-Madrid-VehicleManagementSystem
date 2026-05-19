using System.ComponentModel.DataAnnotations;

namespace VehicleManagement.Models
{
    public class PartRequest
    {
        public int Id { get; set; }
        
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        [Required]
        [MaxLength(200)]
        public string PartName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int Quantity { get; set; }
        
        public PartRequestStatus Status { get; set; } = PartRequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
