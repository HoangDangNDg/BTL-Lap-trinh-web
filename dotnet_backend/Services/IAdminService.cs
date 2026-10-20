using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface IAdminService
{
    Task<ApiResponse<List<AdminDto>>> LayDanhSachAdminAsync();
    Task<ApiResponse<AdminDto>> LayAdminTheoIdAsync(int idAdmin);
    Task<ApiResponse<AdminDto>> TaoMoiAdminAsync(AdminDto dto);
    Task<ApiResponse<AdminDto>> CapNhatAdminAsync(int idAdmin, AdminDto dto);
    Task<ApiResponse<bool>> XoaAdminAsync(int idAdmin);
    Task<ApiResponse<ChuCoDong>> TaoTaiKhoanChuDoanhNghiepAsync(TaoChuDoanhNghiepDto dto);
    Task<ApiResponse<List<TokenInfoResponseDto>>> LayDanhSachTokensAsync();
    Task<ApiResponse<bool>> ThuHoiTokenAsync(int idRefresh);
    Task<ApiResponse<ThongKeTongQuanDto>> LayThongKeServerAsync();
}
