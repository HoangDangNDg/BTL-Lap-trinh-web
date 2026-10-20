using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface IDoanhNghiepService
{
    // Doanh nghiệp
    Task<ApiResponse<List<DoanhNghiepDto>>> LayTatCaDoanhNghiepAsync();
    Task<ApiResponse<DoanhNghiepDto>> TimDoanhNghiepTheoIdAsync(int idDn);
    Task<ApiResponse<DoanhNghiepDto>> LuuDoanhNghiepAsync(DoanhNghiep dn);
    Task<ApiResponse<bool>> XoaDoanhNghiepAsync(int idDn);

    // Chi nhánh
    Task<ApiResponse<List<ChiNhanhDto>>> LayChiNhanhTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<ChiNhanhDto>> TimChiNhanhTheoIdAsync(int idCn);
    Task<ApiResponse<ChiNhanhDto>> LuuChiNhanhAsync(TaoChiNhanhRequest request);
    Task<ApiResponse<ChiNhanhDto>> CapNhatChiNhanhAsync(int idCn, TaoChiNhanhRequest request);
    Task<ApiResponse<bool>> XoaChiNhanhAsync(int idCn);

    // Cổ đông & Góp vốn
    Task<ApiResponse<List<ChuCoDongDto>>> LayChuCoDongTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<ChuCoDongDto>> LuuChuCoDongAsync(int idDn, ChuCoDong cd);
    Task<ApiResponse<bool>> XoaChuCoDongAsync(int idCd);
    Task<ApiResponse<bool>> GhiNhanGopVonAsync(GopVonRequest request);

    // Quản lý cơ sở
    Task<ApiResponse<List<QuanLy>>> LayQuanLyTheoChiNhanhAsync(int idCn);
    Task<ApiResponse<QuanLy>> TaoQuanLyChiNhanhAsync(TaoQuanLyRequest request);
    Task<ApiResponse<bool>> XoaQuanLyAsync(int idQly);
}
