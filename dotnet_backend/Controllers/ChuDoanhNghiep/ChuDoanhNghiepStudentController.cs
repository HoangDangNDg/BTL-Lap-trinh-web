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
/// Quản lý Học sinh & Phụ huynh dành cho CHỦ DOANH NGHIỆP, ADMIN, QUẢN LÝ
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,QUAN_LY,ROLE_QUAN_LY")]
public class ChuDoanhNghiepStudentController : ControllerBase
{
    private readonly IHocSinhService _hocSinhService;
    private readonly IDaoTaoService _daoTaoService;
    private readonly ITaiChinhService _taiChinhService;
    private readonly QuanLyTrungTamDbContext _context;

    public ChuDoanhNghiepStudentController(
        IHocSinhService hocSinhService,
        IDaoTaoService daoTaoService,
        ITaiChinhService taiChinhService,
        QuanLyTrungTamDbContext context)
    {
        _hocSinhService = hocSinhService;
        _daoTaoService = daoTaoService;
        _taiChinhService = taiChinhService;
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
    // 1. HỌC SINH (STUDENTS)
    // ==========================================

    [HttpGet("doanh-nghiep/hoc-sinh")]
    [HttpGet("hoc-sinh")]
    [HttpGet("v1/owner/students")]
    [HttpGet("v1/hoc-sinh")]
    public async Task<IActionResult> LayDanhSachHocSinh(
        [FromQuery] int? idDn,
        [FromQuery] int? idCn,
        [FromQuery] string? keyword,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 50)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var filter = new HocSinhFilterDto
        {
            IdDn = targetDnId,
            IdCn = idCn,
            Keyword = keyword,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        var res = await _hocSinhService.LayDanhSachHocSinhAsync(filter);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("hoc-sinh/{id}")]
    [HttpGet("v1/hoc-sinh/{id}")]
    [HttpGet("doanh-nghiep/hoc-sinh/{id}")]
    public async Task<IActionResult> LayHocSinhTheoId(int id)
    {
        var res = await _hocSinhService.TimHocSinhTheoIdAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("hoc-sinh")]
    [HttpPost("v1/hoc-sinh")]
    [HttpPost("doanh-nghiep/hoc-sinh")]
    public async Task<IActionResult> TaoHocSinh([FromQuery] int? idDn, [FromBody] HocSinh hs)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _hocSinhService.LuuHocSinhAsync(targetDnId, hs);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("hoc-sinh/{id}")]
    [HttpPut("v1/hoc-sinh/{id}")]
    [HttpPut("doanh-nghiep/hoc-sinh/{id}")]
    public async Task<IActionResult> CapNhatHocSinh(int id, [FromBody] HocSinh hs)
    {
        var res = await _hocSinhService.CapNhatHocSinhAsync(id, hs);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("hoc-sinh/{id}")]
    [HttpDelete("v1/hoc-sinh/{id}")]
    [HttpDelete("doanh-nghiep/hoc-sinh/{id}")]
    public async Task<IActionResult> XoaHocSinh(int id)
    {
        var res = await _hocSinhService.XoaHocSinhAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 2. PHỤ HUYNH (PARENTS)
    // ==========================================

    [HttpGet("phu-huynh")]
    [HttpGet("hoc-sinh/parents")]
    public async Task<IActionResult> LayDanhSachPhuHuynh(
        [FromQuery] int? idDn,
        [FromQuery] string? sdt,
        [FromQuery] string? cccd,
        [FromQuery] int? idHs,
        [FromQuery] string? keyword)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var query = _context.PhuHuynhs.Where(p => !p.Xoa && p.IdDn == targetDnId);

        if (!string.IsNullOrWhiteSpace(sdt)) query = query.Where(p => p.Sdt != null && p.Sdt.Contains(sdt.Trim()));
        if (!string.IsNullOrWhiteSpace(cccd)) query = query.Where(p => p.Cccd != null && p.Cccd.Contains(cccd.Trim()));
        if (!string.IsNullOrWhiteSpace(keyword)) query = query.Where(p => p.HoTen.Contains(keyword.Trim()));

        if (idHs.HasValue)
        {
            var phIds = await _context.PhuHuynhHocSinhs.Where(ph => ph.IdHs == idHs.Value).Select(ph => ph.IdPh).ToListAsync();
            query = query.Where(p => phIds.Contains(p.IdPh));
        }

        var list = await query.AsNoTracking().ToListAsync();
        return Ok(ApiResponse<List<PhuHuynh>>.Ok(list));
    }

    [HttpGet("phu-huynh/{id}")]
    [HttpGet("hoc-sinh/parents/{id}")]
    public async Task<IActionResult> LayPhuHuynhTheoId(int id)
    {
        var ph = await _context.PhuHuynhs.AsNoTracking().FirstOrDefaultAsync(p => p.IdPh == id && !p.Xoa);
        if (ph == null) return NotFound(ApiResponse<PhuHuynh>.Fail("Không tìm thấy phụ huynh", 404));
        return Ok(ApiResponse<PhuHuynh>.Ok(ph));
    }

