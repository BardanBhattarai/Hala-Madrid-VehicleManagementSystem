using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services
{
    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public StaffService(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IEnumerable<StaffResponseDto>> GetAllStaffAsync()
        {
            return await _context.Staffs
                .Select(s => new StaffResponseDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Email = s.Email,
                    Role = s.Role,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<StaffResponseDto?> GetStaffByIdAsync(int id)
        {
            var s = await _context.Staffs.FindAsync(id);
            if (s == null) return null;

            return new StaffResponseDto
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email,
                Role = s.Role,
                CreatedAt = s.CreatedAt
            };
        }

        public async Task<StaffResponseDto> CreateStaffAsync(StaffCreateDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("User with this email already exists in Identity.");
            }

            var identityUser = new ApplicationUser
            {
                Email = dto.Email,
                UserName = dto.Email,
                FullName = dto.FullName,
                Role = dto.Role,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await _userManager.CreateAsync(identityUser, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create Identity user: {errors}");
            }

            if (!await _roleManager.RoleExistsAsync(dto.Role))
            {
                await _roleManager.CreateAsync(new IdentityRole(dto.Role));
            }
            await _userManager.AddToRoleAsync(identityUser, dto.Role);

            var staff = new Staff
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password, // In real apps, hash this!
                Role = dto.Role
            };

            _context.Staffs.Add(staff);
            await _context.SaveChangesAsync();

            return new StaffResponseDto
            {
                Id = staff.Id,
                FullName = staff.FullName,
                Email = staff.Email,
                Role = staff.Role,
                CreatedAt = staff.CreatedAt
            };
        }

        public async Task<bool> UpdateStaffAsync(int id, StaffUpdateDto dto)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null) return false;

            var identityUser = await _userManager.FindByEmailAsync(staff.Email);
            if (identityUser != null)
            {
                identityUser.FullName = dto.FullName;
                identityUser.Role = dto.Role;
                if (staff.Email != dto.Email)
                {
                    identityUser.Email = dto.Email;
                    identityUser.UserName = dto.Email;
                }

                if (!string.IsNullOrEmpty(dto.Password))
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(identityUser);
                    await _userManager.ResetPasswordAsync(identityUser, token, dto.Password);
                }

                await _userManager.UpdateAsync(identityUser);

                var currentRoles = await _userManager.GetRolesAsync(identityUser);
                await _userManager.RemoveFromRolesAsync(identityUser, currentRoles);
                if (!await _roleManager.RoleExistsAsync(dto.Role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(dto.Role));
                }
                await _userManager.AddToRoleAsync(identityUser, dto.Role);
            }

            staff.FullName = dto.FullName;
            staff.Email = dto.Email;
            staff.Role = dto.Role;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                staff.Password = dto.Password;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteStaffAsync(int id)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null) return false;

            var identityUser = await _userManager.FindByEmailAsync(staff.Email);
            if (identityUser != null)
            {
                await _userManager.DeleteAsync(identityUser);
            }

            _context.Staffs.Remove(staff);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<StaffResponseDto?> LoginAsync(StaffLoginDto dto)
        {
            var staff = await _context.Staffs
                .FirstOrDefaultAsync(s => s.Email == dto.Email && s.Password == dto.Password);

            if (staff == null) return null;

            return new StaffResponseDto
            {
                Id = staff.Id,
                FullName = staff.FullName,
                Email = staff.Email,
                Role = staff.Role,
                CreatedAt = staff.CreatedAt
            };
        }
    }
}
