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
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<Staff> Staffs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Seed data or additional configuration can go here
        }
    }
}
