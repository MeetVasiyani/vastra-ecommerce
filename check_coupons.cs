using System;
using System.Linq;
using EcommerceApplication.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.IO;

class Program
{
    static void Main()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));

        using (var context = new AppDbContext(optionsBuilder.Options))
        {
            try {
                var coupons = context.Coupons.ToList();
                Console.WriteLine($"Total coupons: {coupons.Count}");
                foreach (var c in coupons)
                {
                    Console.WriteLine($"- ID: {c.Id}, Code: {c.Code}, Active: {c.IsActive}");
                }
            } catch (Exception ex) {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }
    }
}
