using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.Common;

/// <summary>
/// Controller dùng chung Đào tạo (Read-Only) cho 4 vai trò: Admin, Chủ DN, Quản lý, Giáo viên
/// </summary>
[ApiController]
[Route("api/dao-tao-chung")]
[Route("api/chung/dao-tao")]
[Route("api/v1/common/academic")]
[Authorize(Roles = "ADMIN,ROLE_ADMIN,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,QUAN_LY,ROLE_QUAN_LY,GIAO_VIEN,ROLE_GIAO_VIEN")]
public class ChungDaoTaoController : ControllerBase
{
    private readonly ICoSoVatChatService _coSoVatChatService;
    private readonly IDaoTaoService _daoTaoService;
    private readonly IDiemDanhService _diemDanhService;
    private readonly IHocSinhService _hocSinhService;
    private readonly QuanLyTrungTamDbContext _context;

    public ChungDaoTaoController(
        ICoSoVatChatService coSoVatChatService,
        IDaoTaoService daoTaoService,
        IDiemDanhService diemDanhService,
        IHocSinhService hocSinhService,
        QuanLyTrungTamDbContext context)
    {
        _coSoVatChatService = coSoVatChatService;
        _daoTaoService = daoTaoService;
        _diemDanhService = diemDanhService;
        _hocSinhService = hocSinhService;
        _context = context;
    }

    // ==========================================
    // 1. NĂM HỌC, KỲ HỌC, TUẦN HỌC
    // ==========================================

