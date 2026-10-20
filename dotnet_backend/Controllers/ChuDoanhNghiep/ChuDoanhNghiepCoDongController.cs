using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.ChuDoanhNghiep;

/// <summary>
/// Quản lý Cổ đông & Vốn góp sở hữu dành cho CHỦ DOANH NGHIỆP, ADMIN
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class ChuDoanhNghiepCoDongController : ControllerBase
{
    private readonly IDoanhNghiepService _doanhNghiepService;
    private readonly QuanLyTrungTamDbContext _context;

    public ChuDoanhNghiepCoDongController(IDoanhNghiepService doanhNghiepService, QuanLyTrungTamDbContext context)
    {
        _doanhNghiepService = doanhNghiepService;
        _context = context;
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

    // ==========================================
    // 1. CỔ ĐÔNG (SHAREHOLDERS)
    // ==========================================

    [HttpGet("doanh-nghiep/chu-co-dong")]
    [HttpGet("chu-co-dong")]
    [HttpGet("v1/owner/shareholders")]
    public async Task<IActionResult> LayDanhSachCoDong([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _doanhNghiepService.LayChuCoDongTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("doanh-nghiep/{idDn}/chu-co-dong")]
    public async Task<IActionResult> LayChuCoDongTheoDoanhNghiep(int idDn)
    {
        var res = await _doanhNghiepService.LayChuCoDongTheoDoanhNghiepAsync(idDn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("doanh-nghiep/chu-co-dong/{id}")]
    [HttpGet("chu-co-dong/{id}")]
    public async Task<IActionResult> LayChiTietCoDong(int id)
    {
        var cd = await _context.ChuCoDongs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdCd == id && !c.Xoa);

        if (cd == null) return NotFound(ApiResponse<ChuCoDong>.Fail("Không tìm thấy thông tin cổ đông", 404));
        return Ok(ApiResponse<ChuCoDong>.Ok(cd));
    }

    [HttpPost("doanh-nghiep/chu-co-dong")]
    [HttpPost("chu-co-dong")]
    [HttpPost("v1/owner/shareholders")]
    public async Task<IActionResult> TaoCoDong([FromQuery] int? idDn, [FromBody] ChuCoDong cd)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _doanhNghiepService.LuuChuCoDongAsync(targetDnId, cd);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/{idDn}/chu-co-dong")]
    public async Task<IActionResult> TaoCoDongTheoDoanhNghiepPath(int idDn, [FromBody] ChuCoDong cd)
    {
        var res = await _doanhNghiepService.LuuChuCoDongAsync(idDn, cd);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("doanh-nghiep/chu-co-dong/{id}")]
    [HttpPut("chu-co-dong/{id}")]
    public async Task<IActionResult> CapNhatCoDong(int id, [FromBody] ChuCoDong cd)
    {
        var item = await _context.ChuCoDongs.FirstOrDefaultAsync(c => c.IdCd == id && !c.Xoa);
        if (item == null) return NotFound(ApiResponse<ChuCoDong>.Fail("Không tìm thấy thông tin cổ đông", 404));

        if (!string.IsNullOrWhiteSpace(cd.HoTen)) item.HoTen = cd.HoTen.Trim();
        if (cd.Sdt != null) item.Sdt = cd.Sdt.Trim();
        if (cd.Email != null) item.Email = cd.Email.Trim();

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<ChuCoDong>.Ok(item, "Cập nhật cổ đông thành công"));
    }

    [HttpDelete("doanh-nghiep/chu-co-dong/{id}")]
    [HttpDelete("chu-co-dong/{id}")]
    public async Task<IActionResult> XoaCoDong(int id)
    {
        var res = await _doanhNghiepService.XoaChuCoDongAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 2. GÓP VỐN (CONTRIBUTIONS)
    // ==========================================

    [HttpGet("doanh-nghiep/chu-co-dong/contributions")]
    [HttpGet("gop-von")]
    public async Task<IActionResult> LayDanhSachGopVon([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var list = await _context.GopVonSoHuus
            .Include(g => g.ChuCoDong)
            .Where(g => g.IdDn == targetDnId && !g.Xoa)
            .OrderByDescending(g => g.NgayGop)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<GopVonSoHuu>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/gop-von")]
    public async Task<IActionResult> LayGopVonTheoDoanhNghiep(int idDn)
    {
        var list = await _context.GopVonSoHuus
            .Include(g => g.ChuCoDong)
            .Where(g => g.IdDn == idDn && !g.Xoa)
            .OrderByDescending(g => g.NgayGop)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<GopVonSoHuu>>.Ok(list));
    }

    [HttpGet("chu-co-dong/{idCd}/gop-von")]
    public async Task<IActionResult> LayGopVonTheoChuCoDong(int idCd)
    {
        var list = await _context.GopVonSoHuus
            .Where(g => g.IdCd == idCd && !g.Xoa)
            .OrderByDescending(g => g.NgayGop)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<GopVonSoHuu>>.Ok(list));
    }

    [HttpPost("doanh-nghiep/chu-co-dong/contributions")]
    [HttpPost("gop-von")]
    public async Task<IActionResult> GhiNhanGopVon([FromBody] GopVonRequest request)
    {
        var res = await _doanhNghiepService.GhiNhanGopVonAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("doanh-nghiep/chu-co-dong/contributions/{id}")]
    [HttpPut("gop-von/{id}")]
    public async Task<IActionResult> CapNhatGopVon(int id, [FromBody] GopVonSoHuu gv)
    {
        var item = await _context.GopVonSoHuus.FirstOrDefaultAsync(g => g.IdGopVon == id && !g.Xoa);
        if (item == null) return NotFound(ApiResponse<GopVonSoHuu>.Fail("Không tìm thấy giao dịch góp vốn", 404));

        item.SoTienGop = gv.SoTienGop;
        if (gv.NgayGop.HasValue) item.NgayGop = gv.NgayGop;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<GopVonSoHuu>.Ok(item, "Cập nhật vốn góp thành công"));
    }

    [HttpDelete("doanh-nghiep/chu-co-dong/contributions/{id}")]
    [HttpDelete("gop-von/{id}")]
    public async Task<IActionResult> XoaGopVon(int id)
    {
        var item = await _context.GopVonSoHuus.FirstOrDefaultAsync(g => g.IdGopVon == id && !g.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy giao dịch góp vốn", 404));

        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa thông tin góp vốn thành công"));
    }
}
