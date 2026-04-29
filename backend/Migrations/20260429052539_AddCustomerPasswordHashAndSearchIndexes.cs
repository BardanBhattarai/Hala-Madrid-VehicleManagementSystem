using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VehicleManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerPasswordHashAndSearchIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Customers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicle_VehicleNumber",
                table: "Vehicles",
                column: "VehicleNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Customer_Email",
                table: "Customers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Customer_FullName",
                table: "Customers",
                column: "FullName");

            migrationBuilder.CreateIndex(
                name: "IX_Customer_PhoneNumber",
                table: "Customers",
                column: "PhoneNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vehicle_VehicleNumber",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Customer_Email",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customer_FullName",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customer_PhoneNumber",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Customers");
        }
    }
}
