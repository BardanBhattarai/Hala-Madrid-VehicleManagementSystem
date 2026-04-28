using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsSystem.Common.Responses;
using VehiclePartsSystem.Domain.Entities;
using VehiclePartsSystem.Infrastructure.Data;

namespace VehiclePartsSystem.Controllers;

// STUB CONTROLLER — for testing only until inventory module is merged.
// MERGE: Remove this file and replace with the inventory team member's PartsController.
[ApiController]
[Route("api/[controller]")]
public class PartsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PartsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var parts = await _db.Parts
            .Select(p => new { p.Id, p.PartName, p.StockQuantity, p.UnitPrice })
            .ToListAsync();
        return Ok(ApiResponse<object>.SuccessResponse(parts));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePartDto dto)
    {
        var part = new Part
        {
            Id = Guid.NewGuid(),
            PartName = dto.PartName,
            StockQuantity = dto.StockQuantity,
            UnitPrice = dto.UnitPrice
        };
        _db.Parts.Add(part);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.SuccessResponse(new { part.Id, part.PartName, part.StockQuantity, part.UnitPrice }, "Part created."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return NotFound(ApiResponse<string>.Fail("Part not found."));
        _db.Parts.Remove(part);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<string>.SuccessResponse("Part deleted."));
    }
}

public class CreatePartDto
{
    public string PartName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}
