using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Quản lý Thu học phí, Sổ quỹ cơ sở & Lương giáo viên dành cho QUẢN LÝ CƠ SỞ
/// </summary>
[ApiController]
[Route("api/quan-ly/tai-chinh")]
[Route("api/v1/manager/finances")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyTaiChinhController : ControllerBase
{
    private readonly ITaiChinhService _taiChinhService;

    public QuanLyTaiChinhController(ITaiChinhService taiChinhService)
    {
        _taiChinhService = taiChinhService;
    }

    [HttpGet("receipts")]
    public async Task<IActionResult> LayPhieuThuTheoHocSinh([FromQuery] int idHs)
    {
        var result = await _taiChinhService.TimPhieuThuTheoHocSinhAsync(idHs);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("receipts")]
    public async Task<IActionResult> TaoPhieuThu(
        [FromQuery] int idHs,
        [FromQuery] int idDangKy,
        [FromQuery] int? idDn,
        [FromBody] PhieuThuHocPhi pt)
    {
        var request = new TaoPhieuThuRequest
        {
            IdHs = idHs,
            IdDangKy = idDangKy,
            IdDn = idDn ?? 1,
            SoTien = pt.SoTienThu,
            HinhThucThanhToan = pt.PhuongThuc ?? "TIEN_MAT",
            GhiChu = null
        };

        var result = await _taiChinhService.LapPhieuThuHocPhiAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("cashbook")]
    public async Task<IActionResult> LaySoQuyChiNhanh([FromQuery] int? idCn)
    {
        var result = await _taiChinhService.LayBaoCaoTongHopAsync(idCn ?? 1, null, null);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("cashbook")]
    public async Task<IActionResult> TaoGiaoDichThuChi([FromQuery] int? idCn, [FromBody] SoQuyThuChi gd)
    {
        var result = await _taiChinhService.GhiSoQuyAsync(gd);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("teacher-payrolls")]
    public async Task<IActionResult> LayBangLuongGiaoVienTheoChiNhanh([FromQuery] int? idCn)
    {
        var result = await _taiChinhService.LayBaoCaoTongHopAsync(idCn ?? 1, null, null);
        return StatusCode(result.StatusCode, result);
    }

    private int ResolveTargetDnId()
    {
        var claimDn = User.FindFirst("IdDn")?.Value;
        if (int.TryParse(claimDn, out int idDn) && idDn > 0) return idDn;
        return 1;
    }

    [HttpGet("thu-chi-nam")]
    [HttpGet("yearly-summary")]
    public async Task<IActionResult> LayThuChiNamChiNhanh([FromQuery] int? idCn, [FromQuery] int? idNamHoc)
    {
        int targetDn = ResolveTargetDnId();
        var result = await _taiChinhService.LayThuChiNamAsync(targetDn, idCn, idNamHoc ?? 0);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("thu-chi-ky")]
    [HttpGet("semester-summary")]
    public async Task<IActionResult> LayThuChiKyChiNhanh([FromQuery] int? idCn, [FromQuery] int? idKyHoc)
    {
        int targetDn = ResolveTargetDnId();
        var result = await _taiChinhService.LayThuChiKyAsync(targetDn, idCn, idKyHoc ?? 0);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("thu-chi-thang")]
    [HttpGet("monthly-summary")]
    public async Task<IActionResult> LayThuChiThangChiNhanh([FromQuery] int? idCn, [FromQuery] int? idThangHoc)
    {
        int targetDn = ResolveTargetDnId();
        var result = await _taiChinhService.LayThuChiThangAsync(targetDn, idCn, idThangHoc ?? 0);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("thu-chi-tuan")]
    [HttpGet("weekly-summary")]
    public async Task<IActionResult> LayThuChiTuanChiNhanh([FromQuery] int? idCn, [FromQuery] int? idTuanHoc)
    {
        int targetDn = ResolveTargetDnId();
        var result = await _taiChinhService.LayThuChiTuanAsync(targetDn, idCn, idTuanHoc ?? 0);
        return StatusCode(result.StatusCode, result);
    }
}
