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
/// Quản trị Đào tạo, Chương trình học & Lớp học dành cho CHỦ DOANH NGHIỆP, ADMIN, QUẢN LÝ
/// </summary>
[ApiController]
[Route("api/doanh-nghiep/dao-tao")]
[Route("api/v1/owner/academic")]
[Route("api/v1/dao-tao")]
[Route("api/dao-tao")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,QUAN_LY,ROLE_QUAN_LY")]
public class ChuDoanhNghiepDaoTaoController : ControllerBase
{
    private readonly IDaoTaoService _daoTaoService;
    private readonly ICoSoVatChatService _coSoVatChatService;
    private readonly QuanLyTrungTamDbContext _context;

    public ChuDoanhNghiepDaoTaoController(
        IDaoTaoService daoTaoService,
        ICoSoVatChatService coSoVatChatService,
        QuanLyTrungTamDbContext context)
    {
        _daoTaoService = daoTaoService;
        _coSoVatChatService = coSoVatChatService;
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
    // 1. LỚP HỌC (CLASSES)
    // ==========================================

    /// <summary>
    /// Lấy danh sách lớp học thuộc doanh nghiệp
    /// </summary>
    [HttpGet("lop-hoc")]
    public async Task<IActionResult> LayDanhSachLopHoc(
        [FromQuery] int? idCn,
        [FromQuery] int? idKh,
        [FromQuery] int? idKyHoc,
        [FromQuery] int? idMh,
        [FromQuery] int? idGv,
        [FromQuery] string? keyword,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 50)
    {
        int? effectiveKh = idKh ?? idKyHoc;
        var res = await _daoTaoService.LayDanhSachLopHocAsync(idCn, effectiveKh, idMh, idGv, keyword, pageIndex, pageSize);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy thông tin lớp học theo ID
    /// </summary>
    [HttpGet("lop-hoc/{id}")]
    public async Task<IActionResult> LayLopHocTheoId(int id)
    {
        var res = await _daoTaoService.LayLopHocTheoIdAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một lớp học
    /// </summary>
    [HttpPost("lop-hoc")]
    public async Task<IActionResult> TaoLopHoc(
        [FromQuery] int? idCn,
        [FromQuery] int? idKy,
        [FromQuery] int? idKyHoc,
        [FromBody] TaoLopHocRequest request)
    {
        if (idCn.HasValue) request.IdCn = idCn.Value;
        if (idKyHoc.HasValue) request.IdKh = idKyHoc.Value;
        else if (idKy.HasValue) request.IdKh = idKy.Value;

        var res = await _daoTaoService.TaoLopHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Cập nhật thông tin lớp học
    /// </summary>
    [HttpPut("lop-hoc/{id}")]
    public async Task<IActionResult> CapNhatLopHoc(int id, [FromBody] CapNhatLopHocRequest request)
    {
        var res = await _daoTaoService.CapNhatLopHocAsync(id, request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa một lớp học
    /// </summary>
    [HttpDelete("lop-hoc/{id}")]
    public async Task<IActionResult> XoaLopHoc(int id)
    {
        var res = await _daoTaoService.XoaLopHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Phân công giáo viên đứng lớp
    /// </summary>
    [HttpPost("lop-hoc/{idLop}/phan-cong-gv")]
    public async Task<IActionResult> PhanCongGiaoVien(int idLop, [FromBody] PhanCongGiaoVienRequest req)
    {
        var res = await _daoTaoService.PhanCongGiaoVienAsync(idLop, req.IdGv);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo lớp học theo bộ môn
    /// </summary>
    [HttpPost("tao-lop-theo-bo-mon")]
    public async Task<IActionResult> TaoLopTheoBoMon([FromBody] TaoLopHocRequest request)
    {
        var res = await _daoTaoService.TaoLopHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách dropdown chi nhánh
    /// </summary>
    [HttpGet("dropdown/chi-nhanh")]
    public async Task<IActionResult> LayDropdownChiNhanh([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var branches = await _context.ChiNhanhs
            .Where(c => c.IdDn == targetDnId)
            .Select(c => new { c.IdCn, c.TenCn, c.DiaChi, c.Sdt })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(branches));
    }

    // ==========================================
    // 2. KHÓA HỌC (COURSES)
    // ==========================================

    /// <summary>
    /// Lấy danh sách khóa học
    /// </summary>
    [HttpGet("khoa-hoc")]
    public async Task<IActionResult> LayDanhSachKhoaHoc(
        [FromQuery] int? idMh,
        [FromQuery] int? idBoMon,
        [FromQuery] int? idLop)
    {
        var res = await _daoTaoService.LayDanhSachKhoaHocAsync(idMh, idBoMon, idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy thông tin khóa học theo ID
    /// </summary>
    [HttpGet("khoa-hoc/{id}")]
    public async Task<IActionResult> LayKhoaHocTheoId(int id)
    {
        var k = await _context.KhoaHocs.FirstOrDefaultAsync(x => x.IdKhoaHoc == id && !x.Xoa);
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
    /// Tạo mới một khóa học
    /// </summary>
    [HttpPost("khoa-hoc")]
    public async Task<IActionResult> TaoKhoaHoc([FromBody] TaoKhoaHocRequest request)
    {
        var res = await _daoTaoService.TaoKhoaHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Cập nhật thông tin khóa học
    /// </summary>
    [HttpPut("khoa-hoc/{id}")]
    public async Task<IActionResult> CapNhatKhoaHoc(int id, [FromBody] TaoKhoaHocRequest req)
    {
        var k = await _context.KhoaHocs.FirstOrDefaultAsync(x => x.IdKhoaHoc == id && !x.Xoa);
        if (k == null) return NotFound(ApiResponse<KhoaHocDto>.Fail("Không tìm thấy khóa học", 404));
        if (!string.IsNullOrWhiteSpace(req.TenKhoaHoc)) k.TenKhoaHoc = req.TenKhoaHoc;
        if (req.IdLop.HasValue) k.IdLop = req.IdLop.Value;
        if (req.IdBoMon > 0) k.IdBoMon = req.IdBoMon;
        await _context.SaveChangesAsync();
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
    /// Xóa một khóa học
    /// </summary>
    [HttpDelete("khoa-hoc/{id}")]
    public async Task<IActionResult> XoaKhoaHoc(int id)
    {
        var res = await _daoTaoService.XoaKhoaHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 3. BỘ MÔN & MÔN HỌC (SUBJECTS & MAJORS)
    // ==========================================

    /// <summary>
    /// Lấy danh sách bộ môn thuộc doanh nghiệp
    /// </summary>
    [HttpGet("bo-mon")]
    public async Task<IActionResult> LayDanhSachBoMon([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.TimBoMonTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một bộ môn
    /// </summary>
    [HttpPost("bo-mon")]
    public async Task<IActionResult> TaoBoMon([FromQuery] int? idDn, [FromBody] BoMonDto dto)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.LuuBoMonAsync(targetDnId, dto.TenBoMon, dto.MoTa);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Cập nhật thông tin bộ môn
    /// </summary>
    [HttpPut("bo-mon/{id}")]
    public async Task<IActionResult> CapNhatBoMon(int id, [FromBody] BoMonDto dto)
    {
        var bm = await _context.BoMons.FirstOrDefaultAsync(b => b.IdBoMon == id && !b.Xoa);
        if (bm == null) return NotFound(ApiResponse<BoMonDto>.Fail("Không tìm thấy bộ môn", 404));
        if (!string.IsNullOrWhiteSpace(dto.TenBoMon)) bm.TenBoMon = dto.TenBoMon;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<BoMonDto>.Ok(new BoMonDto { IdBoMon = bm.IdBoMon, TenBoMon = bm.TenBoMon, MoTa = dto.MoTa, IdDn = bm.IdDn }));
    }

    /// <summary>
    /// Xóa một bộ môn
    /// </summary>
    [HttpDelete("bo-mon/{id}")]
    public async Task<IActionResult> XoaBoMon(int id)
    {
        var res = await _coSoVatChatService.XoaBoMonAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách môn học
    /// </summary>
    [HttpGet("mon-hoc")]
    public async Task<IActionResult> LayDanhSachMonHoc([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.TimMonHocTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một môn học
    /// </summary>
    [HttpPost("mon-hoc")]
    public async Task<IActionResult> TaoMonHoc([FromQuery] int? idDn, [FromBody] TaoMonHocRequest req)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.LuuMonHocAsync(targetDnId, req.IdBoMon, req.IdChuyenMon, req.TenMon, req.MoTa);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Cập nhật thông tin môn học
    /// </summary>
    [HttpPut("mon-hoc/{id}")]
    public async Task<IActionResult> CapNhatMonHoc(int id, [FromBody] TaoMonHocRequest req)
    {
        var mh = await _context.MonHocs.FirstOrDefaultAsync(m => m.IdMh == id && !m.Xoa);
        if (mh == null) return NotFound(ApiResponse<MonHocDto>.Fail("Không tìm thấy môn học", 404));
        if (!string.IsNullOrWhiteSpace(req.TenMon)) mh.TenMon = req.TenMon;
        if (req.IdBoMon > 0) mh.IdBoMon = req.IdBoMon;
        if (req.IdChuyenMon > 0) mh.IdChuyenMon = req.IdChuyenMon;
        if (req.MoTa != null) mh.MoTa = req.MoTa;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<MonHocDto>.Ok(new MonHocDto
        {
            IdMh = mh.IdMh,
            TenMon = mh.TenMon,
            IdBoMon = mh.IdBoMon,
            IdChuyenMon = mh.IdChuyenMon,
            MoTa = mh.MoTa,
            IdDn = mh.IdDn
        }));
    }

    /// <summary>
    /// Xóa một môn học
    /// </summary>
    [HttpDelete("mon-hoc/{id}")]
    public async Task<IActionResult> XoaMonHoc(int id)
    {
        var res = await _coSoVatChatService.XoaMonHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một chuyên môn
    /// </summary>
    [HttpPost("chuyen-mon")]
    public async Task<IActionResult> TaoChuyenMon([FromQuery] int? idDn, [FromBody] ChuyenMonDto dto)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.LuuChuyenMonAsync(targetDnId, dto.TenChuyenMon, dto.MoTa);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 4. NĂM HỌC, KỲ HỌC, TUẦN HỌC
    // ==========================================

    /// <summary>
    /// Lấy danh sách năm học
    /// </summary>
    [HttpGet("nam-hoc")]
    public async Task<IActionResult> LayDanhSachNamHoc([FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một năm học
    /// </summary>
    [HttpPost("nam-hoc")]
    public async Task<IActionResult> TaoNamHoc([FromQuery] int? idDn, [FromBody] TaoNamHocRequest req)
    {
        req.IdDn = ResolveTargetDnId(idDn ?? req.IdDn);
        var res = await _coSoVatChatService.LuuNamHocAsync(req);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tự động sinh danh sách tuần học theo năm học
    /// </summary>
    [HttpPost("nam-hoc/{idNh}/tao-tuan-hoc-hang-loat")]
    public async Task<IActionResult> TaoTuanHocHangLoatTheoNamHoc(int idNh)
    {
        var res = await _coSoVatChatService.TaoTuanHocHangLoatAsync(idNh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách tuần học theo năm học
    /// </summary>
    [HttpGet("nam-hoc/{idNh}/tuan-hoc")]
    public async Task<IActionResult> LayTuanHocTheoNamHoc(int idNh)
    {
        var kyHocs = await _context.KyHocs.Where(k => k.IdNh == idNh && !k.Xoa).Select(k => k.IdKh).ToListAsync();
        var tuanHocs = await _context.TuanHocs.Where(t => kyHocs.Contains(t.IdKh) && !t.Xoa).OrderBy(t => t.NgayBatDau).ToListAsync();
        return Ok(ApiResponse<List<TuanHoc>>.Ok(tuanHocs));
    }

    /// <summary>
    /// Xóa một năm học
    /// </summary>
    [HttpDelete("nam-hoc/{id}")]
    public async Task<IActionResult> XoaNamHoc(int id)
    {
        var res = await _coSoVatChatService.XoaNamHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Đổi trạng thái hoàn thành của năm học
    /// </summary>
    [HttpPut("nam-hoc/{id}/doi-trang-thai")]
    public async Task<IActionResult> DoiTrangThaiHoanThanhNamHoc(int id)
    {
        var res = await _coSoVatChatService.DoiTrangThaiHoanThanhNamHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách kỳ học thuộc doanh nghiệp
    /// </summary>
    [HttpGet("ky-hoc")]
    public async Task<IActionResult> LayKyHocThuocDoanhNghiep([FromQuery] int? idNh, [FromQuery] int? idDn)
    {
        if (idNh.HasValue && idNh.Value > 0)
        {
            var resNh = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh.Value);
            return StatusCode(resNh.StatusCode, resNh);
        }
        int targetDn = ResolveTargetDnId(idDn);
        var namHocs = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(targetDn);
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
    /// Lấy danh sách lớp học theo kỳ học
    /// </summary>
    [HttpGet("ky-hoc/{idKh}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoKyHoc(int idKh)
    {
        var res = await _daoTaoService.LayDanhSachLopHocAsync(null, idKh, null, null, null, 1, 100);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách kỳ học theo năm học
    /// </summary>
    [HttpGet("nam-hoc/{idNh}/terms")]
    public async Task<IActionResult> LayKyHocTheoNamHoc(int idNh)
    {
        var res = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một kỳ học
    /// </summary>
    [HttpPost("nam-hoc/{idNh}/terms")]
    public async Task<IActionResult> TaoKyHoc(int idNh, [FromBody] KyHocDto dto)
    {
        var res = await _coSoVatChatService.LuuKyHocAsync(idNh, dto.TenKyHoc, dto.NgayBatDau, dto.NgayKetThuc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa một kỳ học
    /// </summary>
    [HttpDelete("terms/{id}")]
    public async Task<IActionResult> XoaKyHoc(int id)
    {
        var res = await _coSoVatChatService.XoaKyHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách tuần học
    /// </summary>
    [HttpGet("tuan-hoc")]
    public async Task<IActionResult> LayTuanHocThuocDoanhNghiep([FromQuery] int? idKh)
    {
        var res = await _coSoVatChatService.TimTuanHocTheoKyHocAsync(idKh ?? 1);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tìm tuần học theo ngày
    /// </summary>
    [HttpGet("tuan-hoc/theo-ngay")]
    public async Task<IActionResult> TimTuanHocTheoNgay([FromQuery] DateOnly? ngay, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        DateOnly targetNgay = ngay ?? DateOnly.FromDateTime(DateTime.Today);
        var res = await _coSoVatChatService.TimTuanHocTheoNgayAsync(targetNgay, targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới một tuần học
    /// </summary>
    [HttpPost("terms/{idKh}/weeks")]
    public async Task<IActionResult> TaoTuanHoc(int idKh, [FromBody] TuanHoc th)
    {
        th.IdKh = idKh;
        th.Xoa = false;
        _context.TuanHocs.Add(th);
        await _context.SaveChangesAsync();
        return StatusCode(201, ApiResponse<TuanHoc>.Created(th, "Tạo tuần học thành công"));
    }

    /// <summary>
    /// Xóa một tuần học
    /// </summary>
    [HttpDelete("weeks/{id}")]
    public async Task<IActionResult> XoaTuanHoc(int id)
    {
        var item = await _context.TuanHocs.FirstOrDefaultAsync(t => t.IdTh == id && !t.Xoa);
        if (item == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy tuần học", 404));
        item.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa tuần học thành công"));
    }

    // ==========================================
    // 5. THỜI KHÓA BIỂU, LỊCH CỐ ĐỊNH & BUỔI HỌC
    // ==========================================

    /// <summary>
    /// Lấy thời khóa biểu theo tuần
    /// </summary>
    [HttpGet("thoi-khoa-bieu/tuan/{idTh}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoTuan(int idTh)
    {
        var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoLopAsync(1, idTh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy tất cả thời khóa biểu thuộc doanh nghiệp
    /// </summary>
    [HttpGet("thoi-khoa-bieu")]
    public async Task<IActionResult> LayTatCaThoiKhoaBieuThuocDoanhNghiep([FromQuery] int? idDn)
    {
        int targetDn = ResolveTargetDnId(idDn);
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
    /// Lấy khung lịch cố định theo lớp
    /// </summary>
    [HttpGet("schedules/fixed")]
    public async Task<IActionResult> LayLichCoDinhTheoLop([FromQuery] int idLop)
    {
        var res = await _daoTaoService.LayKhungLichCoDinhTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lưu khung lịch cố định
    /// </summary>
    [HttpPost("schedules/fixed")]
    public async Task<IActionResult> TaoLichCoDinh([FromBody] KhungLichHocCoDinh lich)
    {
        var res = await _daoTaoService.LuuKhungLichCoDinhAsync(lich);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa khung lịch cố định
    /// </summary>
    [HttpDelete("schedules/fixed/{id}")]
    public async Task<IActionResult> XoaLichCoDinh(int id)
    {
        var res = await _daoTaoService.XoaKhungLichCoDinhAsync(id);
        return StatusCode(res.StatusCode, res);
    }

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
    /// Tạo mới một buổi học
    /// </summary>
    [HttpPost("buoi-hoc")]
    public async Task<IActionResult> TaoBuoiHoc([FromBody] BuoiHoc buoiHoc)
    {
        var res = await _daoTaoService.LuuBuoiHocAsync(buoiHoc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa một buổi học
    /// </summary>
    [HttpDelete("buoi-hoc/{idBuoiHoc}")]
    public async Task<IActionResult> XoaBuoiHoc(int idBuoiHoc)
    {
        var res = await _daoTaoService.XoaBuoiHocAsync(idBuoiHoc);
        return StatusCode(res.StatusCode, res);
    }
}
