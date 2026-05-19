using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services
{
    public class StaffService : IStaffService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public StaffService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IEnumerable<StaffResponseDto>> GetAllStaffAsync()
        {
            var users = await _userManager.Users
                .Where(u => u.Role == "Staff" || u.Role == "Admin")
                .ToListAsync();

            return users.Select(u => new StaffResponseDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email ?? string.Empty,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            });
        }

        public async Task<StaffResponseDto?> GetStaffByIdAsync(string id)
        {
            var u = await _userManager.FindByIdAsync(id);
            if (u == null || (u.Role != "Staff" && u.Role != "Admin")) return null;

            return new StaffResponseDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email ?? string.Empty,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            };
        }

        public async Task<StaffResponseDto> CreateStaffAsync(StaffCreateDto dto)
        {
            var identityUser = await _userManager.FindByEmailAsync(dto.Email);
            if (identityUser != null)
            {
                throw new Exception("User with this email already exists!");
            }

            var newUser = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                EmailConfirmed = true,
                FullName = dto.FullName,
                Role = dto.Role
            };

            var result = await _userManager.CreateAsync(newUser, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to create staff in Identity: {errors}");
            }

            await _userManager.AddToRoleAsync(newUser, dto.Role);

            return new StaffResponseDto
            {
                Id = newUser.Id,
                FullName = newUser.FullName,
                Email = newUser.Email ?? string.Empty,
                Role = newUser.Role,
                CreatedAt = newUser.CreatedAt
            };
        }

        public async Task<bool> UpdateStaffAsync(string id, StaffUpdateDto dto)
        {
            var identityUser = await _userManager.FindByIdAsync(id);
            if (identityUser == null) return false;

            identityUser.Email = dto.Email;
            identityUser.UserName = dto.Email;
            identityUser.FullName = dto.FullName;
            
            if (identityUser.Role != dto.Role)
            {
                await _userManager.RemoveFromRoleAsync(identityUser, identityUser.Role);
                await _userManager.AddToRoleAsync(identityUser, dto.Role);
                identityUser.Role = dto.Role;
            }

            var result = await _userManager.UpdateAsync(identityUser);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to update staff in Identity: {errors}");
            }

            if (!string.IsNullOrEmpty(dto.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(identityUser);
                var pwResult = await _userManager.ResetPasswordAsync(identityUser, token, dto.Password);
                if (!pwResult.Succeeded)
                {
                    var errors = string.Join(", ", pwResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to reset staff password: {errors}");
                }
            }

            return true;
        }

        public async Task<bool> DeleteStaffAsync(string id)
        {
            var identityUser = await _userManager.FindByIdAsync(id);
            if (identityUser == null) return false;

            var result = await _userManager.DeleteAsync(identityUser);
            return result.Succeeded;
        }
    }
}
