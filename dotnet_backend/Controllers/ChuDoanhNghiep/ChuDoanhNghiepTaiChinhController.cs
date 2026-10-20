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
/// Quản trị Tài chính, Sổ quỹ & Lương giáo viên toàn chuỗi dành cho CHỦ DOANH NGHIỆP, ADMIN, QUẢN LÝ
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,QUAN_LY,ROLE_QUAN_LY")]
public class ChuDoanhNghiepTaiChinhController : ControllerBase
{
    private readonly ITaiChinhService _taiChinhService;
    private readonly QuanLyTrungTamDbContext _context;

    public ChuDoanhNghiepTaiChinhController(
        ITaiChinhService taiChinhService,
        QuanLyTrungTamDbContext context)
    {
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
    // 1. SỔ QUỸ (CASHBOOK)
    // ==========================================

    [HttpGet("so-quy")]
    [HttpGet("cashbook")]
    [HttpGet("doanh-nghiep/{idDn}/so-quy")]
    [HttpGet("doanh-nghiep/tai-chinh/so-quy")]
    [HttpGet("v1/tai-chinh/so-quy")]
    [HttpGet("tai-chinh/so-quy")]
    public async Task<IActionResult> LaySoQuyDoanhNghiep(int? idDn, [FromQuery] int? queryIdDn)
    {
        int targetDnId = ResolveTargetDnId(idDn ?? queryIdDn);
        var list = await _context.SoQuyThuChis
            .Where(s => !s.Xoa && s.IdDn == targetDnId)
            .OrderByDescending(s => s.NgayGiaoDich)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<SoQuyThuChi>>.Ok(list));
    }

