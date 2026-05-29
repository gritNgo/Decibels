using NUnit.Framework;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq.Expressions;
using Decibels.API.Areas.Admin.Controllers;
using Decibels.DataAccess.Repository.IRepository;
using Decibels.Models;
using Decibels.Utility;

namespace Decibels.API.UnitTests
{
    [TestFixture]
    public class OrderControllerTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<ILogger<OrderController>> _mockLogger;
        private Mock<IConfiguration> _mockConfiguration;
        private OrderController _controller;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockLogger = new Mock<ILogger<OrderController>>();
            _mockConfiguration = new Mock<IConfiguration>();
            _controller = new OrderController(_mockUnitOfWork.Object, _mockLogger.Object, _mockConfiguration.Object);
        }

        [Test]
        public void StartProcessing_WhenOrderExists_UpdatesStatusToInProcessAndReturns200Ok()
        {
            var existingOrder = new OrderHeader { Id = 5, OrderStatus = StaticDetails.StatusPending };
            _mockUnitOfWork.Setup(u => u.OrderHeader.Get(It.IsAny<Expression<Func<OrderHeader, bool>>>(), It.IsAny<string>(), false)).Returns(existingOrder);

            var result = _controller.StartProcessing(5);

            result.Should().BeOfType<OkObjectResult>();
            _mockUnitOfWork.Verify(u => u.OrderHeader.UpdateStatus(5, StaticDetails.StatusInProcess, It.IsAny<string>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.Save(), Times.Once);
        }
    }
}