using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.Models;

namespace VehicleManagement.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Part> Parts { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<PartRequest> PartRequests { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Vendor>(e =>
            {
                e.HasKey(v => v.Id);
                e.Property(v => v.VendorName).IsRequired().HasMaxLength(200);
            });

            modelBuilder.Entity<Customer>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.FullName).IsRequired().HasMaxLength(200);
                e.Property(c => c.CreditBalance).HasPrecision(18, 2);
                e.Property(c => c.PasswordHash).HasMaxLength(500);

                // Feature 10: Indexes for efficient search queries
                e.HasIndex(c => c.FullName).HasDatabaseName("IX_Customer_FullName");
                e.HasIndex(c => c.PhoneNumber).HasDatabaseName("IX_Customer_PhoneNumber");
                e.HasIndex(c => c.Email).HasDatabaseName("IX_Customer_Email");
            });

            modelBuilder.Entity<Vehicle>(e =>
            {
                e.HasKey(v => v.Id);
                e.Property(v => v.VehicleNumber).IsRequired().HasMaxLength(50);
                e.HasOne(v => v.Customer)
                    .WithMany(c => c.Vehicles)
                    .HasForeignKey(v => v.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Feature 10: Index for vehicle number search
                e.HasIndex(v => v.VehicleNumber).HasDatabaseName("IX_Vehicle_VehicleNumber");
            });

            modelBuilder.Entity<SalesInvoice>(e =>
            {
                e.HasKey(s => s.Id);
                e.Property(s => s.TotalAmount).HasPrecision(18, 2);
                e.Property(s => s.PaymentStatus).HasConversion<string>();
            });

            modelBuilder.Entity<SalesInvoiceItem>(e =>
            {
                e.HasKey(i => i.Id);
                e.Property(i => i.UnitPrice).HasPrecision(18, 2);
                e.Property(i => i.TotalPrice).HasPrecision(18, 2);
            });

            modelBuilder.Entity<PurchaseInvoice>(e =>
            {
                e.HasKey(p => p.Id);
                e.Property(p => p.TotalAmount).HasPrecision(18, 2);
            });

            modelBuilder.Entity<PurchaseInvoiceItem>(e =>
            {
                e.HasKey(i => i.Id);
                e.Property(i => i.UnitPrice).HasPrecision(18, 2);
                e.Property(i => i.TotalPrice).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Appointment>(e =>
            {
                e.HasKey(a => a.Id);
                e.Property(a => a.ServiceType).IsRequired().HasMaxLength(100);
                e.Property(a => a.Notes).HasMaxLength(500);
                e.Property(a => a.Status).HasConversion<string>();
                e.HasOne(a => a.Customer)
                    .WithMany(c => c.Appointments)
                    .HasForeignKey(a => a.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(a => a.Vehicle)
                    .WithMany(v => v.Appointments)
                    .HasForeignKey(a => a.VehicleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PartRequest>(e =>
            {
                e.HasKey(pr => pr.Id);
                e.Property(pr => pr.PartName).IsRequired().HasMaxLength(200);
                e.Property(pr => pr.Description).HasMaxLength(500);
                e.Property(pr => pr.Status).HasConversion<string>();
                e.HasOne(pr => pr.Customer)
                    .WithMany()
                    .HasForeignKey(pr => pr.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Review>(e =>
            {
                e.HasKey(r => r.Id);
                e.Property(r => r.Comment).HasMaxLength(1000);
                e.HasOne(r => r.Customer)
                    .WithMany()
                    .HasForeignKey(r => r.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(r => r.Appointment)
                    .WithMany()
                    .HasForeignKey(r => r.AppointmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
