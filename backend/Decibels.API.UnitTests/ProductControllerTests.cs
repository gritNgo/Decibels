using NUnit.Framework;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Decibels.API.Areas.Admin.Controllers;
using Decibels.DataAccess.Repository.IRepository;
using Decibels.Models;
using Decibels.API.Services;

namespace Decibels.API.Tests
{
    [TestFixture]
    public class ProductControllerTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IStorageService> _mockStorage;
        private Mock<ILogger<ProductController>> _mockLogger;
        private ProductController _controller;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockStorage = new Mock<IStorageService>();
            _mockLogger = new Mock<ILogger<ProductController>>();
            _controller = new ProductController(_mockUnitOfWork.Object, _mockStorage.Object, _mockLogger.Object);
        }

        [Test]
        public void GetAll_WhenProductsExist_Returns200OkWithDataPayload()
        {
            var sampleProducts = new List<Product> { new() { Id = 1, Name = "Vinyl Player", Price = 150m } };
            _mockUnitOfWork.Setup(u => u.Product.GetAll(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<string>())).Returns(sampleProducts);

            var result = _controller.GetAll();

            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var payload = okResult.Value.Should().BeAssignableTo<IEnumerable<Product>>().Subject;
            payload.Should().HaveCount(1);
        }

        [Test]
        public async Task Update_WithNewFile_InvokesStorageAndReturnsOk()
        {
            // Arrange: Give it a baseline ImageUrl string so the controller triggers the deletion sequence
            var product = new Product 
            { 
                Id = 1, 
                Name = "Monitors", 
                Price = 200m, 
                ImageUrl = "https://azure.blob/old-image.jpg" 
            };
            var mockFile = new Mock<IFormFile>();

            _mockUnitOfWork.Setup(u => u.Product.Get(
                    It.IsAny<Expression<Func<Product, bool>>>(), 
                    It.IsAny<string>(), 
                    It.IsAny<bool>()))  
                .Returns(product);
        
            _mockStorage.Setup(s => s.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync("https://azure.blob/new.jpg");

            // Act
            var result = await _controller.Update(1, product, mockFile.Object);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            _mockStorage.Verify(s => s.DeleteFileAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            _mockStorage.Verify(s => s.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }
        
    }
}