using Microsoft.AspNetCore.Identity;
using VehicleManagement.Models;

namespace VehicleManagement.Data;

public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var dbContext = serviceProvider.GetRequiredService<AppDbContext>();

        // 1. Seed Roles
        string[] roles = { "Admin", "Staff", "Customer" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Seed Default Admin User
        var adminEmail = "admin@fleetflow.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser == null)
        {
            var newAdmin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FullName = "System Administrator"
            };

            var result = await userManager.CreateAsync(newAdmin, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, "Admin");
            }
        }

        // 3. Sync existing Staffs from Staffs table to Identity (Fix for existing staff)
        var staffs = dbContext.Staffs.ToList();
        foreach (var staff in staffs)
        {
            var existing = await userManager.FindByEmailAsync(staff.Email);
            if (existing == null)
            {
                var newIdentityUser = new ApplicationUser
                {
                    UserName = staff.Email,
                    Email = staff.Email,
                    EmailConfirmed = true,
                    FullName = staff.FullName,
                    Role = staff.Role ?? "Staff"
                };
                
                var result = await userManager.CreateAsync(newIdentityUser, staff.Password ?? "Staff@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newIdentityUser, newIdentityUser.Role);
                }
            }
        }
    }
}
