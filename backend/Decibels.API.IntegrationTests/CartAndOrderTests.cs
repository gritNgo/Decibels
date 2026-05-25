using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Decibels.Models;
using Decibels.Utility;
using Microsoft.EntityFrameworkCore;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Decibels.API.IntegrationTests
{
    public class CartAndOrderTests : IntegrationTestBase
    {
        private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        [Fact]
        public async Task SubmitOrder_WhenCartIsEmpty_Returns400BadRequest()
        {
            // Arrange
            var orderHeaderDto = new OrderHeader { Name = "Fiorenso", PhoneNumber = "123456789" };

            // Act
            var response = await Client.PostAsJsonAsync("api/cart/summary", orderHeaderDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task SubmitOrder_WhenCartHasItemsForCompanyUser_CreatesDelayedPaymentOrderWithoutStripeRedirect()
        {
            // Arrange
            int generatedOrderId = 0;
            int realProductId = 0;
            decimal targetedProductPrice = 140.00m;
            int targetedQuantity = 2;
            
            await ExecuteDbContextAsync(async db =>
{
    // Clear any tracked or conflicting users created during container initialization
    var existingUser = await db.ApplicationUsers.FindAsync(IntegrationTestBase.TestUserId);
    if (existingUser != null)
    {
        db.ApplicationUsers.Remove(existingUser);
        await db.SaveChangesAsync();
    }

    // 1. Seed Parent Category needed for the Product Foreign Key relation
    var testCategory = new Category { Name = "Audio Equipment" };
    db.Categories.Add(testCategory);
    await db.SaveChangesAsync();

    // 2. Instantiate Company and Product models with real schema properties
    var testCompany = new Company 
    { 
        Name = "Test Music Shop", 
        Street = "Via Roma 10", 
        City = "Torino", 
        State = "TO", 
        PostalCode = "10100", 
        PhoneNumber = "123456" 
    };

    var testProduct = new Product 
    { 
        Name = "Studio Monitors", 
        Description = "High fidelity active reference speakers", 
        Price = targetedProductPrice,
        CategoryId = testCategory.Id, 
        ImageUrl = "images/products/monitors.jpg"
    };

    db.Companies.Add(testCompany);
    db.Products.Add(testProduct);
    await db.SaveChangesAsync(); 

    realProductId = testProduct.Id; 

    // 3. Seed User and ShoppingCart matching correct schema naming conventions
    var companyUser = new ApplicationUser
    {
        Id = IntegrationTestBase.TestUserId, 
        UserName = "company@decibels.test",
        Email = "company@decibels.test",
        Name = "Company Tester",
        CompanyId = testCompany.Id, 
        PhoneNumber = "1112223333",
        Street = "Test Way",
        City = "Florence",
        State = "FI",
        PostalCode = "50100"
    };

    var cartItem = new ShoppingCart
    {
        ApplicationUserId = IntegrationTestBase.TestUserId,
        ProductId = realProductId, 
        Quantity = targetedQuantity 
    };

    db.ApplicationUsers.Add(companyUser);
    db.ShoppingCarts.Add(cartItem);

    await db.SaveChangesAsync(); 
});

            var checkoutPayload = new OrderHeader
            {
                Name = "Fiorenso",
                Street = "Via dei Calzaiuoli",
                City = "Florence",
                State = "Tuscany",
                PostalCode = "50122",
                PhoneNumber = "+39 055 123456"
            };

            // Act
            var response = await Client.PostAsJsonAsync("api/cart/summary", checkoutPayload);

            // Assert - Print out the exact error payload if it's a 400 BadRequest
            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Xunit.Sdk.XunitException($"Endpoint rejected payload with 400 BadRequest. Raw Error Output: {errorContent}");
            }
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var jsonNode = await response.Content.ReadFromJsonAsync<JsonElement>();
            generatedOrderId = jsonNode.GetProperty("orderId").GetInt32();
            generatedOrderId.Should().BeGreaterThan(0);

            // Database Persistence Verification
            await ExecuteDbContextAsync(async db =>
            {
                var verifiedOrder = await db.OrderHeaders
                    .FirstOrDefaultAsync(o => o.Id == generatedOrderId);

                verifiedOrder.Should().NotBeNull();
                verifiedOrder!.OrderStatus.Should().Be(StaticDetails.StatusApproved);
                verifiedOrder.PaymentStatus.Should().Be(StaticDetails.PaymentStatusDelayedPayment);
                
                // Assert the correct calculation matches the price logic
                decimal expectedTotal = targetedProductPrice * targetedQuantity;
                verifiedOrder.OrderTotal.Should().Be(expectedTotal); 

                // Verify structural child detail assertions match generated values precisely
                var verifiedDetails = await db.OrderDetails
                    .Where(d => d.OrderHeaderId == generatedOrderId)
                    .ToListAsync();

                verifiedDetails.Should().NotBeNull();
                verifiedDetails.Should().ContainSingle();
                verifiedDetails.First().ProductId.Should().Be(realProductId); // Verified dynamically instead of hardcoded id
            });
        }
    }
}