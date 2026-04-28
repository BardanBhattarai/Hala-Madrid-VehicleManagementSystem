using Microsoft.EntityFrameworkCore;
using VehicleManagement.Data;
using VehicleManagement.DTOs;
using VehicleManagement.Models;

namespace VehicleManagement.Services
{
    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;

        public StaffService(AppDbContext context)
        {
            _context = context;
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

            _context.Staffs.Remove(staff);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
