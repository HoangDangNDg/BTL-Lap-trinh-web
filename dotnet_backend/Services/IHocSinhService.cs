using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface IHocSinhService
{
    // Học sinh cơ bản
    Task<ApiResponse<PagedResult<HocSinhResponseDto>>> LayDanhSachHocSinhAsync(HocSinhFilterDto filter);
    Task<ApiResponse<HocSinhResponseDto>> TimHocSinhTheoIdAsync(int idHs);
    Task<ApiResponse<HocSinh>> LuuHocSinhAsync(int idDn, HocSinh hs);
    Task<ApiResponse<HocSinh>> CapNhatHocSinhAsync(int idHs, HocSinh hs);
    Task<ApiResponse<bool>> XoaHocSinhAsync(int idHs);
    Task<ApiResponse<List<HocSinhResponseDto>>> TimHocSinhTheoSdtAsync(string sdt, int? idDn);
    Task<ApiResponse<List<HocSinhResponseDto>>> TimHocSinhTheoCccdAsync(string cccd, int? idDn);

    // Phụ huynh & Quan hệ đa Phụ huynh - Học sinh
    Task<ApiResponse<List<PhuHuynhHocSinhDto>>> LayDanhSachPhuHuynhTheoHocSinhAsync(int idHs);
    Task<ApiResponse<List<PhuHuynhHocSinhDto>>> LayDanhSachHocSinhTheoPhuHuynhAsync(int idPh);
    Task<ApiResponse<PhuHuynhHocSinhDto>> GanPhuHuynhVaoHocSinhAsync(GanPhuHuynhRequest request);
    Task<ApiResponse<bool>> XoaQuanHePhuHuynhHocSinhAsync(int idHs, int idPh);
    Task<ApiResponse<bool>> XoaQuanHePhuHuynhHocSinhByIdAsync(int idPhHs);
    Task<ApiResponse<PhuHuynhHocSinhDto>> TaoMoiPhuHuynhChoHocSinhAsync(int idHs, TaoPhuHuynhChoHocSinhRequest request);
    Task<ApiResponse<List<PhuHuynhDto>>> TimPhuHuynhTheoSdtAsync(string sdt, int? idDn);
    Task<ApiResponse<List<PhuHuynhDto>>> TimPhuHuynhTheoCccdAsync(string cccd, int? idDn);

    // Học sinh khóa học
    Task<ApiResponse<HocSinhKhoaHoc>> GanHocSinhVaoKhoaHocAsync(GanHocSinhKhoaHocDto request);
    Task<ApiResponse<List<HocSinhKhoaHoc>>> GanNhieuHocSinhVaoKhoaHocAsync(int idKhoaHoc, List<int> dsIdHs);
    Task<ApiResponse<List<HocSinhKhoaHocDto>>> LayDanhSachHocSinhTheoKhoaHocAsync(int idKhoaHoc);
    Task<ApiResponse<bool>> XoaHocSinhKhoiKhoaHocAsync(int idHs, int idKhoaHoc);
}
