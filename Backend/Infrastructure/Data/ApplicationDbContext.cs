using Microsoft.EntityFrameworkCore;
using VehiclePartsSystem.Domain.Entities;

namespace VehiclePartsSystem.Infrastructure.Data;

// SHARED FILE — each team member adds their DbSet block in the section below.
// Coordinate via GitHub PRs to avoid merge conflicts on this file.
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // --- Tasks 5-8: Vendors, Customers, Sales (owned by Tasks 5-8 member) ---
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();
    public DbSet<SalesInvoiceItem> SalesInvoiceItems => Set<SalesInvoiceItem>();
    public DbSet<Part> Parts => Set<Part>(); // MERGE: replace with inventory team's DbSet
    // --- End Tasks 5-8 ---

    // MERGE: Other team members add their DbSet declarations below this line

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Tasks 5-8 configurations ---
        modelBuilder.Entity<Vendor>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.VendorName).IsRequired().HasMaxLength(200);
            e.Property(v => v.Email).HasMaxLength(200);
            e.Property(v => v.PhoneNumber).HasMaxLength(20);
            e.Property(v => v.CompanyName).HasMaxLength(200);
            e.Property(v => v.ContactPerson).HasMaxLength(200);
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.FullName).IsRequired().HasMaxLength(200);
            e.Property(c => c.Email).HasMaxLength(200);
            e.Property(c => c.PhoneNumber).HasMaxLength(20);
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
            e.Property(s => s.SubTotal).HasPrecision(18, 2);
            e.Property(s => s.DiscountAmount).HasPrecision(18, 2);
            e.Property(s => s.TotalAmount).HasPrecision(18, 2);
            e.Property(s => s.PaidAmount).HasPrecision(18, 2);
            e.Property(s => s.DueAmount).HasPrecision(18, 2);
            e.Property(s => s.PaymentStatus).HasConversion<string>();
            e.HasOne(s => s.Customer)
                .WithMany(c => c.SalesInvoices)
                .HasForeignKey(s => s.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SalesInvoiceItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
            e.Property(i => i.TotalPrice).HasPrecision(18, 2);
            e.HasOne(i => i.SalesInvoice)
                .WithMany(s => s.Items)
                .HasForeignKey(i => i.SalesInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Part)
                .WithMany()
                .HasForeignKey(i => i.PartId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Part>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.PartName).IsRequired().HasMaxLength(200);
            e.Property(p => p.UnitPrice).HasPrecision(18, 2);
        });
        // --- End Tasks 5-8 configurations ---
    }
}
