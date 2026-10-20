using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.Admin;

/// <summary>
/// Quản lý danh mục đào tạo mẫu chuẩn toàn hệ thống dành cho ADMIN
/// </summary>
[ApiController]
[Route("api/admin/dao-tao")]
[Route("api/dao-tao")]
[Authorize(Roles = "ADMIN,ROLE_ADMIN,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,QUAN_LY,ROLE_QUAN_LY")]
public class AdminDaoTaoController : ControllerBase
{
    private readonly IDaoTaoService _daoTaoService;
    private readonly ICoSoVatChatService _coSoVatChatService;
    private readonly QuanLyTrungTamDbContext _context;

    public AdminDaoTaoController(
        IDaoTaoService daoTaoService,
        ICoSoVatChatService coSoVatChatService,
        QuanLyTrungTamDbContext context)
    {
        _daoTaoService = daoTaoService;
        _coSoVatChatService = coSoVatChatService;
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách tất cả bộ môn
    /// </summary>
    [HttpGet("bo-mon")]
    public async Task<IActionResult> LayTatCaBoMon([FromQuery] int? idDn)
    {
        var res = await _coSoVatChatService.TimBoMonTheoDoanhNghiepAsync(idDn ?? 1);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy chi tiết khóa học theo ID
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

    /// <summary>
    /// Tạo mới khóa học theo bộ môn
    /// </summary>
    [HttpPost("bo-mon/{idBoMon}/khoa-hoc")]
    public async Task<IActionResult> TaoKhoaHoc(int idBoMon, [FromBody] TaoKhoaHocRequest request)
    {
        request.IdBoMon = idBoMon;
        var res = await _daoTaoService.TaoKhoaHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới khóa học lồng bộ môn và lớp học
    /// </summary>
    [HttpPost("bo-mon/{idBoMon}/lop-hoc/{idLop}/khoa-hoc")]
    public async Task<IActionResult> TaoKhoaHocTheoBoMonVaLop(int idBoMon, int idLop, [FromBody] TaoKhoaHocRequest request)
    {
        request.IdBoMon = idBoMon;
        request.IdLop = idLop;
        var res = await _daoTaoService.TaoKhoaHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo mới khóa học lồng bộ môn, lớp học và môn học
    /// </summary>
    [HttpPost("bo-mon/{idBoMon}/lop-hoc/{idLop}/mon-hoc/{idMh}/khoa-hoc")]
    public async Task<IActionResult> TaoKhoaHocTheoBoMonLopVaMon(int idBoMon, int idLop, int idMh, [FromBody] TaoKhoaHocRequest request)
    {
        request.IdBoMon = idBoMon;
        request.IdLop = idLop;
        request.IdMh = idMh;
        var res = await _daoTaoService.TaoKhoaHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa khóa học
    /// </summary>
    [HttpDelete("khoa-hoc/{idKhoaHoc}")]
    public async Task<IActionResult> XoaKhoaHoc(int idKhoaHoc)
    {
        var res = await _daoTaoService.XoaKhoaHocAsync(idKhoaHoc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách khóa học theo môn học
    /// </summary>
    [HttpGet("mon-hoc/{idMh}/khoa-hoc")]
    public async Task<IActionResult> LayKhoaHocTheoMonHoc(int idMh)
    {
        var res = await _daoTaoService.LayDanhSachKhoaHocAsync(idMh, null, null);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy chi tiết lớp học theo ID
    /// </summary>
    [HttpGet("lop-hoc/{idLop}")]
    public async Task<IActionResult> LayLopHocTheoId(int idLop)
    {
        var res = await _daoTaoService.LayLopHocTheoIdAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách lớp học theo chi nhánh
    /// </summary>
    [HttpGet("chi-nhanh/{idCn}/lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoChiNhanh(int idCn)
    {
        var res = await _daoTaoService.LayDanhSachLopHocAsync(idCn, null, null, null, null, 1, 100);
        return StatusCode(res.StatusCode, res);
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
    /// Lấy danh sách năm học
    /// </summary>
    [HttpGet("nam-hoc")]
    public async Task<IActionResult> LayTatCaNamHoc([FromQuery] int? idDn)
    {
        var res = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(idDn ?? 1);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách kỳ học theo năm học
    /// </summary>
    [HttpGet("nam-hoc/{idNh}/ky-hoc")]
    public async Task<IActionResult> LayKyHocTheoNamHoc(int idNh)
    {
        var res = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách kỳ học linh hoạt theo năm học hoặc doanh nghiệp
    /// </summary>
    [HttpGet("ky-hoc")]
    public async Task<IActionResult> LayTatCaKyHoc([FromQuery] int? idNh, [FromQuery] int? idDn)
    {
        if (idNh.HasValue && idNh.Value > 0)
        {
            var resNh = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh.Value);
            return StatusCode(resNh.StatusCode, resNh);
        }

        int targetDn = idDn ?? 1;
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
    /// Tạo mới một lớp học
    /// </summary>
    [HttpPost("lop-hoc")]
    public async Task<IActionResult> TaoLopHoc([FromBody] TaoLopHocRequest request)
    {
        var res = await _daoTaoService.TaoLopHocAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa một lớp học
    /// </summary>
    [HttpDelete("lop-hoc/{idLop}")]
    public async Task<IActionResult> XoaLopHoc(int idLop)
    {
        var res = await _daoTaoService.XoaLopHocAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy khung lịch học cố định theo lớp
    /// </summary>
    [HttpGet("lop-hoc/{idLop}/lich-co-dinh")]
    public async Task<IActionResult> LayLichCoDinhTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayKhungLichCoDinhTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lưu khung lịch học cố định
    /// </summary>
    [HttpPost("lich-co-dinh")]
    public async Task<IActionResult> TaoLichCoDinh([FromBody] KhungLichHocCoDinh lich)
    {
        var res = await _daoTaoService.LuuKhungLichCoDinhAsync(lich);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa khung lịch học cố định
    /// </summary>
    [HttpDelete("lich-co-dinh/{idKhungLich}")]
    public async Task<IActionResult> XoaLichCoDinh(int idKhungLich)
    {
        var res = await _daoTaoService.XoaKhungLichCoDinhAsync(idKhungLich);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách buổi học theo lớp
    /// </summary>
    [HttpGet("lop-hoc/{idLop}/buoi-hoc")]
    public async Task<IActionResult> LayBuoiHocTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayDanhSachBuoiHocTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Tạo hoặc lưu buổi học
    /// </summary>
    [HttpPost("buoi-hoc")]
    public async Task<IActionResult> TaoBuoiHoc([FromBody] BuoiHoc buoiHoc)
    {
        var res = await _daoTaoService.LuuBuoiHocAsync(buoiHoc);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa buổi học
    /// </summary>
    [HttpDelete("buoi-hoc/{idBuoiHoc}")]
    public async Task<IActionResult> XoaBuoiHoc(int idBuoiHoc)
    {
        var res = await _daoTaoService.XoaBuoiHocAsync(idBuoiHoc);
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
    /// Lấy danh sách đăng ký học theo lớp
    /// </summary>
    [HttpGet("lop-hoc/{idLop}/dang-ky-hoc")]
    public async Task<IActionResult> LayDangKyHocTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayDanhSachDangKyTheoLopAsync(idLop);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Đăng ký học sinh vào lớp học
    /// </summary>
    [HttpPost("dang-ky-hoc")]
    public async Task<IActionResult> DangKyHoc([FromBody] Dictionary<string, int?> request)
    {
        int idHs = request.TryGetValue("idHs", out var vHs) && vHs.HasValue ? vHs.Value : 0;
        int idLop = request.TryGetValue("idLop", out var vLop) && vLop.HasValue ? vLop.Value : 0;
        int? idPh = request.TryGetValue("idPh", out var vPh) ? vPh : null;

        if (idHs <= 0 || idLop <= 0)
        {
            return BadRequest(ApiResponse<DangKyHoc>.Fail("idHs và idLop không được để trống", 400));
        }

        var res = await _daoTaoService.DangKyHocAsync(idHs, idLop, idPh);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Hủy đăng ký học
    /// </summary>
    [HttpDelete("dang-ky-hoc/{idDangKy}")]
    public async Task<IActionResult> HuyDangKyHoc(int idDangKy)
    {
        var res = await _daoTaoService.XoaDangKyHocAsync(idDangKy);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy toàn bộ danh sách tuần học
    /// </summary>
    [HttpGet("tuan-hoc")]
    public async Task<IActionResult> LayTatCaTuanHoc([FromQuery] int? idKh)
    {
        if (idKh.HasValue && idKh.Value > 0)
        {
            var resKh = await _coSoVatChatService.TimTuanHocTheoKyHocAsync(idKh.Value);
            return StatusCode(resKh.StatusCode, resKh);
        }

        var res = await _coSoVatChatService.TimTuanHocTheoKyHocAsync(1);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lấy danh sách tuần học theo kỳ học
    /// </summary>
    [HttpGet("tuan-hoc/ky-hoc/{idKh}")]
    public async Task<IActionResult> LayTuanHocTheoKy(int idKh)
    {
        var res = await _coSoVatChatService.TimTuanHocTheoKyHocAsync(idKh);
        return StatusCode(res.StatusCode, res);
    }

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
    /// Lấy thời khóa biểu theo lớp
    /// </summary>
    [HttpGet("thoi-khoa-bieu/lop/{idLop}")]
    public async Task<IActionResult> LayThoiKhoaBieuTheoLop(int idLop)
    {
        var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoLopAsync(idLop, null);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Lưu thời khóa biểu tuần
    /// </summary>
    [HttpPost("thoi-khoa-bieu")]
    public async Task<IActionResult> LuuThoiKhoaBieu([FromBody] ThoiKhoaBieuTuan tkb)
    {
        var res = await _daoTaoService.LuuThoiKhoaBieuTuanAsync(tkb);
        return StatusCode(res.StatusCode, res);
    }

    /// <summary>
    /// Xóa thời khóa biểu tuần
    /// </summary>
    [HttpDelete("thoi-khoa-bieu/{id}")]
    public async Task<IActionResult> XoaThoiKhoaBieu(int id)
    {
        var res = await _daoTaoService.XoaThoiKhoaBieuTuanAsync(id);
        return StatusCode(res.StatusCode, res);
    }
}
