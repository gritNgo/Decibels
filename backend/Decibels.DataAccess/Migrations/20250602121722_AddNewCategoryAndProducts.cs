using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Decibels.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNewCategoryAndProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShoppingCarts_AspNetUsers_ApplicationUserId",
                table: "ShoppingCarts");

            migrationBuilder.AlterColumn<string>(
                name: "ApplicationUserId",
                table: "ShoppingCarts",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Headphones");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Guitars");

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "DisplayOrder", "Name" },
                values: new object[] { 4, 4, "Drums" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Audeze MM-100 Open Planar Headphones. High-fidelity headphones for precise listening of your mixes, crafted with a design that allows for unprecedented comfort.", "Audeze MM-100", 355m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Audeze LCD-3 Open Planar Headphones, for immersive listening, powerful bass and a rich midrange. Limited Edition!", "Audeze-LCD-3", 399m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "The Audio Technica ATH-M50x Headphones are the most critically acclaimed model in the M-Series line, praised by top audio engineers and pro audio reviewers year after year.", "Audio-Technica ATH-M50x Headphones", 145m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Are you used to an electric guitar or western guitar, but would you still like to have a nylon-string classical guitar as well? Then this Cordoba Fusion 5 Edge Burst is an excellent option.", "Cordoba Fusion 5 Edge Burst Electric Acoustic Classical Guitar", 509m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "The Schecter C-1 FR S SLS Elite can rightly be called the flagship of the series. The basis of this modern electric guitar is formed by an ash (swamp ash) solid body with a beautiful flame maple top.", "Schecter C-1 FR S SLS Elite Blood Burst Electric Guitar with Sustainiac", 1789m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "What is a Marshall without its classic gold-black finish? That's right, nothing! That's why the new MG series is back in this colour scheme with the MG50FX guitar amplifier combo as its showpiece.", "Marshall MG50FX 50 Watt 1x12 Transistor Guitar Amplifier Combo", 365m });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "Description", "ImageUrl", "Name", "Price" },
                values: new object[,]
                {
                    { 10, 4, "With the Pearl RS505BC Roadshow, the aspiring drummer has everything they need: a drum kit, stands, pedals, cymbals, sticks and a stick bag included! The journey of a successful drumming career starts here.", "", "Pearl RS505BC/C31 Roadshow 5-piece drum kit with 3-piece Sabian cymbal set", 799m },
                    { 11, 4, "The next generation of drummers will go far with the Roland TD-02KV. This compact electronic drum kit has the expressive sounds we know from much more expensive V-Drums but then packed into sixteen ready-to-play sets.", "", "Roland TD-02KV V-Drums electronic drum kit", 499m },
                    { 12, 4, "In the new series of Export drum sets, Pearl delivers this five-piece drum set. Pearl Export drum sets are still the best-selling kits in the world and are well known for their excellent price-quality ratio.", "", "Pearl EXX705NBR/C704 Export Black Cherry Glitter 5-piece drum kit", 1089m }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ShoppingCarts_AspNetUsers_ApplicationUserId",
                table: "ShoppingCarts",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShoppingCarts_AspNetUsers_ApplicationUserId",
                table: "ShoppingCarts");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.AlterColumn<string>(
                name: "ApplicationUserId",
                table: "ShoppingCarts",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Guitars");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Drums");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Are you used to an electric guitar or western guitar, but would you still like to have a nylon-string classical guitar as well? Then this Cordoba Fusion 5 Edge Burst is an excellent option.", "Cordoba Fusion 5 Edge Burst Electric Acoustic Classical Guitar", 509m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "The Schecter C-1 FR S SLS Elite can rightly be called the flagship of the series. The basis of this modern electric guitar is formed by an ash (swamp ash) solid body with a beautiful flame maple top.", "Schecter C-1 FR S SLS Elite Blood Burst Electric Guitar with Sustainiac", 1789m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "What is a Marshall without its classic gold-black finish? That's right, nothing! That's why the new MG series is back in this colour scheme with the MG50FX guitar amplifier combo as its showpiece.", "Marshall MG50FX 50 Watt 1x12 Transistor Guitar Amplifier Combo", 365m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "With the Pearl RS505BC Roadshow, the aspiring drummer has everything they need: a drum kit, stands, pedals, cymbals, sticks and a stick bag included! The journey of a successful drumming career starts here.", "Pearl RS505BC/C31 Roadshow 5-piece drum kit with 3-piece Sabian cymbal set", 799m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "The next generation of drummers will go far with the Roland TD-02KV. This compact electronic drum kit has the expressive sounds we know from much more expensive V-Drums but then packed into sixteen ready-to-play sets.", "Roland TD-02KV V-Drums electronic drum kit", 499m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "In the new series of Export drum sets, Pearl delivers this five-piece drum set. Pearl Export drum sets are still the best-selling kits in the world and are well known for their excellent price-quality ratio.", "Pearl EXX705NBR/C704 Export Black Cherry Glitter 5-piece drum kit", 1089m });

            migrationBuilder.AddForeignKey(
                name: "FK_ShoppingCarts_AspNetUsers_ApplicationUserId",
                table: "ShoppingCarts",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
