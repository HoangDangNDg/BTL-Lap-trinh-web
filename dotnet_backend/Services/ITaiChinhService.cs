using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface ITaiChinhService
{
    Task<ApiResponse<PhieuThuHocPhi>> LapPhieuThuHocPhiAsync(TaoPhieuThuRequest request);
    Task<ApiResponse<List<PhieuThuHocPhi>>> TimPhieuThuTheoHocSinhAsync(int idHs);
    Task<ApiResponse<BaoCaoThuChiSummaryDto>> LayBaoCaoTongHopAsync(int idDn, DateOnly? tuNgay, DateOnly? denNgay);
    Task<ApiResponse<SoQuyThuChi>> GhiSoQuyAsync(SoQuyThuChi soQuy);

    Task<ApiResponse<BaoLuuKhoaHocDto>> TaoBaoLuuAsync(TaoBaoLuuRequest request);
    Task<ApiResponse<BaoLuuKhoaHocDto>> DuyetBaoLuuAsync(int idBaoLuu, DuyetBaoLuuRequest request);
    Task<ApiResponse<BaoLuuKhoaHocDto>> HoanTraBaoLuuAsync(int idBaoLuu);
    Task<ApiResponse<bool>> XoaBaoLuuKhoaHocAsync(int idBaoLuu);
    Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoHocSinhAsync(int idHs);
    Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoLopAsync(int idLop);
    Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoChiNhanhAsync(int idCn);
    Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoDoanhNghiepAsync(int idDn);

    Task<ApiResponse<ThanhToanGiaoVien>> ThanhToanLuongGiaoVienAsync(ThanhToanLuongGvRequest request);
    Task<ApiResponse<List<ThanhToanGiaoVien>>> TimThanhToanLuongTheoGiaoVienAsync(int idGv);
    Task<ApiResponse<List<ThanhToanGiaoVien>>> TimThanhToanLuongTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<bool>> XoaThanhToanGiaoVienAsync(int idThanhToan);

    Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiNamAsync(int idDn, int? idCn, int idNamHoc);
    Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiKyAsync(int idDn, int? idCn, int idKyHoc);
    Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiThangAsync(int idDn, int? idCn, int idThangHoc);
    Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiTuanAsync(int idDn, int? idCn, int idTuanHoc);

    Task<ApiResponse<List<SoQuyThuChi>>> TimGiaoDichTheoChiNhanhAsync(int idCn);
    Task<ApiResponse<List<SoQuyThuChi>>> TimGiaoDichTheoDoanhNghiepAsync(int idDn);
    Task<ApiResponse<bool>> XoaSoQuyAsync(int idGd);
    Task CapNhatRollupThuChiAsync(int idDn, int idCn, DateOnly ngayGiaoDich, decimal tienThu, decimal tienChi, string? ghiChu = null);
}
