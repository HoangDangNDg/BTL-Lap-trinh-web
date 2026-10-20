using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.Admin;

/// <summary>
/// Quản trị Doanh nghiệp & Cấp phát Chi nhánh độc quyền dành cho ADMIN
/// </summary>
[ApiController]
[Route("api/admin/doanh-nghiep")]
[Route("api/admin")]
[Route("api/v1/admin/enterprises")]
[Authorize(Roles = "ADMIN,ROLE_ADMIN")]
public class AdminDoanhNghiepController : ControllerBase
{
    private readonly IDoanhNghiepService _doanhNghiepService;
    private readonly QuanLyTrungTamDbContext _context;

    public AdminDoanhNghiepController(
        IDoanhNghiepService doanhNghiepService,
        QuanLyTrungTamDbContext context)
    {
        _doanhNghiepService = doanhNghiepService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> LayTatCaDoanhNghiep()
    {
        var res = await _doanhNghiepService.LayTatCaDoanhNghiepAsync();
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("{idDn}")]
    public async Task<IActionResult> LayDoanhNghiepTheoId(int idDn)
    {
        var res = await _doanhNghiepService.TimDoanhNghiepTheoIdAsync(idDn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost]
    public async Task<IActionResult> TaoDoanhNghiep([FromBody] DoanhNghiep doanhNghiep)
    {
        var res = await _doanhNghiepService.LuuDoanhNghiepAsync(doanhNghiep);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("{idDn}")]
    public async Task<IActionResult> CapNhatDoanhNghiep(int idDn, [FromBody] DoanhNghiep dn)
    {
        var item = await _context.DoanhNghieps.FirstOrDefaultAsync(d => d.IdDn == idDn && !d.Xoa);
        if (item == null) return NotFound(ApiResponse<DoanhNghiep>.Fail("Không tìm thấy doanh nghiệp", 404));

        if (!string.IsNullOrWhiteSpace(dn.TenDn)) item.TenDn = dn.TenDn.Trim();
        if (dn.MaSoThue != null) item.MaSoThue = dn.MaSoThue.Trim();
        if (dn.NgayDangKy.HasValue) item.NgayDangKy = dn.NgayDangKy;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<DoanhNghiep>.Ok(item, "Cập nhật thông tin doanh nghiệp thành công"));
    }

    [HttpDelete("{idDn}")]
    public async Task<IActionResult> XoaDoanhNghiep(int idDn)
    {
        var res = await _doanhNghiepService.XoaDoanhNghiepAsync(idDn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("{idDn}/khoi-phuc")]
    [HttpPut("{idDn}/khoi-phuc")]
    [HttpPost("{idDn}/restore")]
    public async Task<IActionResult> KhoiPhucDoanhNghiep(int idDn)
    {
        var item = await _context.DoanhNghieps.FirstOrDefaultAsync(d => d.IdDn == idDn);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy doanh nghiệp", 404));

        item.Xoa = false;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Khôi phục doanh nghiệp thành công"));
    }

    [HttpGet("chi-nhanh/all")]
    [HttpGet("chi-nhanh")]
    public async Task<IActionResult> LayTatCaChiNhanh()
    {
        var list = await _context.ChiNhanhs
            .Include(c => c.DoanhNghiep)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<ChiNhanh>>.Ok(list));
    }

    [HttpPost("chi-nhanh/cap-phat")]
    public async Task<IActionResult> CapPhatChiNhanh([FromBody] IDictionary<string, object> payload)
    {
        int idDn = payload.ContainsKey("idDn") && payload["idDn"] != null ? Convert.ToInt32(payload["idDn"].ToString()) : 1;
        var req = new TaoChiNhanhRequest
        {
            IdDn = idDn,
            TenCn = payload.ContainsKey("tenCn") ? payload["tenCn"]?.ToString() ?? "Chi nhánh mới" : "Chi nhánh mới",
            DiaChi = payload.ContainsKey("diaChi") ? payload["diaChi"]?.ToString() : null,
            Sdt = payload.ContainsKey("sdt") ? payload["sdt"]?.ToString() : null
        };

        var res = await _doanhNghiepService.LuuChiNhanhAsync(req);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("{idDn}/chi-nhanh")]
    public async Task<IActionResult> TaoChiNhanhChoDoanhNghiep(int idDn, [FromBody] TaoChiNhanhRequest request)
    {
        request.IdDn = idDn;
        var res = await _doanhNghiepService.LuuChiNhanhAsync(request);
        return StatusCode(res.StatusCode, res);
    }
}
