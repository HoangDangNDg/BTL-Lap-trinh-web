using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.Common;

/// <summary>
/// Controller tìm kiếm nhanh dùng chung toàn hệ thống (theo SĐT, CCCD)
/// </summary>
[ApiController]
[Route("api")]
public class TimKiemNhanhController : ControllerBase
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ICoSoVatChatService _coSoVatChatService;

    public TimKiemNhanhController(QuanLyTrungTamDbContext context, ICoSoVatChatService coSoVatChatService)
    {
        _context = context;
        _coSoVatChatService = coSoVatChatService;
    }

    // ==========================================
    // 0. TÌM KIẾM TẤT CẢ (GIÁO VIÊN, QUẢN LÝ, HỌC SINH)
    // ==========================================

    [HttpGet("tim-kiem/tat-ca/sdt")]
    public async Task<IActionResult> TimKiemTatCaTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        var res = await _coSoVatChatService.TimKiemNhanhTheoSoDienThoaiAsync(sdt, idDn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("tim-kiem/tat-ca/cccd")]
    public async Task<IActionResult> TimKiemTatCaTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        var res = await _coSoVatChatService.TimKiemNhanhTheoCccdAsync(cccd, idDn);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 1. TÌM KIẾM GIÁO VIÊN
    // ==========================================

    [HttpGet("tim-kiem/giao-vien/sdt")]
    public async Task<IActionResult> TimGiaoVienTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        var cleanSdt = sdt?.Trim() ?? "";
        var list = await _context.GiaoViens
            .Include(g => g.DoanhNghiep)
            .Where(g => !g.Xoa && g.Sdt != null && g.Sdt.Contains(cleanSdt) && (!idDn.HasValue || g.IdDn == idDn.Value))
            .AsNoTracking()
            .Select(g => new NguoiDungNganGonDto
            {
                Id = g.IdGv,
                HoTen = g.HoTen,
                Sdt = g.Sdt,
                Cccd = null,
                Email = g.Email,
                LoaiNguoiDung = "GIAO_VIEN",
                IdDoanhNghiep = g.IdDn,
                TenDoanhNghiep = g.DoanhNghiep != null ? g.DoanhNghiep.TenDn : null
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NguoiDungNganGonDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/tim-kiem/giao-vien/sdt")]
    public Task<IActionResult> TimGiaoVienTheoSdtTrongDoanhNghiep(int idDn, [FromQuery] string sdt) => TimGiaoVienTheoSdt(sdt, idDn);

    [HttpGet("tim-kiem/giao-vien/cccd")]
    public async Task<IActionResult> TimGiaoVienTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        var cleanCccd = cccd?.Trim() ?? "";
        var gvIds = await _context.ChiTietGvs
            .Where(c => !c.Xoa && c.Cccd != null && c.Cccd.ToString()!.Contains(cleanCccd))
            .Select(c => c.IdGv)
            .ToListAsync();

        var list = await _context.GiaoViens
            .Include(g => g.DoanhNghiep)
            .Where(g => !g.Xoa && gvIds.Contains(g.IdGv) && (!idDn.HasValue || g.IdDn == idDn.Value))
            .AsNoTracking()
            .Select(g => new NguoiDungNganGonDto
            {
                Id = g.IdGv,
                HoTen = g.HoTen,
                Sdt = g.Sdt,
                Cccd = cleanCccd,
                Email = g.Email,
                LoaiNguoiDung = "GIAO_VIEN",
                IdDoanhNghiep = g.IdDn,
                TenDoanhNghiep = g.DoanhNghiep != null ? g.DoanhNghiep.TenDn : null
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NguoiDungNganGonDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/tim-kiem/giao-vien/cccd")]
    public Task<IActionResult> TimGiaoVienTheoCccdTrongDoanhNghiep(int idDn, [FromQuery] string cccd) => TimGiaoVienTheoCccd(cccd, idDn);

    // ==========================================
    // 2. TÌM KIẾM QUẢN LÝ
    // ==========================================

    [HttpGet("tim-kiem/quan-ly/sdt")]
    public async Task<IActionResult> TimQuanLyTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        var cleanSdt = sdt?.Trim() ?? "";
        var list = await _context.QuanLys
            .Include(q => q.ChiNhanh)
            .Where(q => !q.Xoa && q.Sdt != null && q.Sdt.Contains(cleanSdt) && (!idDn.HasValue || q.IdDn == idDn.Value))
            .AsNoTracking()
            .Select(q => new NguoiDungNganGonDto
            {
                Id = q.IdQly,
                HoTen = q.HoTen,
                Sdt = q.Sdt,
                Cccd = q.Cccd,
                Email = q.Email,
                LoaiNguoiDung = "QUAN_LY",
                IdChiNhanh = q.IdCn,
                TenChiNhanh = q.ChiNhanh != null ? q.ChiNhanh.TenCn : null
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NguoiDungNganGonDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/tim-kiem/quan-ly/sdt")]
    public Task<IActionResult> TimQuanLyTheoSdtTrongDoanhNghiep(int idDn, [FromQuery] string sdt) => TimQuanLyTheoSdt(sdt, idDn);

    [HttpGet("tim-kiem/quan-ly/cccd")]
    public async Task<IActionResult> TimQuanLyTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        var cleanCccd = cccd?.Trim() ?? "";
        var list = await _context.QuanLys
            .Include(q => q.ChiNhanh)
            .Where(q => !q.Xoa && q.Cccd != null && q.Cccd.Contains(cleanCccd) && (!idDn.HasValue || q.IdDn == idDn.Value))
            .AsNoTracking()
            .Select(q => new NguoiDungNganGonDto
            {
                Id = q.IdQly,
                HoTen = q.HoTen,
                Sdt = q.Sdt,
                Cccd = q.Cccd,
                Email = q.Email,
                LoaiNguoiDung = "QUAN_LY",
                IdChiNhanh = q.IdCn,
                TenChiNhanh = q.ChiNhanh != null ? q.ChiNhanh.TenCn : null
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NguoiDungNganGonDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/tim-kiem/quan-ly/cccd")]
    public Task<IActionResult> TimQuanLyTheoCccdTrongDoanhNghiep(int idDn, [FromQuery] string cccd) => TimQuanLyTheoCccd(cccd, idDn);

    // ==========================================
    // 3. TÌM KIẾM HỌC SINH
    // ==========================================

    [HttpGet("tim-kiem/hoc-sinh/sdt")]
    public async Task<IActionResult> TimHocSinhTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        var cleanSdt = sdt?.Trim() ?? "";
        var list = await _context.HocSinhs
            .Where(h => !h.Xoa && h.SoDienThoai != null && h.SoDienThoai.Contains(cleanSdt) && (!idDn.HasValue || h.IdDn == idDn.Value))
            .AsNoTracking()
            .Select(h => new NguoiDungNganGonDto
            {
                Id = h.IdHs,
                HoTen = h.HoTen,
                Sdt = h.SoDienThoai,
                Cccd = h.Cccd,
                Email = null,
                LoaiNguoiDung = "HOC_SINH",
                IdDoanhNghiep = h.IdDn
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NguoiDungNganGonDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/tim-kiem/hoc-sinh/sdt")]
    public Task<IActionResult> TimHocSinhTheoSdtTrongDoanhNghiep(int idDn, [FromQuery] string sdt) => TimHocSinhTheoSdt(sdt, idDn);

    [HttpGet("tim-kiem/hoc-sinh/cccd")]
    public async Task<IActionResult> TimHocSinhTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        var cleanCccd = cccd?.Trim() ?? "";
        var list = await _context.HocSinhs
            .Where(h => !h.Xoa && h.Cccd != null && h.Cccd.Contains(cleanCccd) && (!idDn.HasValue || h.IdDn == idDn.Value))
            .AsNoTracking()
            .Select(h => new NguoiDungNganGonDto
            {
                Id = h.IdHs,
                HoTen = h.HoTen,
                Sdt = h.SoDienThoai,
                Cccd = h.Cccd,
                Email = null,
                LoaiNguoiDung = "HOC_SINH",
                IdDoanhNghiep = h.IdDn
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NguoiDungNganGonDto>>.Ok(list));
    }

    [HttpGet("doanh-nghiep/{idDn}/tim-kiem/hoc-sinh/cccd")]
    public Task<IActionResult> TimHocSinhTheoCccdTrongDoanhNghiep(int idDn, [FromQuery] string cccd) => TimHocSinhTheoCccd(cccd, idDn);
}
