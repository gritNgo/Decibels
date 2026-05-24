using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.Models
{
    // custom extension of IdentityUser
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string Name { get; set; }
        // Discriminator column found in database will have a value that will tell whether the User on that record is an ApplicationUser or an IdentityUser
        public string? Street { get; set; }
        public string? City{ get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }

        public int? CompanyId { get; set; } // nullable as a user can be a customer
        [ForeignKey("CompanyId")]
        [ValidateNever] // as this won't be populated when creating a user
        public Company? Company { get; set; } // make nullable to display users without Company role in User Management

        [NotMapped]
        public string Role { get; set; }

    }
}
