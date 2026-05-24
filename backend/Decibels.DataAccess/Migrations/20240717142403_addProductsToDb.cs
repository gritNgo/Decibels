using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Decibels.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addProductsToDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(8,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Description", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "The Yamaha YDM707 dynamic microphone combines decades of Yamaha's expertise in musical technologies with advanced design to deliver unparalleled sound quality.", "Yamaha YDM707 B Dynamic Vocal Microphone", 169m },
                    { 2, "The Shure SM7B microphone has been the industry standard in radio studios for years. ", "Shure SM7B Dynamic Vocal Studio Microphone", 381m },
                    { 3, "When you say Sennheiser, you actually mean the E 835! What the SM58 is to Shure, the E 835 is to Sennheiser, and it remains a battle of the titans for the best place in the stage branch!", "Sennheiser E 935 dynamic vocal microphone", 158m },
                    { 4, "Are you used to an electric guitar or western guitar, but would you still like to have a nylon-string classical guitar as well? Then this Cordoba Fusion 5 Edge Burst is an excellent option.", "Cordoba Fusion 5 Edge Burst Electric Acoustic Classical Guitar", 509m },
                    { 5, "The Schecter C-1 FR S SLS Elite can rightly be called the flagship of the series. The basis of this modern electric guitar is formed by an ash (swamp ash) solid body with a beautiful flame maple top.", "Schecter C-1 FR S SLS Elite Blood Burst Electric Guitar with Sustainiac", 1789m },
                    { 6, "What is a Marshall without its classic gold-black finish? That's right, nothing! That's why the new MG series is back in this colour scheme with the MG50FX guitar amplifier combo as its showpiece.", "Marshall MG50FX 50 Watt 1x12 Transistor Guitar Amplifier Combo", 365m },
                    { 7, "With the Pearl RS505BC Roadshow, the aspiring drummer has everything they need: a drum kit, stands, pedals, cymbals, sticks and a stick bag included! The journey of a successful drumming career starts here.", "Pearl RS505BC/C31 Roadshow 5-piece drum kit with 3-piece Sabian cymbal set", 799m },
                    { 8, "The next generation of drummers will go far with the Roland TD-02KV. This compact electronic drum kit has the expressive sounds we know from much more expensive V-Drums but then packed into sixteen ready-to-play sets.", "Roland TD-02KV V-Drums electronic drum kit", 499m },
                    { 9, "In the new series of Export drum sets, Pearl delivers this five-piece drum set. Pearl Export drum sets are still the best-selling kits in the world and are well known for their excellent price-quality ratio.", "Pearl EXX705NBR/C704 Export Black Cherry Glitter 5-piece drum kit", 1089m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
