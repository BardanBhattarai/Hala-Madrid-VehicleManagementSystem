using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using VehiclePartsSystem.Features.Customers.Services;
using VehiclePartsSystem.Features.SalesInvoices.Services;
using VehiclePartsSystem.Features.Vendors.Services;
using VehiclePartsSystem.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support (ready for when auth team merges)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Vehicle Parts System API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// --- SHARED: Authentication — JWT configuration added by auth team member ---
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(options => { ... });
builder.Services.AddAuthorization();
// --- End Authentication ---

// --- Tasks 5-8: Database ---
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
// --- End Database ---

// --- Tasks 5-8: Feature Services ---
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();
// --- End Tasks 5-8 ---

// --- Tasks 5-8: CORS for development ---
builder.Services.AddCors(options => options.AddPolicy("Dev",
    p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
// --- End CORS ---

// MERGE: Other team members add their service registrations above this line

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Dev");
app.UseHttpsRedirection();
app.UseAuthentication(); // MERGE: needed for JWT — auth team member completes the setup
app.UseAuthorization();
app.MapControllers();
app.Run();
