using System.ComponentModel.DataAnnotations;
using VehicleManagement.Models;

namespace VehicleManagement.DTOs
{
    // ─── Custom Validation ──────────────────────────────────────────────

    /// <summary>
    /// Validates that the date value is in the future.
    /// </summary>
    public class FutureDateAttribute : ValidationAttribute
    {
        public FutureDateAttribute()
            : base("The {0} must be a future date.") { }

        public override bool IsValid(object? value)
        {
            if (value is DateTime dateTime)
                return dateTime > DateTime.UtcNow;

            return true; // Let [Required] handle nulls
        }
    }

    // ─── Create DTO ─────────────────────────────────────────────────────

    public class CreateAppointmentDto
    {
        [Required(ErrorMessage = "Customer ID is required.")]
        public int CustomerId { get; set; }

        [Required(ErrorMessage = "Vehicle ID is required.")]
        public int VehicleId { get; set; }

        [Required(ErrorMessage = "Appointment date is required.")]
        [FutureDate(ErrorMessage = "Appointment date must be in the future.")]
        public DateTime AppointmentDate { get; set; }

        [Required(ErrorMessage = "Service type is required.")]
        [MaxLength(100, ErrorMessage = "Service type cannot exceed 100 characters.")]
        public string ServiceType { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters.")]
        public string? Notes { get; set; }
    }

    // ─── Update DTO ─────────────────────────────────────────────────────

    public class UpdateAppointmentDto
    {
        [Required(ErrorMessage = "Appointment date is required.")]
        [FutureDate(ErrorMessage = "Appointment date must be in the future.")]
        public DateTime AppointmentDate { get; set; }

        [Required(ErrorMessage = "Service type is required.")]
        [MaxLength(100, ErrorMessage = "Service type cannot exceed 100 characters.")]
        public string ServiceType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Status is required.")]
        public AppointmentStatus Status { get; set; }

        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters.")]
        public string? Notes { get; set; }
    }

    // ─── Response DTO ───────────────────────────────────────────────────

    public class AppointmentResponseDto
    {
        public int Id { get; set; }

        // Customer info (denormalized)
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;

        // Vehicle info (denormalized)
        public int VehicleId { get; set; }
        public string VehicleNumber { get; set; } = string.Empty;
        public string VehicleBrand { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;

        public DateTime AppointmentDate { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
