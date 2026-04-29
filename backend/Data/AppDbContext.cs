using Microsoft.EntityFrameworkCore;
using VehicleManagement.Models;

namespace VehicleManagement.Data
{
    public class AppDbContext : DbContext
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
            });

            modelBuilder.Entity<Vehicle>(e =>
            {
                e.HasKey(v => v.Id);
                e.Property(v => v.VehicleNumber).IsRequired().HasMaxLength(50);
                e.HasOne(v => v.Customer)
                    .WithMany(c => c.Vehicles)
                    .HasForeignKey(v => v.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);
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
        }
    }
}