    [HttpPost("phu-huynh")]
    [HttpPost("hoc-sinh/parents")]
    public async Task<IActionResult> TaoPhuHuynh([FromQuery] int? idDn, [FromBody] PhuHuynh ph)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        if (!string.IsNullOrWhiteSpace(ph.Cccd))
        {
            var cleanCccd = ph.Cccd.Trim();
            bool cccdExisted = await _context.PhuHuynhs.AnyAsync(p => p.Cccd == cleanCccd && !p.Xoa);
            if (cccdExisted)
            {
                return Conflict(ApiResponse<PhuHuynh>.Fail($"Số CCCD '{cleanCccd}' đã tồn tại cho một phụ huynh khác", 409));
            }
            ph.Cccd = cleanCccd;
        }

        ph.IdDn = targetDnId;
        ph.Xoa = false;
        _context.PhuHuynhs.Add(ph);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<PhuHuynh>.Ok(ph, "Tạo thông tin phụ huynh thành công"));
    }

    [HttpPut("phu-huynh/{id}")]
    [HttpPut("hoc-sinh/parents/{id}")]
    public async Task<IActionResult> CapNhatPhuHuynh(int id, [FromBody] PhuHuynh ph)
    {
        var item = await _context.PhuHuynhs.FirstOrDefaultAsync(p => p.IdPh == id && !p.Xoa);
        if (item == null) return NotFound(ApiResponse<PhuHuynh>.Fail("Không tìm thấy phụ huynh", 404));

        if (!string.IsNullOrWhiteSpace(ph.Cccd))
        {
            var cleanCccd = ph.Cccd.Trim();
            bool cccdExisted = await _context.PhuHuynhs.AnyAsync(p => p.IdPh != id && p.Cccd == cleanCccd && !p.Xoa);
            if (cccdExisted)
            {
                return Conflict(ApiResponse<PhuHuynh>.Fail($"Số CCCD '{cleanCccd}' đã được sử dụng bởi phụ huynh khác", 409));
            }
            item.Cccd = cleanCccd;
        }

        if (!string.IsNullOrWhiteSpace(ph.HoTen)) item.HoTen = ph.HoTen.Trim();
        if (ph.Sdt != null) item.Sdt = ph.Sdt.Trim();
        if (ph.Email != null) item.Email = ph.Email.Trim();

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<PhuHuynh>.Ok(item, "Cập nhật phụ huynh thành công"));
    }

    [HttpDelete("phu-huynh/{id}")]
    [HttpDelete("hoc-sinh/parents/{id}")]
    public async Task<IActionResult> XoaPhuHuynh(int id)
    {
        var item = await _context.PhuHuynhs.FirstOrDefaultAsync(p => p.IdPh == id && !p.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy phụ huynh", 404));

        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa phụ huynh thành công"));
    }

    // ==========================================
    // 3. QUAN HỆ ĐA PHỤ HUYNH - HỌC SINH
    // ==========================================

    [HttpGet("hoc-sinh/{idHs}/phu-huynh")]
    [HttpGet("hoc-sinh/{idHs}/phu-huynh-bang-phu")]
    public async Task<IActionResult> LayPhuHuynhTheoHocSinh(int idHs)
    {
        var res = await _hocSinhService.LayDanhSachPhuHuynhTheoHocSinhAsync(idHs);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("phu-huynh/{idPh}/hoc-sinh")]
    [HttpGet("phu-huynh/{idPh}/hoc-sinh-bang-phu")]
    public async Task<IActionResult> LayHocSinhTheoPhuHuynh(int idPh)
    {
        var res = await _hocSinhService.LayDanhSachHocSinhTheoPhuHuynhAsync(idPh);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("hoc-sinh/gan-phu-huynh")]
    [HttpPost("phu-huynh-hoc-sinh")]
    public async Task<IActionResult> GanPhuHuynhVaoHocSinh([FromBody] GanPhuHuynhRequest request)
    {
        var res = await _hocSinhService.GanPhuHuynhVaoHocSinhAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("hoc-sinh/{idHs}/phu-huynh/{idPh}")]
    public async Task<IActionResult> XoaQuanHePhuHuynhHocSinh(int idHs, int idPh)
    {
        var res = await _hocSinhService.XoaQuanHePhuHuynhHocSinhAsync(idHs, idPh);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("phu-huynh-hoc-sinh/{idPhHs}")]
    public async Task<IActionResult> XoaQuanHePhuHuynhHocSinhById(int idPhHs)
    {
        var res = await _hocSinhService.XoaQuanHePhuHuynhHocSinhByIdAsync(idPhHs);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("hoc-sinh/{idHs}/tao-phu-huynh")]
    [HttpPost("hoc-sinh/{idHs}/phu-huynh")]
    public async Task<IActionResult> TaoMoiPhuHuynhChoHocSinh(int idHs, [FromBody] TaoPhuHuynhChoHocSinhRequest request)
    {
        var res = await _hocSinhService.TaoMoiPhuHuynhChoHocSinhAsync(idHs, request);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 4. TRA CỨU SĐT / CCCD
    // ==========================================

    [HttpGet("hoc-sinh/tim-sdt")]
    public async Task<IActionResult> TimHocSinhTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _hocSinhService.TimHocSinhTheoSdtAsync(sdt, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("hoc-sinh/tim-cccd")]
    public async Task<IActionResult> TimHocSinhTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _hocSinhService.TimHocSinhTheoCccdAsync(cccd, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("phu-huynh/tim-sdt")]
    public async Task<IActionResult> TimPhuHuynhTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _hocSinhService.TimPhuHuynhTheoSdtAsync(sdt, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("phu-huynh/tim-cccd")]
    public async Task<IActionResult> TimPhuHuynhTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _hocSinhService.TimPhuHuynhTheoCccdAsync(cccd, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 5. ĐĂNG KÝ HỌC, BẢO LƯU & KHÓA HỌC
    // ==========================================

    /// <summary>
    /// Lấy danh sách đăng ký học theo lớp
    /// </summary>
    [HttpGet("dang-ky-hoc/lop-hoc/{idLop}")]
    [HttpGet("lop-hoc/{idLop}/dang-ky-hoc")]
    public async Task<IActionResult> LayDangKyHocTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayDanhSachDangKyTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách đăng ký học theo học sinh
    /// </summary>
    [HttpGet("dang-ky-hoc/hoc-sinh/{idHs}")]
    [HttpGet("hoc-sinh/{idHs}/dang-ky-hoc")]
    public async Task<IActionResult> LayDangKyHocTheoHocSinh(int idHs)
    {
        var res = await _daoTaoService.LayDanhSachDangKyTheoHocSinhAsync(idHs);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Đăng ký học sinh vào lớp học
    /// </summary>
    [HttpPost("dang-ky-hoc")]
    [HttpPost("hoc-sinh/enrollments")]
    public async Task<IActionResult> DangKyLopHoc([FromBody] Dictionary<string, int?> req)
    {
        int idHs = req.TryGetValue("idHs", out var vHs) && vHs.HasValue ? vHs.Value : 0;
        int idLop = req.TryGetValue("idLop", out var vLop) && vLop.HasValue ? vLop.Value : 0;
        int? idPh = req.TryGetValue("idPh", out var vPh) ? vPh : null;

        if (idHs <= 0 || idLop <= 0) return BadRequest(ApiResponse<DangKyHoc>.Fail("idHs và idLop không được để trống", 400));

        var res = await _daoTaoService.DangKyHocAsync(idHs, idLop, idPh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Hủy đăng ký học
    /// </summary>
    [HttpDelete("dang-ky-hoc/{id}")]
    [HttpDelete("hoc-sinh/enrollments/{id}")]
    public async Task<IActionResult> HuyDangKyHoc(int id)
    {
        var res = await _daoTaoService.XoaDangKyHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách bảo lưu khóa học
    /// </summary>
    [HttpGet("hoc-sinh/deferrals")]
    [HttpGet("student/deferrals")]
    public async Task<IActionResult> LayDanhSachBaoLuu([FromQuery] int? idDn)
    {
        int targetDn = ResolveTargetDnId(idDn);
        var res = await _taiChinhService.TimBaoLuuTheoDoanhNghiepAsync(targetDn);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách bảo lưu theo học sinh
    /// </summary>
    [HttpGet("hoc-sinh/{idHs}/deferrals")]
    public async Task<IActionResult> LayBaoLuuTheoHocSinh(int idHs)
    {
        var res = await _taiChinhService.TimBaoLuuTheoHocSinhAsync(idHs);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Hoàn trả bảo lưu học sinh
    /// </summary>
    [HttpPut("hoc-sinh/deferrals/{id}/return")]
    [HttpPut("student/deferrals/{id}/return")]
    [HttpPut("bao-luu/{id}/hoan-tra")]
    public async Task<IActionResult> HoanTraBaoLuu(int id)
    {
        var res = await _taiChinhService.HoanTraBaoLuuAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách học sinh theo khóa học
    /// </summary>
    [HttpGet("hoc-sinh/khoa-hoc/{idKhoaHoc}")]
    [HttpGet("khoa-hoc/{idKhoaHoc}/hoc-sinh")]
    public async Task<IActionResult> LayDanhSachHocSinhTheoKhoaHoc(int idKhoaHoc)
    {
        var res = await _hocSinhService.LayDanhSachHocSinhTheoKhoaHocAsync(idKhoaHoc);
        return StatusCode(res.StatusCode, res);
    }
}

