using dotnet_backend.Common;
using dotnet_backend.DTOs;

namespace dotnet_backend.Services;

public interface INhanSuService
{
    // Giáo viên
    Task<ApiResponse<PagedResult<GiaoVienDto>>> LayDanhSachGiaoVienAsync(int? idDn, int? idCn, int? idCm, string? keyword, int page, int pageSize);
    Task<ApiResponse<GiaoVienDto>> TimGiaoVienTheoIdAsync(int idGv);
    Task<ApiResponse<GiaoVienDto>> LuuGiaoVienAsync(int idDn, TaoGiaoVienRequest request);
    Task<ApiResponse<BulkResultDto>> LuuGiaoVienHangLoatAsync(int idDn, List<GiaoVienBulkDto> danhSach);
    Task<ApiResponse<GiaoVienDto>> CapNhatGiaoVienAsync(int idGv, CapNhatGiaoVienRequest request);
    Task<ApiResponse<bool>> XoaGiaoVienAsync(int idGv);
    Task<ApiResponse<List<GiaoVienDto>>> TimGiaoVienTheoSdtAsync(string sdt, int? idDn);
    Task<ApiResponse<List<GiaoVienDto>>> TimGiaoVienTheoCccdAsync(string cccd, int? idDn);

    // Chuyên môn & Chi nhánh
    Task<ApiResponse<bool>> GanChuyenMonAsync(int idGv, int idCm);
    Task<ApiResponse<bool>> XoaChuyenMonAsync(int idGv, int idCm);
    Task<ApiResponse<bool>> GanChiNhanhAsync(int idGv, int idCn);
    Task<ApiResponse<bool>> XoaChiNhanhAsync(int idGv, int idCn);

    // Chi tiết giáo viên & Hồ sơ
    Task<ApiResponse<ChiTietGiaoVienDto>> TimChiTietGvAsync(int idGv);
    Task<ApiResponse<ChiTietGiaoVienDto>> LuuChiTietGvAsync(int idGv, ChiTietGiaoVienDto request);
    Task<ApiResponse<HoSoGiaoVienDto>> LayHoSoCaNhanGiaoVienAsync(int idGv);
    Task<ApiResponse<HoSoGiaoVienDto>> CapNhatHoSoCaNhanGiaoVienAsync(int idGv, CapNhatHoSoGiaoVienDto request);

    // Chứng chỉ giáo viên
    Task<ApiResponse<List<ChungChiGiaoVienDto>>> TimChungChiTheoGiaoVienAsync(int idGv);
    Task<ApiResponse<ChungChiGiaoVienDto>> ThemChungChiGiaoVienAsync(int idGv, ChungChiRequestDto request);
    Task<ApiResponse<bool>> XoaChungChiGiaoVienAsync(int idChungChi);

    // Tài khoản giáo viên
    Task<ApiResponse<TaiKhoanGvDto>> TaoTaiKhoanChoGiaoVienAsync(int idGv, TaoTaiKhoanGvRequest request);
    Task<ApiResponse<TaiKhoanGvDto>> TimTaiKhoanCuaGiaoVienAsync(int idGv);

    // Nhân công khác
    Task<ApiResponse<List<NhanCongKhacDto>>> TimNhanCongTheoChiNhanhAsync(int idCn);
    Task<ApiResponse<List<NhanCongKhacDto>>> TimNhanCongTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<NhanCongKhacDto>> LuuNhanCongAsync(TaoNhanCongRequest request);
    Task<ApiResponse<NhanCongKhacDto>> CapNhatNhanCongAsync(int idNc, TaoNhanCongRequest request);
    Task<ApiResponse<bool>> XoaNhanCongAsync(int idNc);
}
