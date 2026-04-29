using Microsoft.AspNetCore.Mvc;
using VehicleManagement.DTOs;
using VehicleManagement.Services;

namespace VehicleManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseInvoicesController : ControllerBase
    {
        private readonly IPurchaseService _purchaseService;

        public PurchaseInvoicesController(IPurchaseService purchaseService)
        {
            _purchaseService = purchaseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PurchaseInvoiceResponseDto>>> GetAll()
        {
            var invoices = await _purchaseService.GetAllInvoicesAsync();
            return Ok(invoices);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseInvoiceResponseDto>> GetById(int id)
        {
            var invoice = await _purchaseService.GetInvoiceByIdAsync(id);
            if (invoice == null) return NotFound();
            return Ok(invoice);
        }

        [HttpPost]
        public async Task<ActionResult<PurchaseInvoiceResponseDto>> Create(PurchaseInvoiceCreateDto dto)
        {
            try
            {
                var result = await _purchaseService.CreatePurchaseInvoiceAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
