using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Hồ sơ Học sinh 360° (4 Lazy Tabs), Tiếp nhận & Bảo lưu dành cho QUẢN LÝ CƠ SỞ
/// </summary>
[ApiController]
[Route("api/quan-ly/hoc-sinh")]
[Route("api/v1/manager/students")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyHoSoHocSinh360Controller : ControllerBase
{
    private readonly IHocSinhService _hocSinhService;
    private readonly ITaiChinhService _taiChinhService;
    private readonly IDaoTaoService _daoTaoService;
    private readonly QuanLyTrungTamDbContext _context;

    public QuanLyHoSoHocSinh360Controller(
        IHocSinhService hocSinhService,
        ITaiChinhService taiChinhService,
        IDaoTaoService daoTaoService,
        QuanLyTrungTamDbContext context)
    {
        _hocSinhService = hocSinhService;
        _taiChinhService = taiChinhService;
        _daoTaoService = daoTaoService;
        _context = context;
    }

    [HttpGet("{idHs}")]
    public async Task<IActionResult> LayThongTinHocSinh(int idHs)
    {
        var result = await _hocSinhService.TimHocSinhTheoIdAsync(idHs);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    public async Task<IActionResult> TaoHocSinh([FromQuery] int? idDn, [FromBody] HocSinh hs)
    {
        var result = await _hocSinhService.LuuHocSinhAsync(idDn ?? 1, hs);
        return StatusCode(result.StatusCode, result);
    }

    // --- TAB 1: LỚP HỌC & ĐĂNG KÝ ---
    [HttpGet("{idHs}/lop-hoc")]
    public async Task<IActionResult> LayLopHocHocSinh(int idHs)
    {
        var list = await _context.DangKyHocs
            .Include(d => d.LopHoc)
            .Where(d => d.IdHs == idHs && !d.Xoa)
            .AsNoTracking()
            .Select(d => new DangKyHocDto
            {
                IdDangKy = d.IdDangKy,
                IdHs = d.IdHs,
                IdLop = d.IdLop,
                TenLop = d.LopHoc != null ? d.LopHoc.TenLop : "",
                NgayDangKy = d.NgayDangKy,
                TrangThai = d.TrangThaiThanhToan ? "DA_THANH_TOAN" : "CHUA_THANH_TOAN"
            })
            .ToListAsync();

        return Ok(ApiResponse<List<DangKyHocDto>>.Ok(list));
    }

    [HttpPost("enrollments")]
    public async Task<IActionResult> DangKyLopHoc(
        [FromQuery] int idHs,
        [FromQuery] int idLop,
        [FromBody] DangKyHoc? dk)
    {
        var item = new DangKyHoc
        {
            IdHs = idHs,
            IdLop = idLop,
            IdPh = dk?.IdPh,
            NgayDangKy = dk?.NgayDangKy ?? DateOnly.FromDateTime(DateTime.Today),
            HocPhi = dk?.HocPhi ?? 0,
            TrangThaiThanhToan = dk?.TrangThaiThanhToan ?? false,
            Xoa = false,
            IdDn = dk?.IdDn ?? 1
        };
        _context.DangKyHocs.Add(item);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<DangKyHoc>.Ok(item, "Đăng ký vào lớp thành công"));
    }

    [HttpDelete("enrollments/{id}")]
    public async Task<IActionResult> HuyDangKyHoc(int id)
    {
        var item = await _context.DangKyHocs.FirstOrDefaultAsync(d => d.IdDangKy == id && !d.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy đăng ký học", 404));

        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Hủy đăng ký học thành công"));
    }

    // --- TAB 2: LỊCH SỬ ĐIỂM DANH ---
    [HttpGet("{idHs}/diem-danh")]
    public async Task<IActionResult> LayDiemDanhHocSinh(int idHs)
    {
        var list = await _context.DiemDanhHocSinhs
            .Include(d => d.BuoiHoc)
            .Where(d => d.IdHs == idHs && !d.Xoa)
            .OrderByDescending(d => d.IdBuoiHoc)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<DiemDanhHocSinh>>.Ok(list));
    }

    // --- TAB 3: HỌC PHÍ & PHIẾU THU ---
    [HttpGet("{idHs}/hoc-phi")]
    public async Task<IActionResult> LayHocPhiHocSinh(int idHs)
    {
        var result = await _taiChinhService.TimPhieuThuTheoHocSinhAsync(idHs);
        return StatusCode(result.StatusCode, result);
    }

    // --- TAB 4: BẢO LƯU & CHUYỂN LỚP ---
    [HttpGet("{idHs}/bao-luu")]
    public async Task<IActionResult> LayBaoLuuHocSinh(int idHs)
    {
        var list = await _context.BaoLuuKhoaHocs
            .Where(b => b.IdHs == idHs && !b.Xoa)
            .OrderByDescending(b => b.NgayBatDau)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<BaoLuuKhoaHoc>>.Ok(list));
    }

    [HttpPost("deferrals")]
    public async Task<IActionResult> TaoBaoLuu([FromBody] TaoBaoLuuRequest request)
    {
        var res = await _taiChinhService.TaoBaoLuuAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("deferrals/{id}/approve")]
    public async Task<IActionResult> DuyetBaoLuu(int id, [FromBody] DuyetBaoLuuDto? dto)
    {
        bool daDuyet = (dto?.TrangThai == "DA_DUYET" || dto?.TrangThai == "true");
        var res = await _taiChinhService.DuyetBaoLuuAsync(id, new DuyetBaoLuuRequest
        {
            TrangThaiBaoLuu = daDuyet
        });
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("deferrals/{id}/return")]
    public async Task<IActionResult> HoanTraBaoLuu(int id)
    {
        var res = await _taiChinhService.HoanTraBaoLuuAsync(id);
        return StatusCode(res.StatusCode, res);
    }
}
