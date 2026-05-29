using NUnit.Framework;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Linq.Expressions;
using Decibels.API.Areas.Customer.Controllers;
using Decibels.DataAccess.Repository.IRepository;
using Decibels.Models;

namespace Decibels.API.UnitTests
{
    [TestFixture]
    public class CartControllerTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<ILogger<CartController>> _mockLogger;
        private Mock<IConfiguration> _mockConfiguration;
        private CartController _controller;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockLogger = new Mock<ILogger<CartController>>();
            _mockConfiguration = new Mock<IConfiguration>();
            
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "mockUser123") }, "TestAuth"));
            _controller = new CartController(_mockUnitOfWork.Object, _mockLogger.Object, _mockConfiguration.Object)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = userClaims } }
            };
        }

        [Test]
        public void SubmitOrder_WhenShoppingCartIsEmpty_Returns400BadRequest()
        {
            _mockUnitOfWork.Setup(u => u.ShoppingCart.GetAll(It.IsAny<Expression<Func<ShoppingCart, bool>>>(), It.IsAny<string>())).Returns(new List<ShoppingCart>());

            var result = _controller.SubmitOrder(new OrderHeader());

            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(400);
        }
    }
}