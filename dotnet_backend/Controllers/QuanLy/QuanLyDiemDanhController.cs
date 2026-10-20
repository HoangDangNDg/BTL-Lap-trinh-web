using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Điểm danh Học sinh và Giáo viên dành cho QUẢN LÝ CƠ SỞ & CHỦ DOANH NGHIỆP
/// </summary>
[ApiController]
[Route("api/quan-ly/diem-danh")]
[Route("api/v1/manager/attendance")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyDiemDanhController : ControllerBase
{
    private readonly IDiemDanhService _diemDanhService;

    public QuanLyDiemDanhController(IDiemDanhService diemDanhService)
    {
        _diemDanhService = diemDanhService;
    }

    [HttpGet("students")]
    public async Task<IActionResult> LayDiemDanhHocSinh([FromQuery] int? idBuoi, [FromQuery] int? idHs, [FromQuery] int? idKhoaHoc)
    {
        if (idBuoi.HasValue && idBuoi.Value > 0)
        {
            var result = await _diemDanhService.LayDiemDanhTheoBuoiHocAsync(idBuoi.Value);
            return StatusCode(result.StatusCode, result);
        }

        if (idHs.HasValue && idHs.Value > 0)
        {
            var result = await _diemDanhService.LayLichSuDiemDanhHocSinhAsync(idHs.Value, idKhoaHoc);
            return StatusCode(result.StatusCode, result);
        }

        var defaultRes = await _diemDanhService.LayDiemDanhTheoBuoiHocAsync(1);
        return StatusCode(defaultRes.StatusCode, defaultRes);
    }

    [HttpPost("students")]
    public async Task<IActionResult> DiemDanhHocSinh(
        [FromQuery] int idBuoi,
        [FromQuery] int idHs,
        [FromBody] DiemDanhHocSinh dd)
    {
        var request = new LuuDiemDanhBuoiHocRequest
        {
            IdBuoiHoc = idBuoi,
            DanhSach = new List<DiemDanhHocSinhItemDto>
            {
                new()
                {
                    IdHs = idHs > 0 ? idHs : dd.IdHs,
                    TrangThai = dd.TrangThai ? "CO_MAT" : "VANG",
                    GhiChu = null
                }
            }
        };

        var result = await _diemDanhService.LuuDiemDanhHocSinhBatchAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("students/batch")]
    public async Task<IActionResult> DiemDanhHocSinhBatch([FromBody] LuuDiemDanhBuoiHocRequest request)
    {
        var result = await _diemDanhService.LuuDiemDanhHocSinhBatchAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpDelete("students")]
    public async Task<IActionResult> XoaDiemDanhHocSinh([FromQuery] int idBuoi, [FromBody] List<int>? ids)
    {
        var result = await _diemDanhService.XoaDiemDanhHocSinhBuoiHocAsync(idBuoi, ids);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("teachers")]
    public async Task<IActionResult> LayDiemDanhGiaoVien([FromQuery] int? idGv, [FromQuery] int? idBuoi)
    {
        if (idGv.HasValue && idGv.Value > 0)
        {
            var result = await _diemDanhService.LayLichSuDiemDanhGiaoVienAsync(idGv.Value, idBuoi);
            return StatusCode(result.StatusCode, result);
        }

        if (idBuoi.HasValue && idBuoi.Value > 0)
        {
            var result = await _diemDanhService.LayLichSuDiemDanhGiaoVienAsync(1, idBuoi.Value);
            return StatusCode(result.StatusCode, result);
        }

        var defaultRes = await _diemDanhService.LayLichSuDiemDanhGiaoVienAsync(1, null);
        return StatusCode(defaultRes.StatusCode, defaultRes);
    }

    [HttpPost("teachers")]
    public async Task<IActionResult> DiemDanhGiaoVien(
        [FromQuery] int idGv,
        [FromQuery] int idBuoi,
        [FromBody] DiemDanhGiaoVien dd)
    {
        var request = new DiemDanhGiaoVienRequest
        {
            IdBuoiHoc = idBuoi,
            IdGv = idGv > 0 ? idGv : dd.IdGv,
            TrangThai = dd.TrangThai ?? "CO_MAT",
            GhiChu = null
        };

        var result = await _diemDanhService.DiemDanhGiaoVienAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("teachers/{idDiemDanh}")]
    public async Task<IActionResult> CapNhatDiemDanhGiaoVien(int idDiemDanh, [FromQuery] string trangThai)
    {
        var result = await _diemDanhService.CapNhatDiemDanhGiaoVienAsync(idDiemDanh, trangThai);
        return StatusCode(result.StatusCode, result);
    }
}
