using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace dotnet_backend.Controllers.GiaoVien;

/// <summary>
/// Lịch dạy, Thời khóa biểu dành cho GIÁO VIÊN
/// </summary>
[ApiController]
[Route("api/giao-vien/thoi-khoa-bieu")]
[Route("api/v1/teacher/schedules")]
[Authorize(Roles = "GIAO_VIEN,ROLE_GIAO_VIEN,QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class GiaoVienThoiKhoaBieuController : ControllerBase
{
    private readonly IDaoTaoService _daoTaoService;
    private readonly QuanLyTrungTamDbContext _context;

    public GiaoVienThoiKhoaBieuController(IDaoTaoService daoTaoService, QuanLyTrungTamDbContext context)
    {
        _daoTaoService = daoTaoService;
        _context = context;
    }

    private int LayIdGiaoVienHienTai()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claim, out int idTk))
        {
            var tkGv = _context.TaiKhoanGvs.FirstOrDefault(t => t.IdTk == idTk);
            if (tkGv?.IdGv != null) return tkGv.IdGv.Value;
        }
        return 1;
    }

    [HttpGet]
    [HttpGet("classes")]
    public async Task<IActionResult> LayLichDayCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var res = await _daoTaoService.LayDanhSachLopHocAsync(null, null, null, gvId, null, 1, 100);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("tuan-hoc")]
    public async Task<IActionResult> LayDanhSachTuanHoc()
    {
        var list = await _context.TuanHocs
            .Where(t => !t.Xoa)
            .OrderBy(t => t.SoTuan)
            .AsNoTracking()
            .Select(t => new TuanHocDto
            {
                IdTh = t.IdTh,
                TenTuan = t.MoTa ?? $"Tuần {t.SoTuan}",
                SoThuTuTuan = t.SoTuan,
                NgayBatDau = t.NgayBatDau ?? DateOnly.MinValue,
                NgayKetThuc = t.NgayKetThuc ?? DateOnly.MinValue,
                IdKh = t.IdKh
            })
            .ToListAsync();

        return Ok(ApiResponse<List<TuanHocDto>>.Ok(list));
    }

    [HttpGet("phong-hoc")]
    public async Task<IActionResult> LayDanhSachPhongHoc([FromQuery] int? idCn)
    {
        var query = _context.PhongHocs.Where(p => !p.Xoa);
        if (idCn.HasValue) query = query.Where(p => p.IdCn == idCn.Value);

        var list = await query
            .AsNoTracking()
            .Select(p => new PhongHocDto
            {
                IdPhong = p.IdPhong,
                TenPhong = p.TenPhong,
                SucChua = p.SucChua ?? 30,
                IdCn = p.IdCn
            })
            .ToListAsync();

        return Ok(ApiResponse<List<PhongHocDto>>.Ok(list));
    }

    [HttpGet("lop-hoc")]
    public async Task<IActionResult> LayDanhSachLopHoc()
    {
        return await LayLichDayCuaToi();
    }

    [HttpGet("tuan/{idTh}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoTuan(int idTh)
    {
        int gvId = LayIdGiaoVienHienTai();
        var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoGiaoVienAsync(gvId, idTh);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost]
    public async Task<IActionResult> LuuThoiKhoaBieu([FromBody] ThoiKhoaBieuTuan tkb)
    {
        var res = await _daoTaoService.LuuThoiKhoaBieuTuanAsync(tkb);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> XoaThoiKhoaBieu(int id)
    {
        var res = await _daoTaoService.XoaThoiKhoaBieuTuanAsync(id);
        return StatusCode(res.StatusCode, res);
    }
}
