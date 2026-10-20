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
/// Quản lý Chi nhánh cá nhân, Lớp học, Khóa học và Điểm danh dành cho GIÁO VIÊN
/// </summary>
[ApiController]
[Route("api/giao-vien")]
[Route("api/v1/teacher")]
[Authorize(Roles = "GIAO_VIEN,ROLE_GIAO_VIEN,QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class GiaoVienLopHocController : ControllerBase
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly IDiemDanhService _diemDanhService;

    public GiaoVienLopHocController(QuanLyTrungTamDbContext context, IDiemDanhService diemDanhService)
    {
        _context = context;
        _diemDanhService = diemDanhService;
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

    [HttpGet("chi-nhanh")]
    public async Task<IActionResult> LayChiNhanhCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var cnIds = await _context.GiaoVienChiNhanhs
            .Where(g => g.IdGv == gvId)
            .Select(g => g.IdCn)
            .Distinct()
            .ToListAsync();

        var list = await _context.ChiNhanhs
            .Where(c => cnIds.Contains(c.IdCn))
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<ChiNhanh>>.Ok(list));
    }

    [HttpGet("chi-nhanh/{idCn}")]
    public async Task<IActionResult> LayChiNhanhTheoId(int idCn)
    {
        var cn = await _context.ChiNhanhs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdCn == idCn);

        if (cn == null) return NotFound(ApiResponse<ChiNhanh>.Fail("Không tìm thấy chi nhánh", 404));

        return Ok(ApiResponse<ChiNhanh>.Ok(cn));
    }

    [HttpGet("lop-hoc")]
    [HttpGet("dao-tao/lop-hoc")]
    public async Task<IActionResult> LayDanhSachLopHocCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.LopHocs
            .Include(l => l.ChiNhanh)
            .Include(l => l.MonHoc)
            .Where(l => l.IdGv == gvId && !l.Xoa)
            .AsNoTracking()
            .Select(l => new LopHocDto
            {
                IdLop = l.IdLop,
                TenLop = l.TenLop,
                IdCn = l.IdCn,
                TenChiNhanh = l.ChiNhanh != null ? l.ChiNhanh.TenCn : null,
                IdKh = l.IdKh,
                IdMh = l.IdMh,
                TenMonHoc = l.MonHoc != null ? l.MonHoc.TenMon : null,
                IdGv = l.IdGv,
                TrangThai = l.TrangThai
            })
            .ToListAsync();

        return Ok(ApiResponse<List<LopHocDto>>.Ok(list));
    }

    [HttpGet("lop-hoc/{idLop}")]
    public async Task<IActionResult> LayLopHocTheoId(int idLop)
    {
        var l = await _context.LopHocs
            .Include(x => x.ChiNhanh)
            .Include(x => x.MonHoc)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.IdLop == idLop && !x.Xoa);

        if (l == null) return NotFound(ApiResponse<LopHocDto>.Fail("Không tìm thấy lớp học", 404));

        return Ok(ApiResponse<LopHocDto>.Ok(new LopHocDto
        {
            IdLop = l.IdLop,
            TenLop = l.TenLop,
            IdCn = l.IdCn,
            TenChiNhanh = l.ChiNhanh != null ? l.ChiNhanh.TenCn : null,
            IdKh = l.IdKh,
            IdMh = l.IdMh,
            TenMonHoc = l.MonHoc != null ? l.MonHoc.TenMon : null,
            IdGv = l.IdGv,
            TrangThai = l.TrangThai
        }));
    }

    [HttpGet("khoa-hoc")]
    public async Task<IActionResult> LayDanhSachKhoaHocCuaToi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.KhoaHocs
            .Include(k => k.LopHoc)
            .Where(k => k.LopHoc != null && k.LopHoc.IdGv == gvId && !k.Xoa)
            .AsNoTracking()
            .Select(k => new KhoaHocDto
            {
                IdKhoaHoc = k.IdKhoaHoc,
                TenKhoaHoc = k.TenKhoaHoc,
                IdLop = k.IdLop,
                IdDn = k.IdDn,
                IdBoMon = k.IdBoMon
            })
            .ToListAsync();

        return Ok(ApiResponse<List<KhoaHocDto>>.Ok(list));
    }

    /// <summary>
    /// Lấy thông tin chi tiết một khóa học
    /// </summary>
    [HttpGet("khoa-hoc/{idKhoaHoc}")]
    public async Task<IActionResult> LayKhoaHocTheoId(int idKhoaHoc)
    {
        var k = await _context.KhoaHocs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.Xoa);
        if (k == null) return NotFound(ApiResponse<KhoaHocDto>.Fail("Không tìm thấy khóa học", 404));
        return Ok(ApiResponse<KhoaHocDto>.Ok(new KhoaHocDto
        {
            IdKhoaHoc = k.IdKhoaHoc,
            TenKhoaHoc = k.TenKhoaHoc,
            IdLop = k.IdLop,
            IdDn = k.IdDn,
            IdBoMon = k.IdBoMon
        }));
    }

    [HttpGet("classes/{classId}/students")]
    [HttpGet("lop-hoc/{classId}/hoc-sinh")]
    public async Task<IActionResult> LayHocSinhTheoLop(int classId)
    {
        var list = await _context.DangKyHocs
            .Include(d => d.HocSinh)
            .Where(d => d.IdLop == classId && !d.Xoa)
            .AsNoTracking()
            .Select(d => new DangKyHocDto
            {
                IdDangKy = d.IdDangKy,
                IdHs = d.IdHs,
                TenHs = d.HocSinh != null ? d.HocSinh.HoTen : "",
                IdLop = d.IdLop,
                NgayDangKy = d.NgayDangKy,
                TrangThai = d.TrangThaiThanhToan ? "DA_THANH_TOAN" : "CHUA_THANH_TOAN"
            })
            .ToListAsync();

        return Ok(ApiResponse<List<DangKyHocDto>>.Ok(list));
    }

    [HttpGet("sessions/{sessionId}/attendance")]
    public async Task<IActionResult> LayDiemDanhTheoBuoiHoc(int sessionId)
    {
        var result = await _diemDanhService.LayDiemDanhTheoBuoiHocAsync(sessionId);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("sessions/{sessionId}/attendance")]
    public async Task<IActionResult> DiemDanhHocSinh(int sessionId, [FromQuery] int idHs, [FromBody] DiemDanhHocSinh dd)
    {
        var req = new LuuDiemDanhBuoiHocRequest
        {
            IdBuoiHoc = sessionId,
            IdKhoaHoc = dd.IdKhoaHoc > 0 ? dd.IdKhoaHoc : null,
            DanhSach = new List<DiemDanhHocSinhItemDto>
            {
                new()
                {
                    IdHs = idHs > 0 ? idHs : dd.IdHs,
                    TrangThai = dd.TrangThai ? "CO_MAT" : "VANG"
                }
            }
        };
        var result = await _diemDanhService.LuuDiemDanhHocSinhBatchAsync(req);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("ky-hoc")]
    public async Task<IActionResult> LayTatCaKyHoc()
    {
        var list = await _context.KyHocs
            .Where(k => !k.Xoa)
            .OrderBy(k => k.NgayBatDau)
            .AsNoTracking()
            .Select(k => new KyHocDto
            {
                IdKh = k.IdKh,
                TenKyHoc = k.TenKyHoc,
                NgayBatDau = k.NgayBatDau ?? DateOnly.MinValue,
                NgayKetThuc = k.NgayKetThuc ?? DateOnly.MinValue,
                IdNh = k.IdNh
            })
            .ToListAsync();

        return Ok(ApiResponse<List<KyHocDto>>.Ok(list));
    }

    /// <summary>
    /// Lấy danh sách lớp học theo kỳ học
    /// </summary>
    [HttpGet("ky-hoc/{idKh}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoKyHoc(int idKh)
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.LopHocs
            .Include(l => l.ChiNhanh)
            .Include(l => l.MonHoc)
            .Where(l => l.IdKh == idKh && l.IdGv == gvId && !l.Xoa)
            .AsNoTracking()
            .Select(l => new LopHocDto
            {
                IdLop = l.IdLop,
                TenLop = l.TenLop,
                IdCn = l.IdCn,
                TenChiNhanh = l.ChiNhanh != null ? l.ChiNhanh.TenCn : null,
                IdKh = l.IdKh,
                IdMh = l.IdMh,
                TenMonHoc = l.MonHoc != null ? l.MonHoc.TenMon : null,
                IdGv = l.IdGv,
                TrangThai = l.TrangThai
            })
            .ToListAsync();
        return Ok(ApiResponse<List<LopHocDto>>.Ok(list));
    }

    [HttpPost("buoi-hoc")]
    public async Task<IActionResult> TaoBuoiHoc([FromBody] BuoiHoc buoi)
    {
        buoi.Xoa = false;
        _context.BuoiHocs.Add(buoi);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<BuoiHoc>.Ok(buoi, "Tạo buổi học thành công"));
    }
}
