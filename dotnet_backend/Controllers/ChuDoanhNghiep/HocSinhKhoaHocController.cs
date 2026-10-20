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
/// Quản lý liên kết Học sinh - Khóa học (bảng trung gian hoc_sinh_khoa_hoc)
/// </summary>
[ApiController]
[Route("api/hoc-sinh-khoa-hoc")]
[Route("api/doanh-nghiep/hoc-sinh-khoa-hoc")]
[Route("api/v1/hoc-sinh")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,GIAO_VIEN,ROLE_GIAO_VIEN,QUAN_LY,ROLE_QUAN_LY")]
public class HocSinhKhoaHocController : ControllerBase
{
    private readonly IHocSinhService _hocSinhService;
    private readonly QuanLyTrungTamDbContext _context;

    public HocSinhKhoaHocController(
        IHocSinhService hocSinhService,
        QuanLyTrungTamDbContext context)
    {
        _hocSinhService = hocSinhService;
        _context = context;
    }

    [HttpGet("khoa-hoc/{idKhoaHoc}")]
    public async Task<IActionResult> LayDanhSachTheoKhoaHoc(int idKhoaHoc, [FromQuery] int? idDn)
    {
        var list = await _context.HocSinhKhoaHocs
            .Include(h => h.HocSinh)
            .Where(h => h.IdKhoaHoc == idKhoaHoc && !h.Xoa && (!idDn.HasValue || h.IdDn == idDn.Value))
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<HocSinhKhoaHoc>>.Ok(list));
    }

    [HttpGet("khoa-hoc/{idKhoaHoc}/ngan-gon")]
    public async Task<IActionResult> LayDanhSachNganGonTheoKhoaHoc(int idKhoaHoc)
    {
        var list = await _context.HocSinhKhoaHocs
            .Include(h => h.HocSinh)
            .Where(h => h.IdKhoaHoc == idKhoaHoc && !h.Xoa)
            .Select(h => new
            {
                h.IdHsKh,
                h.IdHs,
                HoTen = h.HocSinh != null ? h.HocSinh.HoTen : h.HoTen,
                TenHocSinh = h.HocSinh != null ? h.HocSinh.HoTen : h.HoTen,
                SoDienThoai = h.HocSinh != null ? h.HocSinh.SoDienThoai : null,
                GioiTinh = h.HocSinh != null ? h.HocSinh.GioiTinh : null,
                h.SoBuoiDaHoc,
                h.TrangThai
            })
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(list));
    }

    [HttpPost]
    [HttpPost("gan-khoa-hoc")]
    public async Task<IActionResult> GanHocSinhVaoKhoaHoc(
        [FromQuery] int? idHs,
        [FromQuery] int? idKhoaHoc,
        [FromQuery] int? idDn,
        [FromQuery] int? soBuoiDaHoc,
        [FromBody] GanHocSinhKhoaHocDto? body)
    {
        var dto = new GanHocSinhKhoaHocDto
        {
            IdHs = idHs ?? body?.IdHs ?? 0,
            IdKhoaHoc = idKhoaHoc ?? body?.IdKhoaHoc ?? 0,
            IdDn = idDn ?? body?.IdDn ?? 1,
            SoBuoiDaHoc = soBuoiDaHoc ?? body?.SoBuoiDaHoc ?? 0
        };

        var res = await _hocSinhService.GanHocSinhVaoKhoaHocAsync(dto);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("khoa-hoc/{idKhoaHoc}/batch")]
    public async Task<IActionResult> GanNhieuHocSinhVaoKhoaHoc(int idKhoaHoc, [FromBody] List<int> dsIdHs)
    {
        var res = await _hocSinhService.GanNhieuHocSinhVaoKhoaHocAsync(idKhoaHoc, dsIdHs);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("khoa-hoc/{idKhoaHoc}/hoc-sinh/{idHs}")]
    public async Task<IActionResult> XoaHocSinhKhoaHoc(int idKhoaHoc, int idHs)
    {
        var res = await _hocSinhService.XoaHocSinhKhoiKhoaHocAsync(idHs, idKhoaHoc);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("khoa-hoc/{idKhoaHoc}/hoc-sinh")]
    public async Task<IActionResult> LayDanhSachHocSinhTheoKhoaHoc(int idKhoaHoc)
    {
        var res = await _hocSinhService.LayDanhSachHocSinhTheoKhoaHocAsync(idKhoaHoc);
        return StatusCode(res.StatusCode, res);
    }
}
