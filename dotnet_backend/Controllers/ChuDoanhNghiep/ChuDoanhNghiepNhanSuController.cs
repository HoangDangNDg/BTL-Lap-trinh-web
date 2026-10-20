using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyEntity = dotnet_backend.Entities.QuanLy;

namespace dotnet_backend.Controllers.ChuDoanhNghiep;

/// <summary>
/// Quản lý Nhân sự, Giáo viên & Quản lý cơ sở dành cho CHỦ DOANH NGHIỆP, ADMIN, QUẢN LÝ
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,QUAN_LY,ROLE_QUAN_LY")]
public class ChuDoanhNghiepNhanSuController : ControllerBase
{
    private readonly INhanSuService _nhanSuService;
    private readonly IDoanhNghiepService _doanhNghiepService;
    private readonly ICoSoVatChatService _coSoVatChatService;
    private readonly QuanLyTrungTamDbContext _context;

    public ChuDoanhNghiepNhanSuController(
        INhanSuService nhanSuService,
        IDoanhNghiepService doanhNghiepService,
        ICoSoVatChatService coSoVatChatService,
        QuanLyTrungTamDbContext context)
    {
        _nhanSuService = nhanSuService;
        _doanhNghiepService = doanhNghiepService;
        _coSoVatChatService = coSoVatChatService;
        _context = context;
    }

    private int ResolveTargetDnId(int? requestedIdDn, int? enterpriseId)
    {
        if (User.IsInRole("ADMIN") || User.IsInRole("ROLE_ADMIN"))
        {
            if (requestedIdDn.HasValue && requestedIdDn.Value > 0) return requestedIdDn.Value;
            if (enterpriseId.HasValue && enterpriseId.Value > 0) return enterpriseId.Value;
        }

        var claimDn = User.FindFirst("IdDn")?.Value;
        if (int.TryParse(claimDn, out int idDn) && idDn > 0) return idDn;

        return requestedIdDn ?? enterpriseId ?? 1;
    }

    // ==========================================
    // 1. GIÁO VIÊN (TEACHERS)
    // ==========================================