    [HttpGet("chi-nhanh/{idCn}/giao-dich")]
    public async Task<IActionResult> LayGiaoDichTheoChiNhanh(int idCn)
    {
        var list = await _context.SoQuyThuChis
            .Where(s => !s.Xoa && s.IdCn == idCn)
            .OrderByDescending(s => s.NgayGiaoDich)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<SoQuyThuChi>>.Ok(list));
    }

    [HttpPost("chi-nhanh/{idCn}/giao-dich")]
    public async Task<IActionResult> TaoGiaoDichChiNhanh(int idCn, [FromBody] SoQuyThuChi gd)
    {
        gd.IdCn = idCn;
        var res = await _taiChinhService.GhiSoQuyAsync(gd);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("so-quy")]
    [HttpPost("giao-dich")]
    [HttpPost("doanh-nghiep/tai-chinh/so-quy")]
    [HttpPost("v1/tai-chinh/so-quy")]
    [HttpPost("tai-chinh/so-quy")]
    public async Task<IActionResult> TaoGiaoDichThuChi([FromQuery] int? idCn, [FromBody] SoQuyThuChi gd)
    {
        if (idCn.HasValue) gd.IdCn = idCn.Value;
        var res = await _taiChinhService.GhiSoQuyAsync(gd);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("so-quy/{id}")]
    [HttpDelete("giao-dich/{id}")]
    public async Task<IActionResult> XoaGiaoDichThuChi(int id)
    {
        var res = await _taiChinhService.XoaSoQuyAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("bao-cao-tong-hop")]
    [HttpGet("v1/tai-chinh/bao-cao-tong-hop")]
    [HttpGet("tai-chinh/bao-cao-tong-hop")]
    [HttpGet("doanh-nghiep/tai-chinh/bao-cao-tong-hop")]
    public async Task<IActionResult> LayBaoCaoTongHop(
        [FromQuery] int? idDn,
        [FromQuery] DateOnly? tuNgay,
        [FromQuery] DateOnly? denNgay)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _taiChinhService.LayBaoCaoTongHopAsync(targetDnId, tuNgay, denNgay);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("phieu-thu")]
    [HttpPost("v1/tai-chinh/phieu-thu")]
    [HttpPost("tai-chinh/phieu-thu")]
    public async Task<IActionResult> LapPhieuThu([FromBody] TaoPhieuThuRequest request)
    {
        var res = await _taiChinhService.LapPhieuThuHocPhiAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("phieu-thu/hoc-sinh/{idHs}")]
    [HttpGet("v1/tai-chinh/phieu-thu/hoc-sinh/{idHs}")]
    [HttpGet("tai-chinh/phieu-thu/hoc-sinh/{idHs}")]
    [HttpGet("hoc-sinh/{idHs}/phieu-thu")]
    public async Task<IActionResult> LayPhieuThuTheoHocSinh(int idHs)
    {
        var res = await _taiChinhService.TimPhieuThuTheoHocSinhAsync(idHs);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 2. BẢNG LƯƠNG GIÁO VIÊN (TEACHER PAYROLLS)
    // ==========================================

    [HttpGet("luong-giao-vien")]
    [HttpGet("teacher-payrolls")]
    [HttpGet("thanh-toan-giao-vien")]
    [HttpGet("doanh-nghiep/{idDn}/thanh-toan-giao-vien")]
    public async Task<IActionResult> LayDanhSachLuongGiaoVien(int? idDn, [FromQuery] int? queryIdDn)
    {
        int targetDnId = ResolveTargetDnId(idDn ?? queryIdDn);
        var list = await _context.ThanhToanGiaoViens
            .Include(t => t.GiaoVien)
            .Where(t => !t.Xoa && t.IdDn == targetDnId)
            .OrderByDescending(t => t.NgayThanhToan)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<ThanhToanGiaoVien>>.Ok(list));
    }

    [HttpGet("giao-vien/{idGv}/thanh-toan")]
    public async Task<IActionResult> LayThanhToanTheoGiaoVien(int idGv)
    {
        var list = await _context.ThanhToanGiaoViens
            .Where(t => !t.Xoa && t.IdGv == idGv)
            .OrderByDescending(t => t.NgayThanhToan)
            .AsNoTracking()
            .ToListAsync();

        return Ok(ApiResponse<List<ThanhToanGiaoVien>>.Ok(list));
    }

    [HttpPost("luong-giao-vien")]
    [HttpPost("thanh-toan-giao-vien")]
    public async Task<IActionResult> TaoPhieuLuongGiaoVien(
        [FromQuery] int? idGv,
        [FromQuery] int? idDn,
        [FromBody] ThanhToanGiaoVien tt)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        if (idGv.HasValue) tt.IdGv = idGv.Value;
        tt.IdDn = targetDnId;
        tt.Xoa = false;
        tt.NgayThanhToan ??= DateOnly.FromDateTime(DateTime.Today);

        _context.ThanhToanGiaoViens.Add(tt);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<ThanhToanGiaoVien>.Ok(tt, "Tạo phiếu thanh toán lương giáo viên thành công"));
    }

    [HttpPost("thanh-toan-luong")]
    public async Task<IActionResult> ThanhToanLuongGiaoVien([FromBody] ThanhToanLuongGvRequest request)
    {
        request.IdDn = ResolveTargetDnId(request.IdDn);
        var res = await _taiChinhService.ThanhToanLuongGiaoVienAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("thanh-toan-giao-vien/{id}")]
    public async Task<IActionResult> XoaThanhToanGiaoVien(int id)
    {
        var res = await _taiChinhService.XoaThanhToanGiaoVienAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 3. BẢO LƯU KHÓA HỌC (COURSE RESERVATION)
    // ==========================================

    [HttpGet("bao-luu")]
    [HttpGet("doanh-nghiep/{idDn}/bao-luu")]
    public async Task<IActionResult> LayDanhSachBaoLuu(int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _taiChinhService.TimBaoLuuTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("chi-nhanh/{idCn}/bao-luu")]
    public async Task<IActionResult> LayDanhSachBaoLuuTheoChiNhanh(int idCn)
    {
        var res = await _taiChinhService.TimBaoLuuTheoChiNhanhAsync(idCn);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("hoc-sinh/{idHs}/bao-luu")]
    public async Task<IActionResult> LayDanhSachBaoLuuTheoHocSinh(int idHs)
    {
        var res = await _taiChinhService.TimBaoLuuTheoHocSinhAsync(idHs);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("bao-luu")]
    public async Task<IActionResult> TaoBaoLuu([FromBody] TaoBaoLuuRequest request)
    {
        request.IdDn = ResolveTargetDnId(request.IdDn);
        var res = await _taiChinhService.TaoBaoLuuAsync(request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("bao-luu/{id}/duyet")]
    public async Task<IActionResult> DuyetBaoLuu(int id, [FromBody] DuyetBaoLuuRequest request)
    {
        var res = await _taiChinhService.DuyetBaoLuuAsync(id, request);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("bao-luu/{id}/hoan-tra")]
    public async Task<IActionResult> HoanTraBaoLuu(int id)
    {
        var res = await _taiChinhService.HoanTraBaoLuuAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("bao-luu/{id}")]
    public async Task<IActionResult> XoaBaoLuu(int id)
    {
        var res = await _taiChinhService.XoaBaoLuuKhoaHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    // ==========================================
    // 4. BÁO CÁO THU CHI 4 CẤP (NĂM / KỲ / THÁNG / TUẦN)
    // ==========================================

    [HttpGet("thu-chi-nam/{idNamHoc}")]
    [HttpGet("thu-chi-nam")]
    public async Task<IActionResult> LayThuChiNam([FromRoute] int? idNamHoc, [FromQuery] int? queryIdNamHoc, [FromQuery] int? idCn, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        int finalId = idNamHoc ?? queryIdNamHoc ?? 0;
        var res = await _taiChinhService.LayThuChiNamAsync(targetDnId, idCn, finalId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("thu-chi-ky/{idKyHoc}")]
    [HttpGet("thu-chi-ky")]
    public async Task<IActionResult> LayThuChiKy([FromRoute] int? idKyHoc, [FromQuery] int? queryIdKyHoc, [FromQuery] int? idCn, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        int finalId = idKyHoc ?? queryIdKyHoc ?? 0;
        var res = await _taiChinhService.LayThuChiKyAsync(targetDnId, idCn, finalId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("thu-chi-thang/{idThangHoc}")]
    [HttpGet("thu-chi-thang")]
    public async Task<IActionResult> LayThuChiThang([FromRoute] int? idThangHoc, [FromQuery] int? queryIdThangHoc, [FromQuery] int? idCn, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        int finalId = idThangHoc ?? queryIdThangHoc ?? 0;
        var res = await _taiChinhService.LayThuChiThangAsync(targetDnId, idCn, finalId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("thu-chi-tuan/{idTuanHoc}")]
    [HttpGet("thu-chi-tuan")]
    public async Task<IActionResult> LayThuChiTuan([FromRoute] int? idTuanHoc, [FromQuery] int? queryIdTuanHoc, [FromQuery] int? idCn, [FromQuery] int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        int finalId = idTuanHoc ?? queryIdTuanHoc ?? 0;
        var res = await _taiChinhService.LayThuChiTuanAsync(targetDnId, idCn, finalId);
        return StatusCode(res.StatusCode, res);
    }
}

