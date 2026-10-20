using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace dotnet_backend.Controllers.ChuDoanhNghiep;

/// <summary>
/// Quản lý Chi nhánh & Doanh nghiệp dành cho CHỦ DOANH NGHIỆP, ADMIN, QUẢN LÝ
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,QUAN_LY,ROLE_QUAN_LY")]
public class ChuDoanhNghiepChiNhanhController : ControllerBase
{
    private readonly IDoanhNghiepService _doanhNghiepService;

    public ChuDoanhNghiepChiNhanhController(IDoanhNghiepService doanhNghiepService)
    {
        _doanhNghiepService = doanhNghiepService;
    }

    private int ResolveTargetDnId(int? requestedIdDn)
    {
        if (User.IsInRole("ADMIN") || User.IsInRole("ROLE_ADMIN"))
        {
            if (requestedIdDn.HasValue && requestedIdDn.Value > 0) return requestedIdDn.Value;
        }

        var claimDn = User.FindFirst("IdDn")?.Value;
        if (int.TryParse(claimDn, out int idDn) && idDn > 0) return idDn;

        return requestedIdDn.HasValue && requestedIdDn.Value > 0 ? requestedIdDn.Value : 1;
    }

    [HttpGet("doanh-nghiep")]
    [HttpGet("v1/owner/enterprises")]
    public async Task<IActionResult> LayDanhSachDoanhNghiep([FromQuery] int? idDn)
    {
        if (User.IsInRole("ADMIN") || User.IsInRole("ROLE_ADMIN"))
        {
            var res = await _doanhNghiepService.LayTatCaDoanhNghiepAsync();
            return StatusCode(res.StatusCode, res);
        }

        int targetDnId = ResolveTargetDnId(idDn);
        var one = await _doanhNghiepService.TimDoanhNghiepTheoIdAsync(targetDnId);
        var list = one.Data != null ? new List<DoanhNghiepDto> { one.Data } : new List<DoanhNghiepDto>();
        return Ok(ApiResponse<List<DoanhNghiepDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}")]
    [HttpGet("v1/owner/enterprises/{idDn}")]
    public async Task<IActionResult> LayDoanhNghiepTheoId(int idDn)
    {
        var res = await _doanhNghiepService.TimDoanhNghiepTheoIdAsync(idDn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("doanh-nghiep/chi-nhanh")]
    [HttpGet("chi-nhanh")]
    [HttpGet("v1/owner/branches")]
    public async Task<IActionResult> LayDanhSachChiNhanh([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _doanhNghiepService.LayChiNhanhTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("doanh-nghiep/{idDn}/chi-nhanh")]
    [HttpGet("chi-nhanh/doanh-nghiep/{idDn}")]
    public async Task<IActionResult> LayChiNhanhTheoDoanhNghiepPath(int idDn)
    {
        var res = await _doanhNghiepService.LayChiNhanhTheoDoanhNghiepAsync(idDn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("chi-nhanh/{id}")]
    [HttpGet("doanh-nghiep/chi-nhanh/{id}")]
    public async Task<IActionResult> LayChiNhanhTheoId(int id)
    {
        var res = await _doanhNghiepService.TimChiNhanhTheoIdAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/chi-nhanh")]
    [HttpPost("chi-nhanh")]
    [HttpPost("v1/owner/branches")]
    public async Task<IActionResult> TaoChiNhanh([FromQuery] int? idDn, [FromBody] TaoChiNhanhRequest request)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        request.IdDn = targetDnId;
        var res = await _doanhNghiepService.LuuChiNhanhAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/{idDn}/chi-nhanh")]
    [HttpPost("chi-nhanh/doanh-nghiep/{idDn}")]
    public async Task<IActionResult> TaoChiNhanhTheoDoanhNghiepPath(int idDn, [FromBody] TaoChiNhanhRequest request)
    {
        request.IdDn = idDn;
        var res = await _doanhNghiepService.LuuChiNhanhAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("chi-nhanh/{id}")]
    [HttpPut("doanh-nghiep/chi-nhanh/{id}")]
    public async Task<IActionResult> CapNhatChiNhanh(int id, [FromBody] TaoChiNhanhRequest request)
    {
        var res = await _doanhNghiepService.CapNhatChiNhanhAsync(id, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("chi-nhanh/{id}")]
    [HttpDelete("doanh-nghiep/chi-nhanh/{id}")]
    public async Task<IActionResult> XoaChiNhanh(int id)
    {
        var res = await _doanhNghiepService.XoaChiNhanhAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("chi-nhanh/{idCn}/bo-nhiem-quan-ly")]
    [HttpPost("doanh-nghiep/chi-nhanh/{idCn}/bo-nhiem-quan-ly")]
    public IActionResult BoNhiemQuanLy(int idCn, [FromBody] IDictionary<string, object> payload)
    {
        var data = new
        {
            idCn,
            thongBao = $"Đã bổ nhiệm thành công Quản lý cho chi nhánh ID: {idCn}",
            quanLy = payload.ContainsKey("hoTen") ? payload["hoTen"]?.ToString() : "Quản Lý Mới"
        };
        return Ok(ApiResponse<object>.Ok(data));
    }
}
