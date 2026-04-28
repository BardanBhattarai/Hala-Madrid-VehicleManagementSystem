# Design Spec: Tasks 5–8 — Vehicle Parts Selling and Inventory Management System

**Date:** 2026-04-28  
**Author:** Tasks 5–8 team member  
**Namespace:** `VehiclePartsSystem`  
**Stack:** ASP.NET Core Web API (.NET 8) + PostgreSQL + EF Core + Vite/React 18

---

## Scope

This spec covers Tasks 5–8 only:

- **Task 5:** Admin — Vendor CRUD
- **Task 6:** Staff — Customer Registration with Vehicle Details
- **Task 7:** Staff — Sales Invoice with business logic
- **Task 8:** Staff — Customer Profile, History, and Vehicle Information

---

## Integration Assumptions

- JWT authentication and role management (`ApplicationUser`, `Role`) are owned by another team member and will exist in the shared `ApplicationDbContext` at merge time.
- The `Part` entity (inventory) is owned by another team member. A stub with the minimum required fields is created here and must be replaced at merge time.
- `Program.cs` and `ApplicationDbContext.cs` are shared files — changes are isolated to clearly commented blocks.
- Frontend auth wiring is skipped; the backend enforces roles via `[Authorize(Roles = "...")]`.

---

## Architecture

**Approach:** Flat feature folders inside the single existing `.csproj` (Option A).

### Backend Folder Structure

```
Backend/
├── Controllers/
│   ├── VendorsController.cs           ← Task 5
│   ├── CustomersController.cs         ← Tasks 6 & 8
│   └── SalesInvoicesController.cs     ← Task 7
├── Features/
│   ├── Vendors/
│   │   ├── DTOs/
│   │   │   ├── CreateVendorDto.cs
│   │   │   ├── UpdateVendorDto.cs
│   │   │   └── VendorDto.cs
│   │   ├── Services/
│   │   │   ├── IVendorService.cs
│   │   │   └── VendorService.cs
│   │   └── Validators/
│   │       └── CreateVendorValidator.cs
│   ├── Customers/
│   │   ├── DTOs/
│   │   │   ├── RegisterCustomerWithVehicleDto.cs
│   │   │   ├── CustomerDto.cs
│   │   │   ├── VehicleDto.cs
│   │   │   ├── CustomerProfileDto.cs
│   │   │   └── PurchaseHistoryDto.cs
│   │   ├── Services/
│   │   │   ├── ICustomerService.cs
│   │   │   └── CustomerService.cs
│   │   └── Validators/
│   │       └── RegisterCustomerValidator.cs
│   └── SalesInvoices/
│       ├── DTOs/
│       │   ├── CreateSalesInvoiceDto.cs
│       │   ├── SalesInvoiceItemCreateDto.cs
│       │   └── SalesInvoiceDto.cs
│       ├── Services/
│       │   ├── ISalesInvoiceService.cs
│       │   └── SalesInvoiceService.cs
│       └── Validators/
│           └── CreateSalesInvoiceValidator.cs
├── Domain/
│   └── Entities/
│       ├── Vendor.cs
│       ├── Customer.cs
│       ├── Vehicle.cs
│       ├── SalesInvoice.cs
│       ├── SalesInvoiceItem.cs
│       └── Part.cs                    ← STUB — merge with inventory team member
├── Infrastructure/
│   └── Data/
│       └── ApplicationDbContext.cs    ← SHARED
├── Common/
│   ├── Responses/
│   │   └── ApiResponse.cs
│   └── Exceptions/
│       └── NotFoundException.cs
├── Program.cs                         ← SHARED
└── appsettings.json                   ← SHARED
```

### Frontend Folder Structure

```
Frontend/ (Vite + React 18)
└── src/
    ├── features/
    │   ├── vendors/
    │   │   ├── api/vendorApi.js
    │   │   ├── pages/ (VendorList.jsx, VendorForm.jsx)
    │   │   └── components/ (VendorTable.jsx)
    │   ├── customers/
    │   │   ├── api/customerApi.js
    │   │   ├── pages/ (RegisterCustomer.jsx, CustomerProfile.jsx)
    │   │   └── components/ (VehicleForm.jsx, CustomerDetailsCard.jsx, PurchaseHistoryTable.jsx)
    │   └── salesInvoices/
    │       ├── api/salesInvoiceApi.js
    │       ├── pages/ (CreateSalesInvoice.jsx, SalesInvoiceDetails.jsx)
    │       └── components/ (InvoiceItemRow.jsx, InvoiceSummary.jsx)
    ├── shared/
    │   ├── api/axiosConfig.js
    │   └── components/ (InputField.jsx, Button.jsx, Table.jsx, AlertMessage.jsx)
    └── routes/AppRoutes.jsx
```

