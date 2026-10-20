using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.GiaoVien;

/// <summary>
/// Điểm danh nhanh & Lưu hàng loạt (Batch Save) dành cho GIÁO VIÊN
/// </summary>
[ApiController]
[Authorize(Roles = "GIAO_VIEN,ROLE_GIAO_VIEN,QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class GiaoVienDiemDanhController : ControllerBase
{
    private readonly IDiemDanhService _diemDanhService;

    public GiaoVienDiemDanhController(IDiemDanhService diemDanhService)
    {
        _diemDanhService = diemDanhService;
    }

    [HttpGet("api/giao-vien/buoi-hoc/{idBuoiHoc}/danh-sach-diem-danh")]
    [HttpGet("api/buoi-hoc/{idBuoiHoc}/diem-danh-hoc-sinh")]
    [HttpGet("api/v1/diem-danh/buoi-hoc/{idBuoiHoc}")]
    [HttpGet("api/diem-danh/buoi-hoc/{idBuoiHoc}")]
    public async Task<IActionResult> LayDiemDanhTheoBuoi(int idBuoiHoc)
    {
        var result = await _diemDanhService.LayDiemDanhTheoBuoiHocAsync(idBuoiHoc);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("api/buoi-hoc/{idBuoiHoc}/diem-danh-hoc-sinh")]
    public async Task<IActionResult> CapNhatDiemDanhHocSinh(int idBuoiHoc, [FromBody] LuuDiemDanhBuoiHocRequest request)
    {
        request.IdBuoiHoc = idBuoiHoc;
        var result = await _diemDanhService.LuuDiemDanhHocSinhBatchAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("api/giao-vien/khoa-hoc/{idKhoaHoc}/danh-sach-diem-danh")]
    [HttpGet("api/khoa-hoc/{idKhoaHoc}/diem-danh-hoc-sinh")]
    public async Task<IActionResult> LayDiemDanhTheoKhoaHoc(int idKhoaHoc, [FromQuery] int? idHs)
    {
        if (idHs.HasValue && idHs.Value > 0)
        {
            var res = await _diemDanhService.LayLichSuDiemDanhHocSinhAsync(idHs.Value, idKhoaHoc);
            return StatusCode(res.StatusCode, res);
        }
        var list = await _diemDanhService.LayLichSuDiemDanhHocSinhAsync(0, idKhoaHoc);
        return StatusCode(list.StatusCode, list);
    }

    [HttpGet("api/buoi-hoc/{idBuoiHoc}/diem-danh-giao-vien")]
    public async Task<IActionResult> LayDiemDanhGiaoVienTheoBuoi(int idBuoiHoc)
    {
        var result = await _diemDanhService.LayLichSuDiemDanhGiaoVienAsync(0, idBuoiHoc);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Cập nhật điểm danh giáo viên theo buổi học
    /// </summary>
    [HttpPost("api/buoi-hoc/{idBuoiHoc}/diem-danh-giao-vien")]
    public async Task<IActionResult> CapNhatDiemDanhGiaoVien(int idBuoiHoc, [FromBody] List<DiemDanhGiaoVienRequest> danhSachDiemDanh)
    {
        if (danhSachDiemDanh != null)
        {
            foreach (var dd in danhSachDiemDanh)
            {
                dd.IdBuoiHoc = idBuoiHoc;
                await _diemDanhService.DiemDanhGiaoVienAsync(dd);
            }
        }
        var result = await _diemDanhService.LayLichSuDiemDanhGiaoVienAsync(0, idBuoiHoc);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("api/hoc-sinh/{idHs}/diem-danh")]
    public async Task<IActionResult> LayDiemDanhTheoHocSinh(int idHs, [FromQuery] int? idKhoaHoc)
    {
        var result = await _diemDanhService.LayLichSuDiemDanhHocSinhAsync(idHs, idKhoaHoc);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("api/giao-vien/{idGv}/diem-danh")]
    public async Task<IActionResult> LayDiemDanhTheoGiaoVien(int idGv, [FromQuery] int? idBuoiHoc)
    {
        var result = await _diemDanhService.LayLichSuDiemDanhGiaoVienAsync(idGv, idBuoiHoc);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("api/diem-danh-hoc-sinh/batch")]
    [HttpPost("api/giao-vien/diem-danh/batch")]
    [HttpPost("api/v1/diem-danh/hoc-sinh/batch")]
    [HttpPost("api/diem-danh/hoc-sinh/batch")]
    public async Task<IActionResult> LuuDanhSachDiemDanh([FromBody] LuuDiemDanhBuoiHocRequest request)
    {
        var result = await _diemDanhService.LuuDiemDanhHocSinhBatchAsync(request);
        return StatusCode(result.StatusCode, result);
    }
}
