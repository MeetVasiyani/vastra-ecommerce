using EcommerceApplication.DTOs.User;
using EcommerceApplication.Interfaces;
using EcommerceApplication.Models;
using Microsoft.AspNetCore.Identity;

namespace EcommerceApplication.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public UserService(UserManager<User> userManager, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }

        public async Task<AddressDto> AddAddressAsync(string userId, CreateAddressDto addressDto)
        {
            var address = new Address
            {
                UserId = userId,
                Street = addressDto.Street,
                City = addressDto.City,
                State = addressDto.State,
                ZipCode = addressDto.ZipCode,
                Country = addressDto.Country
            };

            await _unitOfWork.Repository<Address>().AddAsync(address);
            await _unitOfWork.CompleteAsync();

            return new AddressDto
            {
                Id = address.Id,
                Street = address.Street,
                City = address.City,
                State = address.State,
                ZipCode = address.ZipCode,
                Country = address.Country
            };
        }

        public async Task<UserDto> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            // Load addresses manually since UserManager doesn't load them by default usually
            var addresses = await _unitOfWork.Repository<Address>().FindAsync(a => a.UserId == userId);

            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                Addresses = addresses.Select(a => new AddressDto
                {
                    Id = a.Id,
                    Street = a.Street,
                    City = a.City,
                    State = a.State,
                    ZipCode = a.ZipCode,
                    Country = a.Country
                }).ToList()
            };
        }

        public async Task RemoveAddressAsync(string userId, int addressId)
        {
            var address = await _unitOfWork.Repository<Address>().GetByIdAsync(addressId);
            if (address != null && address.UserId == userId)
            {
                _unitOfWork.Repository<Address>().Remove(address);
                await _unitOfWork.CompleteAsync();
            }
        }
    }
}
