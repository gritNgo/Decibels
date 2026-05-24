using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.Models.ViewModels
{
    public class ShoppingCartVM
    {
        public IEnumerable<ShoppingCart>? ShoppingCartList { get; set; }
        public OrderHeader? OrderHeader { get; set; }
        //public decimal OrderTotal { get; set; } use this prop in OrderHeader
    }
}
