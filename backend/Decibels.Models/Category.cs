using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Decibels.Models
{
    public class Category
    {
        // Key & Required are data annotations required for Entity Framework for identification
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        // DisplayName is a data annotation useful for client-side UI/validation
        [DisplayName("Category Name")]
        public string? Name { get; set; }

        [DisplayName("Display Order")]
        [Range(1, 100, ErrorMessage = "Display Order must be between 1-100")]
        public int DisplayOrder { get; set; }
    }
}