    /// <summary>
    /// Lấy danh sách năm học
    /// </summary>
    [HttpGet("nam-hoc")]
    public async Task<IActionResult> LayDanhSachNamHoc([FromQuery] int? idDn)
    {
        var result = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(idDn ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách năm học theo doanh nghiệp
    /// </summary>
    [HttpGet("doanh-nghiep/{idDn}/nam-hoc")]
    public async Task<IActionResult> LayDanhSachNamHocTheoDoanhNghiep(int idDn)
    {
        var result = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(idDn);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy thông tin năm học theo ID
    /// </summary>
    [HttpGet("nam-hoc/{idNh}")]
    public async Task<IActionResult> LayNamHocTheoId(int idNh)
    {
        var nh = await _context.NamHocs.FirstOrDefaultAsync(n => n.IdNh == idNh && !n.Xoa);
        if (nh == null) return NotFound(ApiResponse<NamHoc>.Fail("Không tìm thấy năm học", 404));
        return Ok(ApiResponse<NamHoc>.Ok(nh));
    }

    /// <summary>
    /// Lấy danh sách kỳ học theo năm học hoặc mặc định
    /// </summary>
    [HttpGet("ky-hoc")]
    public async Task<IActionResult> LayDanhSachKyHoc([FromQuery] int? idNh)
    {
        var result = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách kỳ học theo doanh nghiệp
    /// </summary>
    [HttpGet("doanh-nghiep/{idDn}/ky-hoc")]
    public async Task<IActionResult> LayDanhSachKyHocTheoDoanhNghiep(int idDn)
    {
        var namHocs = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(idDn);
        var idNhs = namHocs.Data?.Select(n => n.IdNh).ToList() ?? new List<int>();
        var kyHocs = await _context.KyHocs
            .Where(k => idNhs.Contains(k.IdNh) && !k.Xoa)
            .AsNoTracking()
            .Select(k => new KyHocDto
            {
                IdKh = k.IdKh,
                IdNh = k.IdNh,
                TenKyHoc = k.TenKyHoc,
                NgayBatDau = k.NgayBatDau ?? DateOnly.MinValue,
                NgayKetThuc = k.NgayKetThuc ?? DateOnly.MinValue
            })
            .ToListAsync();

        return Ok(ApiResponse<List<KyHocDto>>.Ok(kyHocs));
    }

    /// <summary>
    /// Lấy danh sách kỳ học theo năm học
    /// </summary>
    [HttpGet("nam-hoc/{idNh}/ky-hoc")]
    [HttpGet("nam-hoc/{idNh}/terms")]
    public async Task<IActionResult> LayKyHocTheoNamHoc(int idNh)
    {
        var result = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách tuần học
    /// </summary>
    [HttpGet("tuan-hoc")]
    public async Task<IActionResult> LayDanhSachTuanHoc([FromQuery] int? idKh)
    {
        var result = await _coSoVatChatService.TimTuanHocTheoKyHocAsync(idKh ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách tuần học theo doanh nghiệp
    /// </summary>
    [HttpGet("doanh-nghiep/{idDn}/tuan-hoc")]
    public async Task<IActionResult> LayDanhSachTuanHocTheoDoanhNghiep(int idDn)
    {
        var namHocs = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(idDn);
        var idNhs = namHocs.Data?.Select(n => n.IdNh).ToList() ?? new List<int>();
        var kyHocs = await _context.KyHocs.Where(k => idNhs.Contains(k.IdNh) && !k.Xoa).Select(k => k.IdKh).ToListAsync();
        var tuanHocs = await _context.TuanHocs.Where(t => kyHocs.Contains(t.IdKh) && !t.Xoa).OrderBy(t => t.NgayBatDau).ToListAsync();
        return Ok(ApiResponse<List<TuanHoc>>.Ok(tuanHocs));
    }

    /// <summary>
    /// Lấy danh sách tuần học theo kỳ học
    /// </summary>
    [HttpGet("ky-hoc/{idKh}/tuan-hoc")]
    [HttpGet("terms/{idKh}/weeks")]
    public async Task<IActionResult> LayTuanHocTheoKyHoc(int idKh)
    {
        var result = await _coSoVatChatService.TimTuanHocTheoKyHocAsync(idKh);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy tuần học theo ID
    /// </summary>
    [HttpGet("tuan-hoc/{idTh}")]
    public async Task<IActionResult> LayTuanHocTheoId(int idTh)
    {
        var t = await _context.TuanHocs.FirstOrDefaultAsync(x => x.IdTh == idTh && !x.Xoa);
        if (t == null) return NotFound(ApiResponse<TuanHoc>.Fail("Không tìm thấy tuần học", 404));
        return Ok(ApiResponse<TuanHoc>.Ok(t));
    }

    // ==========================================
    // 2. KHÓA HỌC
    // ==========================================

    /// <summary>
    /// Lấy danh sách khóa học
    /// </summary>
    [HttpGet("khoa-hoc")]
    public async Task<IActionResult> LayDanhSachKhoaHoc([FromQuery] int? idLop, [FromQuery] int? idDn)
    {
        var list = await _context.KhoaHocs
            .Where(k => !k.Xoa && (!idLop.HasValue || k.IdLop == idLop.Value) && (!idDn.HasValue || k.IdDn == idDn.Value))
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
    /// Lấy danh sách khóa học theo lớp
    /// </summary>
    [HttpGet("lop-hoc/{idLop}/khoa-hoc")]
    [HttpGet("khoa-hoc/lop-hoc/{idLop}")]
    public async Task<IActionResult> LayKhoaHocTheoLop(int idLop)
    {
        var list = await _context.KhoaHocs
            .Where(k => k.IdLop == idLop && !k.Xoa)
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
    /// Lấy thông tin khóa học theo ID
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

    /// <summary>
    /// Lấy danh sách khóa học theo bộ môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/khoa-hoc")]
    public async Task<IActionResult> LayKhoaHocTheoBoMon(int idBoMon)
    {
        var res = await _daoTaoService.LayDanhSachKhoaHocAsync(null, idBoMon, null);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 3. LỚP HỌC
    // ==========================================

    /// <summary>
    /// Lấy danh sách lớp học phân trang
    /// </summary>
    [HttpGet("lop-hoc")]
    public async Task<IActionResult> LayDanhSachLopHoc(
        [FromQuery] int? idCn,
        [FromQuery] int? idKh,
        [FromQuery] int? idMh,
        [FromQuery] int? idGv,
        [FromQuery] string? keyword,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _daoTaoService.LayDanhSachLopHocAsync(idCn, idKh, idMh, idGv, keyword, pageIndex, pageSize);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách lớp học theo môn học
    /// </summary>
    [HttpGet("mon-hoc/{idMh}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoMonHoc(int idMh)
    {
        var result = await _daoTaoService.LayDanhSachLopHocAsync(null, null, idMh, null, null, 1, 100);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách lớp học theo bộ môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoBoMon(int idBoMon)
    {
        var monHocs = await _context.MonHocs.Where(m => m.IdBoMon == idBoMon && !m.Xoa).Select(m => m.IdMh).ToListAsync();
        var lops = await _context.LopHocs
            .Where(l => l.IdMh.HasValue && monHocs.Contains(l.IdMh.Value) && !l.Xoa)
            .Select(l => new LopHocDto
            {
                IdLop = l.IdLop,
                TenLop = l.TenLop,
                IdCn = l.IdCn,
                IdKh = l.IdKh,
                IdMh = l.IdMh,
                IdGv = l.IdGv,
                SiSoToiDa = l.SiSoToiDa,
                TrangThai = l.TrangThai
            })
            .ToListAsync();

        return Ok(ApiResponse<List<LopHocDto>>.Ok(lops));
    }

    /// <summary>
    /// Lấy chi tiết lớp học theo ID
    /// </summary>
    [HttpGet("lop-hoc/{idLop}")]
    public async Task<IActionResult> LayLopHocTheoId(int idLop)
    {
        var result = await _daoTaoService.LayLopHocTheoIdAsync(idLop);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách lớp học theo kỳ học
    /// </summary>
    [HttpGet("ky-hoc/{idKh}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoKyHoc(int idKh)
    {
        var result = await _daoTaoService.LayDanhSachLopHocAsync(null, idKh, null, null, null, 1, 100);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách lớp học theo khóa học
    /// </summary>
    [HttpGet("khoa-hoc/{idKhoaHoc}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoKhoaHoc(int idKhoaHoc)
    {
        var k = await _context.KhoaHocs.FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.Xoa);
        if (k?.IdLop != null)
        {
            var lop = await _daoTaoService.LayLopHocTheoIdAsync(k.IdLop.Value);
            var list = lop.Data != null ? new List<LopHocDto> { lop.Data } : new List<LopHocDto>();
            return Ok(ApiResponse<List<LopHocDto>>.Ok(list));
        }
        return Ok(ApiResponse<List<LopHocDto>>.Ok(new List<LopHocDto>()));
    }

    /// <summary>
    /// Lấy danh sách lớp học theo chi nhánh
    /// </summary>
    [HttpGet("chi-nhanh/{idCn}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoChiNhanh(int idCn, [FromQuery] int? idKh)
    {
        var result = await _daoTaoService.LayDanhSachLopHocAsync(idCn, idKh, null, null, null, 1, 100);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách lớp học theo chi nhánh và kỳ học
    /// </summary>
    [HttpGet("chi-nhanh/{idCn}/ky-hoc/{idKh}/lop-hoc")]
    [HttpGet("chi-nhanh/{idCn}/terms/{idKh}/classes")]
    public async Task<IActionResult> LayLopHocTheoChiNhanhVaKyHoc(int idCn, int idKh)
    {
        var result = await _daoTaoService.LayDanhSachLopHocAsync(idCn, idKh, null, null, null, 1, 100);
        return StatusCode(result.StatusCode, result);
    }

    // ==========================================
    // 4. BUỔI HỌC
    // ==========================================

    /// <summary>
    /// Lấy danh sách buổi học theo lớp
    /// </summary>
    [HttpGet("lop-hoc/{idLop}/buoi-hoc")]
    [HttpGet("buoi-hoc/lop-hoc/{idLop}")]
    public async Task<IActionResult> LayBuoiHocTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayDanhSachBuoiHocTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách buổi học theo khóa học
    /// </summary>
    [HttpGet("khoa-hoc/{idKhoaHoc}/buoi-hoc")]
    public async Task<IActionResult> LayBuoiHocTheoKhoaHoc(int idKhoaHoc)
    {
        var res = await _daoTaoService.LayDanhSachBuoiHocTheoKhoaHocAsync(idKhoaHoc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy thông tin buổi học theo ID
    /// </summary>
    [HttpGet("buoi-hoc/{idBuoiHoc}")]
    public async Task<IActionResult> LayBuoiHocTheoId(int idBuoiHoc)
    {
        var res = await _daoTaoService.LayBuoiHocTheoIdAsync(idBuoiHoc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một buổi học
    /// </summary>
    [HttpPost("buoi-hoc")]
    public async Task<IActionResult> TaoBuoiHoc([FromBody] BuoiHoc buoiHoc)
    {
        var res = await _daoTaoService.LuuBuoiHocAsync(buoiHoc);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 5. THỜI KHÓA BIỂU
    // ==========================================

    /// <summary>
    /// Lấy thời khóa biểu theo tuần
    /// </summary>
    [HttpGet("thoi-khoa-bieu/tuan/{idTh}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoTuan(int idTh, [FromQuery] int? idCn)
    {
        var query = _context.ThoiKhoaBieuTuans
            .Include(t => t.LopHoc)
            .Include(t => t.GiaoVien)
            .Include(t => t.PhongHoc)
            .Where(t => t.IdTh == idTh && !t.Xoa);

        var list = await query
            .AsNoTracking()
            .Select(t => new ThoiKhoaBieuTuanDto
            {
                IdTkb = t.IdTkbTuan,
                IdTh = t.IdTh,
                ThuTrongTuan = t.Thu,
                CaHoc = t.CaHoc,
                GioBatDau = t.GioBatDau,
                GioKetThuc = t.GioKetThuc,
                IdLop = t.IdLop,
                TenLop = t.LopHoc != null ? t.LopHoc.TenLop : "",
                IdGv = t.IdGiaoVien,
                TenGv = t.GiaoVien != null ? t.GiaoVien.HoTen : null,
                IdPhong = t.IdPhong,
                TenPhong = t.PhongHoc != null ? t.PhongHoc.TenPhong : null
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ThoiKhoaBieuTuanDto>>.Ok(list));
    }

    /// <summary>
    /// Lấy tất cả thời khóa biểu thuộc doanh nghiệp
    /// </summary>
    [HttpGet("thoi-khoa-bieu/all")]
    [HttpGet("thoi-khoa-bieu")]
    public async Task<IActionResult> LayTatCaThoiKhoaBieuThuocDoanhNghiep([FromQuery] int? idDn)
    {
        int targetDn = idDn ?? 1;
        var list = await _context.ThoiKhoaBieuTuans
            .Include(t => t.LopHoc)
            .Include(t => t.GiaoVien)
            .Include(t => t.PhongHoc)
            .Where(t => t.IdDn == targetDn && !t.Xoa)
            .AsNoTracking()
            .Select(t => new ThoiKhoaBieuTuanDto
            {
                IdTkb = t.IdTkbTuan,
                IdTh = t.IdTh,
                ThuTrongTuan = t.Thu,
                CaHoc = t.CaHoc,
                GioBatDau = t.GioBatDau,
                GioKetThuc = t.GioKetThuc,
                IdLop = t.IdLop,
                TenLop = t.LopHoc != null ? t.LopHoc.TenLop : "",
                IdGv = t.IdGiaoVien,
                TenGv = t.GiaoVien != null ? t.GiaoVien.HoTen : null,
                IdPhong = t.IdPhong,
                TenPhong = t.PhongHoc != null ? t.PhongHoc.TenPhong : null
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ThoiKhoaBieuTuanDto>>.Ok(list));
    }

    /// <summary>
    /// Lấy thời khóa biểu theo lớp
    /// </summary>
    [HttpGet("thoi-khoa-bieu/lop/{idLop}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoLopAsync(idLop, null);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy thời khóa biểu theo phòng
    /// </summary>
    [HttpGet("thoi-khoa-bieu/phong/{idPhong}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoPhong(int idPhong)
    {
        var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoPhongHocAsync(idPhong, null);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy thời khóa biểu theo giáo viên
    /// </summary>
    [HttpGet("thoi-khoa-bieu/giao-vien/{idGv}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoGiaoVien(int idGv)
    {
        var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoGiaoVienAsync(idGv, null);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 6. DANH MỤC BỔ TRỢ: BỘ MÔN, CHUYÊN MÔN, PHÒNG HỌC, CHI NHÁNH
    // ==========================================

    /// <summary>
    /// Lấy danh sách bộ môn
    /// </summary>
    [HttpGet("bo-mon")]
    public async Task<IActionResult> LayDanhSachBoMon([FromQuery] int? idDn)
    {
        var result = await _coSoVatChatService.TimBoMonTheoDoanhNghiepAsync(idDn ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy môn học theo bộ môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/mon-hoc")]
    public async Task<IActionResult> LayMonHocTheoBoMon(int idBoMon)
    {
        var list = await _context.MonHocs.Where(m => m.IdBoMon == idBoMon && !m.Xoa).ToListAsync();
        return Ok(ApiResponse<List<MonHoc>>.Ok(list));
    }

    /// <summary>
    /// Lấy danh sách giáo viên theo bộ môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/giao-vien")]
    public async Task<IActionResult> LayGiaoVienTheoBoMon(int idBoMon)
    {
        var cmIds = await _context.MonHocs.Where(m => m.IdBoMon == idBoMon && !m.Xoa).Select(m => m.IdChuyenMon).Distinct().ToListAsync();
        var gvIds = await _context.GiaoVienChuyenMons.Where(g => cmIds.Contains(g.IdChuyenMon) && !g.Xoa).Select(g => g.IdGv).Distinct().ToListAsync();
        var gvs = await _context.GiaoViens.Where(g => gvIds.Contains(g.IdGv) && !g.Xoa).ToListAsync();
        return Ok(ApiResponse<List<dotnet_backend.Entities.GiaoVien>>.Ok(gvs));
    }

    /// <summary>
    /// Thống kê tổng hợp số liệu Bộ môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/thong-ke")]
    public async Task<IActionResult> LayThongKeBoMon(int idBoMon)
    {
        var bm = await _context.BoMons.FirstOrDefaultAsync(b => b.IdBoMon == idBoMon && !b.Xoa);
        if (bm == null) return NotFound(ApiResponse<ThongKeBoMonDto>.Fail("Không tìm thấy bộ môn", 404));

        var dsMon = await _context.MonHocs.Where(m => m.IdBoMon == idBoMon && !m.Xoa).ToListAsync();
        var dsKhoaHoc = await _context.KhoaHocs.Where(k => k.IdBoMon == idBoMon && !k.Xoa).ToListAsync();
        var lopIds = dsKhoaHoc.Where(k => k.IdLop.HasValue).Select(k => k.IdLop!.Value).Distinct().ToList();

        var cmIds = dsMon.Select(m => m.IdChuyenMon).Distinct().ToList();
        var gvIds = await _context.GiaoVienChuyenMons.Where(g => cmIds.Contains(g.IdChuyenMon) && !g.Xoa).Select(g => g.IdGv).Distinct().ToListAsync();
        var gvLopIds = await _context.LopHocs.Where(l => lopIds.Contains(l.IdLop) && l.IdGv.HasValue && !l.Xoa).Select(l => l.IdGv!.Value).Distinct().ToListAsync();
        var tongSoGv = gvIds.Union(gvLopIds).Distinct().Count();

        var tongHs = await _context.DangKyHocs.Where(d => lopIds.Contains(d.IdLop) && !d.Xoa).Select(d => d.IdHs).Distinct().CountAsync();

        var dto = new ThongKeBoMonDto
        {
            IdBoMon = bm.IdBoMon,
            TenBoMon = bm.TenBoMon,
            TongSoMonHoc = dsMon.Count,
            TongSoKhoaHoc = dsKhoaHoc.Count,
            TongSoLopHoc = lopIds.Count,
            TongSoGiaoVien = tongSoGv,
            TongSoHocSinhDangHoc = tongHs
        };

        return Ok(ApiResponse<ThongKeBoMonDto>.Ok(dto));
    }

    /// <summary>
    /// Lấy chuyên môn theo bộ môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/chuyen-mon")]
    public async Task<IActionResult> LayChuyenMonTheoBoMon(int idBoMon)
    {
        var cmIds = await _context.MonHocs.Where(m => m.IdBoMon == idBoMon && !m.Xoa).Select(m => m.IdChuyenMon).Distinct().ToListAsync();
        var list = await _context.ChuyenMons.Where(c => cmIds.Contains(c.IdCm) && !c.Xoa).ToListAsync();
        return Ok(ApiResponse<List<ChuyenMon>>.Ok(list));
    }

    /// <summary>
    /// Lấy giáo viên theo chuyên môn
    /// </summary>
    [HttpGet("chuyen-mon/{idCm}/giao-vien")]
    public async Task<IActionResult> LayGiaoVienTheoChuyenMon(int idCm)
    {
        var gvIds = await _context.GiaoVienChuyenMons.Where(g => g.IdChuyenMon == idCm && !g.Xoa).Select(g => g.IdGv).Distinct().ToListAsync();
        var gvs = await _context.GiaoViens.Where(g => gvIds.Contains(g.IdGv) && !g.Xoa).ToListAsync();
        return Ok(ApiResponse<List<dotnet_backend.Entities.GiaoVien>>.Ok(gvs));
    }

    /// <summary>
    /// Lấy môn học theo bộ môn và chuyên môn
    /// </summary>
    [HttpGet("bo-mon/{idBoMon}/chuyen-mon/{idCm}/mon-hoc")]
    public async Task<IActionResult> LayMonHocTheoBoMonVaChuyenMon(int idBoMon, int idCm)
    {
        var list = await _context.MonHocs.Where(m => m.IdBoMon == idBoMon && m.IdChuyenMon == idCm && !m.Xoa).ToListAsync();
        return Ok(ApiResponse<List<MonHoc>>.Ok(list));
    }

    /// <summary>
    /// Lấy danh sách chuyên môn
    /// </summary>
    [HttpGet("chuyen-mon")]
    public async Task<IActionResult> LayDanhSachChuyenMon([FromQuery] int? idDn)
    {
        var result = await _coSoVatChatService.TimChuyenMonTheoDoanhNghiepAsync(idDn ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách phòng học
    /// </summary>
    [HttpGet("phong-hoc")]
    public async Task<IActionResult> LayDanhSachPhongHoc([FromQuery] int? idCn)
    {
        var result = await _coSoVatChatService.TimPhongHocTheoChiNhanhAsync(idCn ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy danh sách chi nhánh
    /// </summary>
    [HttpGet("chi-nhanh")]
    public async Task<IActionResult> LayDanhSachChiNhanh([FromQuery] int? idDn)
    {
        var list = await _context.ChiNhanhs
            .Where(c => !idDn.HasValue || c.IdDn == idDn.Value)
            .AsNoTracking()
            .Select(c => new ChiNhanhDto
            {
                IdCn = c.IdCn,
                TenCn = c.TenCn,
                DiaChi = c.DiaChi,
                Sdt = c.Sdt,
                IdDn = c.IdDn,
                SoLuongLopHoc = _context.LopHocs.Count(l => l.IdCn == c.IdCn && !l.Xoa),
                SoLuongPhongHoc = _context.PhongHocs.Count(p => p.IdCn == c.IdCn && !p.Xoa)
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ChiNhanhDto>>.Ok(list));
    }

    // ==========================================
    // 7. ĐĂNG KÝ HỌC & ĐIỂM DANH
    // ==========================================

    /// <summary>
    /// Lấy danh sách đăng ký học theo lớp
    /// </summary>
    [HttpGet("lop-hoc/{idLop}/dang-ky-hoc")]
    public async Task<IActionResult> LayDangKyHocTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayDanhSachDangKyTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Thêm học sinh vào lớp học
    /// </summary>
    [HttpPost("lop-hoc/{idLop}/dang-ky-hoc")]
    public async Task<IActionResult> ThemHocSinhVaoLop(int idLop, [FromBody] Dictionary<string, int?> request)
    {
        int idHs = request.TryGetValue("idHs", out var vHs) && vHs.HasValue ? vHs.Value : 0;
        int? idPh = request.TryGetValue("idPh", out var vPh) ? vPh : null;

        if (idHs <= 0) return BadRequest(ApiResponse<DangKyHoc>.Fail("idHs không được để trống", 400));

        var res = await _daoTaoService.DangKyHocAsync(idHs, idLop, idPh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa đăng ký học
    /// </summary>
    [HttpDelete("dang-ky-hoc/{idDangKy}")]
    public async Task<IActionResult> XoaDangKyHoc(int idDangKy)
    {
        var res = await _daoTaoService.XoaDangKyHocAsync(idDangKy);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa học sinh ra khỏi lớp học
    /// </summary>
    [HttpDelete("lop-hoc/{idLop}/hoc-sinh/{idHs}")]
    public async Task<IActionResult> XoaHocSinhKhoiLop(int idLop, int idHs)
    {
        var res = await _daoTaoService.XoaHocSinhKhoiLopAsync(idHs, idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách đăng ký học theo học sinh
    /// </summary>
    [HttpGet("hoc-sinh/{idHs}/dang-ky-hoc")]
    public async Task<IActionResult> LayDangKyHocTheoHocSinh(int idHs)
    {
        var res = await _daoTaoService.LayDanhSachDangKyTheoHocSinhAsync(idHs);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách điểm danh theo buổi học
    /// </summary>
    [HttpGet("buoi-hoc/{idBuoiHoc}/diem-danh")]
    [HttpGet("buoi-hoc/{idBuoiHoc}/diem-danh-hoc-sinh")]
    public async Task<IActionResult> LayDiemDanhTheoBuoiHoc(int idBuoiHoc)
    {
        var res = await _diemDanhService.LayDiemDanhTheoBuoiHocAsync(idBuoiHoc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lưu điểm danh học sinh cho buổi học
    /// </summary>
    [HttpPost("buoi-hoc/{idBuoiHoc}/diem-danh")]
    [HttpPost("buoi-hoc/{idBuoiHoc}/diem-danh-hoc-sinh")]
    public async Task<IActionResult> LuuDiemDanhBuoiHoc(int idBuoiHoc, [FromBody] LuuDiemDanhBuoiHocRequest request)
    {
        request.IdBuoiHoc = idBuoiHoc;
        var res = await _diemDanhService.LuuDiemDanhHocSinhBatchAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy điểm danh theo khóa học
    /// </summary>
    [HttpGet("khoa-hoc/{idKhoaHoc}/diem-danh")]
    [HttpGet("khoa-hoc/{idKhoaHoc}/diem-danh-hoc-sinh")]
    public async Task<IActionResult> LayDiemDanhTheoKhoaHoc(int idKhoaHoc)
    {
        var buoiHocs = await _context.BuoiHocs.Where(b => b.IdKhoaHoc == idKhoaHoc && !b.Xoa).Select(b => b.IdBuoiHoc).ToListAsync();
        var list = await _context.DiemDanhHocSinhs.Where(d => buoiHocs.Contains(d.IdBuoiHoc) && !d.Xoa).ToListAsync();
        return Ok(ApiResponse<List<DiemDanhHocSinh>>.Ok(list));
    }

    /// <summary>
    /// Lấy chi tiết hồ sơ học sinh
    /// </summary>
    [HttpGet("hoc-sinh/{idHs}")]
    public async Task<IActionResult> LayChiTietHocSinh(int idHs)
    {
        var result = await _hocSinhService.TimHocSinhTheoIdAsync(idHs);
        return StatusCode(result.StatusCode, result);
    }

    /// <summary>
    /// Lấy lịch sử điểm danh của học sinh
    /// </summary>
    [HttpGet("hoc-sinh/{idHs}/diem-danh")]
    public async Task<IActionResult> LayLichSuDiemDanhCuaHocSinh(int idHs, [FromQuery] int? idKhoaHoc)
    {
        var res = await _diemDanhService.LayLichSuDiemDanhHocSinhAsync(idHs, idKhoaHoc);
        return StatusCode(res.StatusCode, res);
    }
}
