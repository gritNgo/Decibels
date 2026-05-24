using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace Decibels.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? Name { get; set; }
        public string? Description { get; set; }
        [Required]
        [Column(TypeName = "decimal(8,2)")]
        public decimal Price { get; set; }

        public int CategoryId { get; set; } // Foreign key Navigation property for the Category Model's table

        [ForeignKey("CategoryId")]
        [ValidateNever]
        public Category? Category { get; set; } 

        [ValidateNever]
        public string? ImageUrl { get; set; }

    }
}
