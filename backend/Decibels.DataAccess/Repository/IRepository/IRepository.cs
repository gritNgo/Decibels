using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.DataAccess.Repository.IRepository
{
    // Provides an interface for interacting with different data sources and keeps business logic independent of data access details
    // T is a Generic class until implementation of this interface (ex: Category Model on which CRUD ops will be performed and will interact with DbContext)
    public interface IRepository<T> where T : class
    {
        IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null, string? includeProperties = null); // IEnumerable is like a 'collection'  
        T Get(Expression<Func<T, bool>> filter, string? includeProperties = null, bool tracked = false); // 'tracked' used for no tracking by context
        void Add(T entity);
        // Update is not here but in ICategoryRepository instead because the logic for updating Category for example is different than updating a Product
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entity);
        
    }
}
