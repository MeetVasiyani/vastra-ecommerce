using EcommerceApplication.Models;
using Microsoft.AspNetCore.Identity;

namespace EcommerceApplication.Data
{
    public static class RoleSeeder
    {
        private static readonly string[] RequiredRoles = { "Admin", "Customer" };

        public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            foreach (var roleName in RequiredRoles)
            {
                if (await roleManager.RoleExistsAsync(roleName))
                {
                    continue;
                }

                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }
}