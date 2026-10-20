using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface IDaoTaoService
{
    // Lớp học
    Task<ApiResponse<PagedResult<LopHocDto>>> LayDanhSachLopHocAsync(int? idCn, int? idKh, int? idMh, int? idGv, string? keyword, int page, int pageSize);
    Task<ApiResponse<LopHocDto>> LayLopHocTheoIdAsync(int idLop);
    Task<ApiResponse<LopHocDto>> TaoLopHocAsync(TaoLopHocRequest request);
    Task<ApiResponse<LopHocDto>> CapNhatLopHocAsync(int idLop, CapNhatLopHocRequest request);
    Task<ApiResponse<bool>> XoaLopHocAsync(int idLop);
    Task<ApiResponse<LopHocDto>> PhanCongGiaoVienAsync(int idLop, int idGv);

    // Khóa học
    Task<ApiResponse<List<KhoaHocDto>>> LayDanhSachKhoaHocAsync(int? idMh, int? idBoMon, int? idLop);
    Task<ApiResponse<KhoaHocDto>> TaoKhoaHocAsync(TaoKhoaHocRequest request);
    Task<ApiResponse<bool>> XoaKhoaHocAsync(int idKh);

    // Thời khóa biểu tuần
    Task<ApiResponse<List<ThoiKhoaBieuTuanDto>>> LayThoiKhoaBieuTuanTheoLopAsync(int idLop, int? idTuan);
    Task<ApiResponse<List<ThoiKhoaBieuTuanDto>>> LayThoiKhoaBieuTuanTheoGiaoVienAsync(int idGv, int? idTuan);
    Task<ApiResponse<List<ThoiKhoaBieuTuanDto>>> LayThoiKhoaBieuTuanTheoPhongHocAsync(int idPhong, int? idTuan);
    Task<ApiResponse<ThoiKhoaBieuTuan>> LuuThoiKhoaBieuTuanAsync(ThoiKhoaBieuTuan tkb);
    Task<ApiResponse<List<ThoiKhoaBieuTuan>>> LuuThoiKhoaBieuHangLoatAsync(List<ThoiKhoaBieuTuan> dsTkb);
    Task<ApiResponse<bool>> XoaThoiKhoaBieuTuanAsync(int idTkb);

    // Khung lịch học cố định
    Task<ApiResponse<List<KhungLichHocCoDinhDto>>> LayKhungLichCoDinhTheoLopAsync(int idLop);
    Task<ApiResponse<List<KhungLichHocCoDinhDto>>> LayKhungLichCoDinhTheoPhongAsync(int idPhong);
    Task<ApiResponse<KhungLichHocCoDinh>> LuuKhungLichCoDinhAsync(KhungLichHocCoDinh lich);
    Task<ApiResponse<bool>> XoaKhungLichCoDinhAsync(int idKhungLich);

    // Buổi học
    Task<ApiResponse<List<BuoiHocDto>>> TuDongSinhBuoiHocTheoTuanAsync(int idLop, int idTuan);
    Task<ApiResponse<List<BuoiHocDto>>> LayDanhSachBuoiHocTheoLopAsync(int idLop);
    Task<ApiResponse<List<BuoiHocDto>>> LayDanhSachBuoiHocTheoKhoaHocAsync(int idKhoaHoc);
    Task<ApiResponse<List<BuoiHocDto>>> LayDanhSachBuoiHocTheoPhongAsync(int idPhong);
    Task<ApiResponse<BuoiHocDto>> LayBuoiHocTheoIdAsync(int idBuoiHoc);
    Task<ApiResponse<BuoiHoc>> LuuBuoiHocAsync(BuoiHoc buoi);
    Task<ApiResponse<bool>> XoaBuoiHocAsync(int idBuoiHoc);

    // Đăng ký học
    Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoLopAsync(int idLop);
    Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoHocSinhAsync(int idHs);
    Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoChiNhanhAsync(int idCn);
    Task<ApiResponse<DangKyHoc>> DangKyHocAsync(int idHs, int idLop, int? idPh = null, decimal? hocPhi = null);
    Task<ApiResponse<bool>> XoaDangKyHocAsync(int idDangKy);
    Task<ApiResponse<bool>> XoaHocSinhKhoiLopAsync(int idLop, int idHs);
    Task<ApiResponse<bool>> HuyDangKyHocAsync(int idDangKy);

    // Danh mục trợ giúp Form Dropdown (Chi nhánh, Môn học, Kỳ học, Giáo viên)
    Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownChiNhanhAsync();
    Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownMonHocAsync();
    Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownKyHocAsync();
    Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownGiaoVienAsync();
}
