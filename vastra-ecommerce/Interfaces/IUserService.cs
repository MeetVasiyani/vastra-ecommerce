using EcommerceApplication.DTOs.User;

namespace EcommerceApplication.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetUserProfileAsync(string userId);
        Task<AddressDto> AddAddressAsync(string userId, CreateAddressDto addressDto);
        Task RemoveAddressAsync(string userId, int addressId);
    }
}
