using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface ITaiKhoanService
{
    Task<ApiResponse<LoginResponseDto>> DangNhapAsync(LoginRequestDto request);
    Task<ApiResponse<LoginResponseDto>> LamMoiTokenAsync(string refreshToken);
    Task<ApiResponse<TaiKhoan>> DangKyAsync(TaiKhoan taiKhoan);
    Task<ApiResponse<string>> DoiMatKhauAsync(int userId, string oldPassword, string newPassword);
}