    [HttpGet("doanh-nghiep/nhan-su/teachers")]
    [HttpGet("doanh-nghiep/giao-vien")]
    [HttpGet("giao-vien")]
    [HttpGet("v1/owner/personnel/teachers")]
    public async Task<IActionResult> LayDanhSachGiaoVien(
        [FromQuery] int? idDn,
        [FromQuery] int? enterpriseId,
        [FromQuery] int? idCn,
        [FromQuery] int? idCm,
        [FromQuery] string? keyword,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 50)
    {
        int targetDnId = ResolveTargetDnId(idDn, enterpriseId);
        var res = await _nhanSuService.LayDanhSachGiaoVienAsync(targetDnId, idCn, idCm, keyword, pageIndex, pageSize);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("doanh-nghiep/{idDn}/giao-vien")]
    public async Task<IActionResult> LayGiaoVienTheoDoanhNghiep(int idDn)
    {
        var res = await _nhanSuService.LayDanhSachGiaoVienAsync(idDn, null, null, null, 1, 100);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("admin/giao-vien")]
    public async Task<IActionResult> LayTatCaGiaoVienAdmin()
    {
        var res = await _nhanSuService.LayDanhSachGiaoVienAsync(null, null, null, null, 1, 500);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("doanh-nghiep/nhan-su/teachers/{id}")]
    [HttpGet("giao-vien/{id}")]
    public async Task<IActionResult> LayGiaoVienTheoId(int id)
    {
        var res = await _nhanSuService.TimGiaoVienTheoIdAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/nhan-su/teachers")]
    [HttpPost("doanh-nghiep/giao-vien")]
    [HttpPost("giao-vien")]
    [HttpPost("v1/owner/personnel/teachers")]
    public async Task<IActionResult> TaoGiaoVien(
        [FromQuery] int? idDn,
        [FromQuery] int? enterpriseId,
        [FromBody] TaoGiaoVienRequest request)
    {
        int targetDnId = ResolveTargetDnId(idDn, enterpriseId);
        var res = await _nhanSuService.LuuGiaoVienAsync(targetDnId, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/{idDn}/giao-vien")]
    public async Task<IActionResult> TaoGiaoVienPath(int idDn, [FromBody] TaoGiaoVienRequest request)
    {
        var res = await _nhanSuService.LuuGiaoVienAsync(idDn, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/nhan-su/teachers/bulk")]
    [HttpPost("doanh-nghiep/giao-vien/hang-loat")]
    public async Task<IActionResult> TaoDanhSachGiaoVien(
        [FromQuery] int? idDn,
        [FromQuery] int? enterpriseId,
        [FromBody] List<GiaoVienBulkDto> danhSach)
    {
        int targetDnId = ResolveTargetDnId(idDn, enterpriseId);
        var res = await _nhanSuService.LuuGiaoVienHangLoatAsync(targetDnId, danhSach);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("doanh-nghiep/{idDn}/giao-vien/hang-loat")]
    public async Task<IActionResult> TaoDanhSachGiaoVienPath(
        int idDn,
        [FromBody] List<GiaoVienBulkDto> danhSach)
    {
        var res = await _nhanSuService.LuuGiaoVienHangLoatAsync(idDn, danhSach);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("giao-vien/{id}")]
    [HttpPut("doanh-nghiep/giao-vien/{id}")]
    public async Task<IActionResult> CapNhatGiaoVien(int id, [FromBody] CapNhatGiaoVienRequest request)
    {
        var res = await _nhanSuService.CapNhatGiaoVienAsync(id, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("giao-vien/{id}")]
    [HttpDelete("doanh-nghiep/giao-vien/{id}")]
    public async Task<IActionResult> XoaGiaoVien(int id)
    {
        var res = await _nhanSuService.XoaGiaoVienAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 2. QUẢN LÝ CƠ SỞ (BRANCH MANAGERS)
    // ==========================================

    [HttpGet("quan-ly")]
    public async Task<IActionResult> LayDanhSachQuanLy([FromQuery] int? idCn)
    {
        var list = await _context.QuanLys
            .Include(q => q.ChiNhanh)
            .Where(q => !q.Xoa && (!idCn.HasValue || q.IdCn == idCn.Value))
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<QuanLyEntity>>.Ok(list));
    }

    [HttpGet("quan-ly/{id}")]
    public async Task<IActionResult> LayQuanLyTheoId(int id)
    {
        var ql = await _context.QuanLys
            .Include(q => q.ChiNhanh)
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.IdQly == id && !q.Xoa);

        if (ql == null) return NotFound(ApiResponse<QuanLyEntity>.Fail("Không tìm thấy quản lý", 404));
        return Ok(ApiResponse<QuanLyEntity>.Ok(ql));
    }

    [HttpPost("quan-ly")]
    public async Task<IActionResult> TaoQuanLy([FromBody] TaoQuanLyRequest request)
    {
        var res = await _doanhNghiepService.TaoQuanLyChiNhanhAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("quan-ly/{id}")]
    public async Task<IActionResult> CapNhatQuanLy(int id, [FromBody] QuanLyEntity ql)
    {
        var item = await _context.QuanLys.FirstOrDefaultAsync(q => q.IdQly == id && !q.Xoa);
        if (item == null) return NotFound(ApiResponse<QuanLyEntity>.Fail("Không tìm thấy quản lý", 404));

        if (!string.IsNullOrWhiteSpace(ql.HoTen)) item.HoTen = ql.HoTen.Trim();
        if (ql.Sdt != null) item.Sdt = ql.Sdt.Trim();
        if (ql.Email != null) item.Email = ql.Email.Trim();
        if (ql.Cccd != null) item.Cccd = ql.Cccd.Trim();
        if (ql.IdCn > 0) item.IdCn = ql.IdCn;
        if (ql.MucLuong.HasValue) item.MucLuong = ql.MucLuong;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<QuanLyEntity>.Ok(item, "Cập nhật thông tin quản lý thành công"));
    }

    [HttpDelete("quan-ly/{id}")]
    public async Task<IActionResult> XoaQuanLy(int id)
    {
        var res = await _doanhNghiepService.XoaQuanLyAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 3. NHÂN CÔNG KHÁC (OTHER STAFF)
    // ==========================================

    [HttpGet("nhan-cong")]
    [HttpGet("doanh-nghiep/{idDn}/nhan-cong")]
    public async Task<IActionResult> LayDanhSachNhanCong(int? idDn, [FromQuery] int? enterpriseId)
    {
        int targetDnId = ResolveTargetDnId(idDn, enterpriseId);
        var res = await _nhanSuService.TimNhanCongTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("chi-nhanh/{idCn}/nhan-cong")]
    public async Task<IActionResult> LayDanhSachNhanCongTheoChiNhanh(int idCn)
    {
        var res = await _nhanSuService.TimNhanCongTheoChiNhanhAsync(idCn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("nhan-cong")]
    public async Task<IActionResult> TaoMoiNhanCong([FromBody] TaoNhanCongRequest request)
    {
        request.IdDn = ResolveTargetDnId(request.IdDn, null);
        var res = await _nhanSuService.LuuNhanCongAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("nhan-cong/{id}")]
    public async Task<IActionResult> CapNhatNhanCong(int id, [FromBody] TaoNhanCongRequest request)
    {
        request.IdDn = ResolveTargetDnId(request.IdDn, null);
        var res = await _nhanSuService.CapNhatNhanCongAsync(id, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("nhan-cong/{id}")]
    public async Task<IActionResult> XoaNhanCong(int id)
    {
        var res = await _nhanSuService.XoaNhanCongAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 4. CHỨNG CHỈ & HỒ SƠ CHI TIẾT GIÁO VIÊN
    // ==========================================

    [HttpGet("giao-vien/{idGv}/chung-chi")]
    public async Task<IActionResult> LayChungChiTheoGiaoVien(int idGv)
    {
        var res = await _nhanSuService.TimChungChiTheoGiaoVienAsync(idGv);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("giao-vien/{idGv}/chung-chi")]
    public async Task<IActionResult> ThemChungChiGiaoVien(int idGv, [FromBody] ChungChiRequestDto request)
    {
        var res = await _nhanSuService.ThemChungChiGiaoVienAsync(idGv, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("chung-chi/{id}")]
    public async Task<IActionResult> XoaChungChiGiaoVien(int id)
    {
        var res = await _nhanSuService.XoaChungChiGiaoVienAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("giao-vien/{idGv}/chi-tiet")]
    public async Task<IActionResult> LayChiTietGiaoVien(int idGv)
    {
        var res = await _nhanSuService.TimChiTietGvAsync(idGv);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("giao-vien/{idGv}/chi-tiet")]
    public async Task<IActionResult> LuuChiTietGiaoVien(int idGv, [FromBody] ChiTietGiaoVienDto request)
    {
        var res = await _nhanSuService.LuuChiTietGvAsync(idGv, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("giao-vien/{idGv}/ho-so")]
    public async Task<IActionResult> LayHoSoCaNhanGiaoVien(int idGv)
    {
        var res = await _nhanSuService.LayHoSoCaNhanGiaoVienAsync(idGv);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 5. CẤP TÀI KHOẢN GIÁO VIÊN
    // ==========================================

    [HttpPost("giao-vien/{idGv}/tai-khoan")]
    public async Task<IActionResult> TaoTaiKhoanChoGiaoVien(int idGv, [FromBody] TaoTaiKhoanGvRequest request)
    {
        var res = await _nhanSuService.TaoTaiKhoanChoGiaoVienAsync(idGv, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("giao-vien/{idGv}/tai-khoan")]
    public async Task<IActionResult> TimTaiKhoanGiaoVien(int idGv)
    {
        var res = await _nhanSuService.TimTaiKhoanCuaGiaoVienAsync(idGv);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 6. TÌM KIẾM THEO SĐT / CCCD
    // ==========================================

    [HttpGet("giao-vien/tim-sdt")]
    public async Task<IActionResult> TimGiaoVienTheoSdt([FromQuery] string sdt, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn, null);
        var res = await _nhanSuService.TimGiaoVienTheoSdtAsync(sdt, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("giao-vien/tim-cccd")]
    public async Task<IActionResult> TimGiaoVienTheoCccd([FromQuery] string cccd, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn, null);
        var res = await _nhanSuService.TimGiaoVienTheoCccdAsync(cccd, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 7. QUẢN LÝ CHUYÊN MÔN & CHI NHÁNH CỦA GIÁO VIÊN
    // ==========================================

    /// <summary>
    /// Xóa thông tin chi tiết giáo viên
    /// </summary>
    [HttpDelete("giao-vien/{idGv}/chi-tiet")]
    public async Task<IActionResult> XoaChiTietGiaoVien(int idGv)
    {
        var item = await _context.ChiTietGvs.FirstOrDefaultAsync(c => c.IdGv == idGv && !c.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy chi tiết giáo viên", 404));
        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa chi tiết giáo viên thành công"));
    }

    /// <summary>
    /// Lấy danh sách chuyên môn của giáo viên
    /// </summary>
    [HttpGet("giao-vien/{idGv}/chuyen-mon")]
    public async Task<IActionResult> LayChuyenMonTheoGiaoVien(int idGv)
    {
        var list = await _context.GiaoVienChuyenMons
            .Include(g => g.ChuyenMon)
            .Where(g => g.IdGv == idGv && !g.Xoa && g.ChuyenMon != null)
            .Select(g => g.ChuyenMon!)
            .ToListAsync();
        return Ok(ApiResponse<List<ChuyenMon>>.Ok(list));
    }

    /// <summary>
    /// Lấy danh sách giáo viên theo chuyên môn
    /// </summary>
    [HttpGet("chuyen-mon/{idCm}/giao-vien")]
    public async Task<IActionResult> LayGiaoVienTheoChuyenMon(int idCm)
    {
        var list = await _context.GiaoVienChuyenMons
            .Include(g => g.GiaoVien)
            .Where(g => g.IdChuyenMon == idCm && !g.Xoa && g.GiaoVien != null)
            .Select(g => g.GiaoVien!)
            .ToListAsync();
        return Ok(ApiResponse<List<dotnet_backend.Entities.GiaoVien>>.Ok(list));
    }

    /// <summary>
    /// Gán chuyên môn cho giáo viên
    /// </summary>
    [HttpPost("giao-vien/{idGv}/chuyen-mon/{idCm}")]
    public async Task<IActionResult> GanChuyenMonChoGiaoVien(int idGv, int idCm)
    {
        var gv = await _context.GiaoViens.FirstOrDefaultAsync(g => g.IdGv == idGv && !g.Xoa);
        if (gv == null) return NotFound(ApiResponse<GiaoVienChuyenMon>.Fail("Không tìm thấy giáo viên", 404));

        var existing = await _context.GiaoVienChuyenMons.FirstOrDefaultAsync(g => g.IdGv == idGv && g.IdChuyenMon == idCm && !g.Xoa);
        if (existing != null) return Ok(ApiResponse<GiaoVienChuyenMon>.Ok(existing, "Đã gán chuyên môn này trước đó"));

        var gvCm = new GiaoVienChuyenMon
        {
            IdGv = idGv,
            IdChuyenMon = idCm,
            Xoa = false
        };
        _context.GiaoVienChuyenMons.Add(gvCm);
        await _context.SaveChangesAsync();
        return StatusCode(201, ApiResponse<GiaoVienChuyenMon>.Created(gvCm, "Gán chuyên môn thành công"));
    }

    /// <summary>
    /// Xóa chuyên môn của giáo viên
    /// </summary>
    [HttpDelete("giao-vien-chuyen-mon/{idGvCm}")]
    public async Task<IActionResult> XoaGiaoVienChuyenMon(int idGvCm)
    {
        var item = await _context.GiaoVienChuyenMons.FirstOrDefaultAsync(g => g.IdGvChuyenMon == idGvCm && !g.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy bản ghi chuyên môn", 404));
        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa chuyên môn của giáo viên thành công"));
    }

    /// <summary>
    /// Lấy danh sách chi nhánh của giáo viên
    /// </summary>
    [HttpGet("giao-vien/{idGv}/chi-nhanh")]
    public async Task<IActionResult> LayChiNhanhTheoGiaoVien(int idGv)
    {
        var list = await _context.GiaoVienChiNhanhs
            .Include(g => g.ChiNhanh)
            .Where(g => g.IdGv == idGv && !g.Xoa && g.ChiNhanh != null)
            .Select(g => g.ChiNhanh!)
            .ToListAsync();
        return Ok(ApiResponse<List<ChiNhanh>>.Ok(list));
    }

    /// <summary>
    /// Lấy danh sách giáo viên theo chi nhánh
    /// </summary>
    [HttpGet("chi-nhanh/{idCn}/giao-vien")]
    public async Task<IActionResult> LayGiaoVienTheoChiNhanh(int idCn)
    {
        var list = await _context.GiaoVienChiNhanhs
            .Include(g => g.GiaoVien)
            .Where(g => g.IdCn == idCn && !g.Xoa && g.GiaoVien != null)
            .Select(g => g.GiaoVien!)
            .ToListAsync();
        return Ok(ApiResponse<List<dotnet_backend.Entities.GiaoVien>>.Ok(list));
    }

    /// <summary>
    /// Gán chi nhánh cho giáo viên
    /// </summary>
    [HttpPost("giao-vien/{idGv}/chi-nhanh/{idCn}")]
    public async Task<IActionResult> GanChiNhanhChoGiaoVien(int idGv, int idCn)
    {
        var gv = await _context.GiaoViens.FirstOrDefaultAsync(g => g.IdGv == idGv && !g.Xoa);
        if (gv == null) return NotFound(ApiResponse<GiaoVienChiNhanh>.Fail("Không tìm thấy giáo viên", 404));

        var existing = await _context.GiaoVienChiNhanhs.FirstOrDefaultAsync(g => g.IdGv == idGv && g.IdCn == idCn && !g.Xoa);
        if (existing != null) return Ok(ApiResponse<GiaoVienChiNhanh>.Ok(existing, "Đã gán chi nhánh này trước đó"));

        var gvCn = new GiaoVienChiNhanh
        {
            IdGv = idGv,
            IdCn = idCn,
            Xoa = false
        };
        _context.GiaoVienChiNhanhs.Add(gvCn);
        await _context.SaveChangesAsync();
        return StatusCode(201, ApiResponse<GiaoVienChiNhanh>.Created(gvCn, "Gán chi nhánh thành công"));
    }

    /// <summary>
    /// Xóa phân bổ chi nhánh của giáo viên
    /// </summary>
    [HttpDelete("giao-vien-chi-nhanh/{idGvChiNhanh}")]
    public async Task<IActionResult> XoaGiaoVienChiNhanh(int idGvChiNhanh)
    {
        var item = await _context.GiaoVienChiNhanhs.FirstOrDefaultAsync(g => g.IdGvChiNhanh == idGvChiNhanh && !g.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy bản ghi chi nhánh", 404));
        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa phân bổ chi nhánh thành công"));
    }

    /// <summary>
    /// Lấy danh sách quản lý theo doanh nghiệp
    /// </summary>
    [HttpGet("doanh-nghiep/{idDn}/quan-ly")]
    public async Task<IActionResult> LayQuanLyTheoDoanhNghiep(int idDn)
    {
        var list = await _context.QuanLys
            .Where(q => q.IdDn == idDn && !q.Xoa)
            .AsNoTracking()
            .ToListAsync();
        return Ok(ApiResponse<List<dotnet_backend.Entities.QuanLy>>.Ok(list));
    }

    /// <summary>
    /// Lấy danh sách quản lý theo chi nhánh
    /// </summary>
    [HttpGet("chi-nhanh/{idCn}/quan-ly")]
    public async Task<IActionResult> LayQuanLyTheoChiNhanh(int idCn)
    {
        var res = await _doanhNghiepService.LayQuanLyTheoChiNhanhAsync(idCn);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới quản lý chi nhánh
    /// </summary>
    [HttpPost("chi-nhanh/{idCn}/quan-ly")]
    public async Task<IActionResult> TaoQuanLyChiNhanh(int idCn, [FromBody] TaoQuanLyRequest req)
    {
        req.IdCn = idCn;
        var res = await _doanhNghiepService.TaoQuanLyChiNhanhAsync(req);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới nhân viên khác theo chi nhánh
    /// </summary>
    [HttpPost("chi-nhanh/{idCn}/nhan-cong")]
    public async Task<IActionResult> TaoNhanVienKhacPath(int idCn, [FromBody] TaoNhanCongRequest req)
    {
        req.IdCn = idCn;
        var res = await _nhanSuService.LuuNhanCongAsync(req);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách chuyên môn
    /// </summary>
    [HttpGet("doanh-nghiep/nhan-su/specialties")]
    [HttpGet("chuyen-mon")]
    [HttpGet("v1/owner/personnel/specialties")]
    public async Task<IActionResult> LayDanhSachChuyenMon([FromQuery] int? idDn)
    {
        int targetDn = ResolveTargetDnId(idDn, null);
        var res = await _coSoVatChatService.TimChuyenMonTheoDoanhNghiepAsync(targetDn);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một chuyên môn
    /// </summary>
    [HttpPost("doanh-nghiep/nhan-su/specialties")]
    [HttpPost("chuyen-mon")]
    [HttpPost("v1/owner/personnel/specialties")]
    public async Task<IActionResult> TaoChuyenMon([FromQuery] int? idDn, [FromBody] ChuyenMonDto dto)
    {
        int targetDn = ResolveTargetDnId(idDn, null);
        var res = await _coSoVatChatService.LuuChuyenMonAsync(targetDn, dto.TenChuyenMon, dto.MoTa);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa một chuyên môn
    /// </summary>
    [HttpDelete("doanh-nghiep/nhan-su/specialties/{id}")]
    [HttpDelete("chuyen-mon/{id}")]
    public async Task<IActionResult> XoaChuyenMon(int id)
    {
        var res = await _coSoVatChatService.XoaChuyenMonAsync(id);
        return StatusCode(res.StatusCode, res);
    }
}