---

## Data Model

### Entities

**Vendor**
- Id (Guid), VendorName, ContactPerson, PhoneNumber, Email, Address, CompanyName
- IsActive (bool), CreatedAt (DateTime), UpdatedAt (DateTime)

**Customer**
- Id (Guid), FullName, PhoneNumber, Email, Address, CreditBalance (decimal), CreatedAt (DateTime)

**Vehicle**
- Id (Guid), CustomerId (FK), VehicleNumber, Brand, Model, VehicleType, ManufactureYear (int), Mileage (int), LastServiceDate (DateTime?)

**SalesInvoice**
- Id (Guid), CustomerId (FK), StaffId (FK → ApplicationUser), InvoiceDate (DateTime)
- SubTotal, DiscountAmount, TotalAmount, PaidAmount, DueAmount (all decimal)
- PaymentStatus (enum: Paid/Partial/Unpaid), CreatedAt (DateTime)

**SalesInvoiceItem**
- Id (Guid), SalesInvoiceId (FK), PartId (FK → Part), Quantity (int), UnitPrice (decimal), TotalPrice (decimal)

**Part (STUB — MERGE WITH INVENTORY TEAM MEMBER)**
- Id (Guid), PartName (string), StockQuantity (int), UnitPrice (decimal)

### Relationships

- Customer → Vehicles: one-to-many
- Customer → SalesInvoices: one-to-many
- SalesInvoice → SalesInvoiceItems: one-to-many
- SalesInvoiceItem → Part: many-to-one

---

## API Contracts

### Vendor Endpoints (Admin role)

| Method | Route | Purpose |
|---|---|---|
| GET | /api/vendors | List all vendors |
| GET | /api/vendors/{id} | Get vendor by id |
| POST | /api/vendors | Create vendor |
| PUT | /api/vendors/{id} | Update vendor |
| DELETE | /api/vendors/{id} | Delete vendor |

### Customer Endpoints (Staff role)

| Method | Route | Purpose |
|---|---|---|
| POST | /api/customers/register-with-vehicle | Register customer + vehicle |
| GET | /api/customers | List all customers |
| GET | /api/customers/{id} | Get customer |
| POST | /api/customers/{id}/vehicles | Add vehicle to customer |
| GET | /api/customers/{id}/profile | Full profile (details + vehicles + history) |
| GET | /api/customers/{id}/vehicles | Vehicle list |
| GET | /api/customers/{id}/purchase-history | Invoice history |

### Sales Invoice Endpoints (Staff role)

| Method | Route | Purpose |
|---|---|---|
| POST | /api/sales-invoices | Create invoice |
| GET | /api/sales-invoices | List all invoices |
| GET | /api/sales-invoices/{id} | Get invoice by id |
| GET | /api/sales-invoices/customer/{customerId} | Invoices for a customer |

### Shared Response Envelope

```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "...", "data": null }
```

---

## Business Logic: Sales Invoice

1. Validate all line items (part exists, quantity > 0).
2. For each item: check `Part.StockQuantity >= requested Quantity`. If any fail → 400 with specific message, abort.
3. `SubTotal = Σ (Quantity × Part.UnitPrice)`
4. `DiscountAmount = SubTotal > 5000 ? SubTotal × 0.10 : 0`
5. `TotalAmount = SubTotal − DiscountAmount`
6. `DueAmount = TotalAmount − PaidAmount`
7. `PaymentStatus`: PaidAmount >= TotalAmount → Paid; PaidAmount > 0 → Partial; else → Unpaid
8. Database transaction: insert SalesInvoice → insert SalesInvoiceItems → deduct stock → commit (or rollback all).

---

## Frontend Pages

| Page | Route | Role |
|---|---|---|
| VendorList | /vendors | Admin |
| VendorForm | /vendors/new, /vendors/:id/edit | Admin |
| RegisterCustomer | /customers/register | Staff |
| CustomerProfile | /customers/:id | Staff |
| CreateSalesInvoice | /sales-invoices/new | Staff |
| SalesInvoiceDetails | /sales-invoices/:id | Staff |

Frontend auth wiring deferred to merge time. Backend enforces roles.  
Live discount calculation on CreateSalesInvoice page (display-only; backend recalculates authoritatively).

---

## Shared Files: Coordination Notes

| File | Change needed | How to coordinate |
|---|---|---|
| `Program.cs` | Register your services + EF Core + Swagger JWT | Add in a clearly commented block; resolve conflicts via GitHub PR review |
| `ApplicationDbContext.cs` | Add your DbSet<> declarations | Each member adds their own block; merge manually |
| `appsettings.json` | PostgreSQL connection string | One member adds it; others copy to local `appsettings.Development.json` (gitignored) |
