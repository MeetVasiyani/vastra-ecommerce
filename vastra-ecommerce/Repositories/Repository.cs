using EcommerceApplication.Data;
using EcommerceApplication.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EcommerceApplication.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        internal DbSet<T> _dbSet;

        public Repository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task<T?> FindOneWithIncludesAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return await query.FirstOrDefaultAsync(predicate);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> GetAllWithIncludesAsync(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return await query.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<T?> GetByIdWithIncludesAsync(int id, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            // FindAsync doesn't support IQueryable, so we use FirstOrDefault with Id check
            // Assuming we can't easily predicate Id generically without key info.
            // For simplicity in Generic Repo without looking up Metadata, we might need a predicate or assume 'Id' property exists.
            // But 'T' is class.
            // A common workaround is:
            var entity = await _dbSet.FindAsync(id);
            // If tracked, we might not load includes unless we explicitely load them.
            // Better to use FirstOrDefault if we know the Key name or pass a predicate for ID.
            // Since we can't accept int id easily for generic T.
            
            // Let's change the interface to accept a predicate for "Get" or just rely on FindOneWithIncludes for by ID.
            // For "GetByIdWithIncludes", it's tricky generically.
            // user: "GetByIdWithIncludesAsync(int id...)" implied knowing ID.
            
            // I'll drop GetByIdWithIncludesAsync implementation relying on Key and just used FindOneWithIncludesAsync in service.
            // Actually, I can implementation it by "FindOneWithIncludesAsync(e => EF.Property<int>(e, "Id") == id)" if I assume int Id.
            return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        }

        public void Remove(T entity)
        {
            _dbSet.Remove(entity);
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }
    }
}
