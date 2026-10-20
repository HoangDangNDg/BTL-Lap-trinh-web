using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;

namespace dotnet_backend.Services;

public interface IDiemDanhService
{
    Task<ApiResponse<List<DiemDanhHocSinh>>> LuuDiemDanhHocSinhBatchAsync(LuuDiemDanhBuoiHocRequest request);
    Task<ApiResponse<List<DiemDanhHocSinh>>> LayDiemDanhTheoBuoiHocAsync(int idBuoiHoc);
    Task<ApiResponse<List<DiemDanhHocSinh>>> LayLichSuDiemDanhHocSinhAsync(int idHs, int? idKhoaHoc);
    Task<ApiResponse<List<DiemDanhGiaoVien>>> LayLichSuDiemDanhGiaoVienAsync(int idGv, int? idBuoiHoc);
    Task<ApiResponse<bool>> XoaDiemDanhHocSinhBuoiHocAsync(int idBuoiHoc, List<int>? idDiemDanhs);
    Task<ApiResponse<DiemDanhGiaoVien>> DiemDanhGiaoVienAsync(DiemDanhGiaoVienRequest request);
    Task<ApiResponse<DiemDanhGiaoVien>> CapNhatDiemDanhGiaoVienAsync(int idDiemDanh, string trangThai);
}
