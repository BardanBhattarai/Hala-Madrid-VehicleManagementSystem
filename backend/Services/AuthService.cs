using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VehicleManagement.DTOs;
using VehicleManagement.Models;
using VehicleManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace VehicleManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly AppDbContext _db;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            AppDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
            _db = db;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterUserAsync(RegisterDto model)
        {
            try
            {
                var userExists = await _userManager.FindByEmailAsync(model.Email);
                if (userExists != null)
                {
                    return ApiResponse<AuthResponseDto>.Fail("User already exists!");
                }

                ApplicationUser user = new()
                {
                    Email = model.Email,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = model.Email,
                    FullName = model.FullName,
                    Role = model.Role
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return ApiResponse<AuthResponseDto>.Fail($"User creation failed: {errors}");
                }

                if (!await _roleManager.RoleExistsAsync(model.Role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(model.Role));
                }

                await _userManager.AddToRoleAsync(user, model.Role);

                // Generate JWT Token
                var token = await GenerateJwtTokenAsync(user);

                var customer = await _db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Email == user.Email);
                var responseDto = new AuthResponseDto
                {
                    Token = token,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    CustomerId = customer?.Id
                };

                return ApiResponse<AuthResponseDto>.SuccessResponse(responseDto, "User registered successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during user registration.");
                return ApiResponse<AuthResponseDto>.Fail("An error occurred during registration.", new List<string> { ex.Message }, 500);
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginUserAsync(LoginDto model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    var token = await GenerateJwtTokenAsync(user);
                    var customer = await _db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Email == user.Email);
                    var responseDto = new AuthResponseDto
                    {
                        Token = token,
                        Email = user.Email!,
                        FullName = user.FullName,
                        Role = user.Role,
                        CustomerId = customer?.Id
                    };
                    return ApiResponse<AuthResponseDto>.SuccessResponse(responseDto, "Login successful");
                }
                return ApiResponse<AuthResponseDto>.Fail("Invalid credentials", new List<string>(), 401);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login.");
                return ApiResponse<AuthResponseDto>.Fail("An error occurred during login.", new List<string> { ex.Message }, 500);
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> GetCurrentUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<AuthResponseDto>.Fail("User not found", new List<string>(), 404);
                }

                var customer = await _db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Email == user.Email);
                var responseDto = new AuthResponseDto
                {
                    Token = "", // Client already has the token
                    Email = user.Email!,
                    FullName = user.FullName,
                    Role = user.Role,
                    CustomerId = customer?.Id
                };
                return ApiResponse<AuthResponseDto>.SuccessResponse(responseDto, "User retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching user.");
                return ApiResponse<AuthResponseDto>.Fail("An error occurred while fetching user.", new List<string> { ex.Message }, 500);
            }
        }

        private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"])),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
