using Decibels.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.DataAccess.Repository.IRepository
{
    public interface ICategoryRepository : IRepository<Category>
    {
        // Update is here because the logic for updating Category is different than updating a Product
        void Update(Category obj);
    }
}
