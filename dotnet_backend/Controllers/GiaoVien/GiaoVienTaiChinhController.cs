using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace dotnet_backend.Controllers.GiaoVien;

/// <summary>
/// Lịch sử công dạy & Lịch sử nhận lương dành cho GIÁO VIÊN (Read-Only)
/// </summary>
[ApiController]
[Route("api/giao-vien/tai-chinh")]
[Route("api/v1/teacher")]
[Authorize(Roles = "GIAO_VIEN,ROLE_GIAO_VIEN,QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class GiaoVienTaiChinhController : ControllerBase
{
    private readonly IDiemDanhService _diemDanhService;
    private readonly QuanLyTrungTamDbContext _context;

    public GiaoVienTaiChinhController(IDiemDanhService diemDanhService, QuanLyTrungTamDbContext context)
    {
        _diemDanhService = diemDanhService;
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

    [HttpGet("attendance-history")]
    [HttpGet("cong-day")]
    public async Task<IActionResult> LayLichSuDiemDanhCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.DiemDanhGiaoViens
            .Where(d => d.IdGv == gvId && !d.Xoa)
            .Include(d => d.BuoiHoc)
            .OrderByDescending(d => d.IdBuoiHoc)
            .AsNoTracking()
            .ToListAsync();
        return Ok(ApiResponse<List<DiemDanhGiaoVien>>.Ok(list));
    }

    [HttpGet("payrolls")]
    [HttpGet("bang-luong")]
    public async Task<IActionResult> LayBangLuongCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.ThanhToanGiaoViens
            .Where(t => t.IdGv == gvId && !t.Xoa)
            .OrderByDescending(t => t.NgayThanhToan)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<ThanhToanGiaoVien>>.Ok(list));
    }

    [HttpGet("khoa-hoc")]
    [HttpGet("course-salaries")]
    public async Task<IActionResult> LayThanhToanLuongKhoaHocCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.ThanhToanGiaoVienKhoaHocs
            .Where(t => t.IdGv == gvId && !t.Xoa)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<ThanhToanGiaoVienKhoaHoc>>.Ok(list));
    }

    [HttpGet("khoa-hoc/{idKhoaHoc}")]
    [HttpGet("course-salaries/{idKhoaHoc}")]
    public async Task<IActionResult> LayThanhToanLuongTheoKhoaHoc(int idKhoaHoc)
    {
        int gvId = LayIdGiaoVienHienTai();
        var item = await _context.ThanhToanGiaoVienKhoaHocs
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.IdGv == gvId && t.IdKhoaHoc == idKhoaHoc && !t.Xoa);

        if (item == null) return NotFound(ApiResponse<ThanhToanGiaoVienKhoaHoc>.Fail("Không tìm thấy thông tin lương khóa học", 404));

        return Ok(ApiResponse<ThanhToanGiaoVienKhoaHoc>.Ok(item));
    }
}
