using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Decibels.DataAccess.Data;
using Decibels.DataAccess.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Decibels.DataAccess.Repository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        // dependency injection in order to use DbSet
        private readonly ApplicationDbContext _db;

        // Set access to the current T Model
        internal DbSet<T> dbSet;

        public Repository(ApplicationDbContext db)
        {
            _db = db;

            // the current generic (T) will be set to the dbSet (ex: when this generic class is created on Category, the dbSet will be Set to Categories (_db.Categories == dbSet))
            this.dbSet = _db.Set<T>();

            // Includes Navigation properties based on the Foreign Key relations
            _db.Products.Include(u => u.Category);
        }

        public void Add(T entity)
        {
            dbSet.Add(entity);
        }

        public T Get(Expression<Func<T, bool>> filter, string? includeProperties = null, bool tracked = false)
        {
            IQueryable<T> query;
            if (tracked)
            {
                // Use to query against data sources of type T
                 query = dbSet;                
            }

            else
            {
                query = dbSet.AsNoTracking();                
            }

            query = query.Where(filter);
            if (!string.IsNullOrEmpty(includeProperties))
            {
                // If there is more than one include property, add as comma separated values
                foreach (var includeProp in includeProperties.Split(new char[] { ',' },
                    StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp);
                }
            }
            return query.FirstOrDefault();
        }

        public IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            // If there is more than one include property, add as comma separated values
            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' },
                    StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp);
                }
            }
            return query.ToList();
        }

        public void Remove(T entity)
        {
            dbSet.Remove(entity);
        }

        public void RemoveRange(IEnumerable<T> entity)
        {
            dbSet.RemoveRange(entity);
        }
    }
}
