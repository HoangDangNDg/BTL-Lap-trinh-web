using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface ICoSoVatChatService
{
    // Phòng học
    Task<ApiResponse<List<PhongHocDto>>> TimPhongHocTheoChiNhanhAsync(int idCn);
    Task<ApiResponse<PhongHocDto>> TimPhongHocTheoIdAsync(int idPhong);
    Task<ApiResponse<PhongHocDto>> LuuPhongHocAsync(TaoPhongHocRequest request);
    Task<ApiResponse<bool>> XoaPhongHocAsync(int idPhong);

    // Năm học, Kỳ học, Tuần học
    Task<ApiResponse<List<NamHocDto>>> TimNamHocTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<NamHocDto>> LuuNamHocAsync(TaoNamHocRequest request);
    Task<ApiResponse<bool>> XoaNamHocAsync(int idNh);
    Task<ApiResponse<bool>> DoiTrangThaiHoanThanhNamHocAsync(int idNamHoc);
    Task<ApiResponse<List<KyHocDto>>> TimKyHocTheoNamHocAsync(int idNh);
    Task<ApiResponse<KyHocDto>> LuuKyHocAsync(int idNh, string tenKyHoc, DateOnly tuNgay, DateOnly denNgay);
    Task<ApiResponse<bool>> XoaKyHocAsync(int idKh);
    Task<ApiResponse<List<TuanHocDto>>> TimTuanHocTheoKyHocAsync(int idKh);
    Task<ApiResponse<List<TuanHocDto>>> TaoTuanHocHangLoatAsync(int idNh);
    Task<ApiResponse<TuanHocDto>> TimTuanHocTheoNgayAsync(DateOnly ngay, int idDn);

    // Bộ môn, Chuyên môn, Môn học
    Task<ApiResponse<List<BoMonDto>>> TimBoMonTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<BoMonDto>> LuuBoMonAsync(int idDn, string tenBoMon, string? moTa);
    Task<ApiResponse<bool>> XoaBoMonAsync(int idBoMon);

    Task<ApiResponse<List<ChuyenMonDto>>> TimChuyenMonTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<ChuyenMonDto>> LuuChuyenMonAsync(int idDn, string tenChuyenMon, string? moTa);
    Task<ApiResponse<bool>> XoaChuyenMonAsync(int idCm);

    Task<ApiResponse<List<MonHocDto>>> TimMonHocTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<MonHocDto>> LuuMonHocAsync(int idDn, int idBoMon, int idCm, string tenMon, string? moTa);
    Task<ApiResponse<bool>> XoaMonHocAsync(int idMh);

    // Tìm kiếm nhanh đa năng theo SĐT & CCCD
    Task<ApiResponse<List<NguoiDungNganGonDto>>> TimKiemNhanhTheoSoDienThoaiAsync(string sdt, int? idDn);
    Task<ApiResponse<List<NguoiDungNganGonDto>>> TimKiemNhanhTheoCccdAsync(string cccd, int? idDn);
}
