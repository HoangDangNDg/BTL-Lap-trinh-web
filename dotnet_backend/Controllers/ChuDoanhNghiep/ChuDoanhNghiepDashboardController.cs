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
/// Dashboard & Thống kê toàn chuỗi dành cho CHỦ DOANH NGHIỆP, ADMIN
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN,QUAN_LY,ROLE_QUAN_LY,GIAO_VIEN,ROLE_GIAO_VIEN,CHU_CO_DONG,ROLE_CHU_CO_DONG")]
public class ChuDoanhNghiepDashboardController : ControllerBase
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ICoSoVatChatService _coSoVatChatService;

    public ChuDoanhNghiepDashboardController(
        QuanLyTrungTamDbContext context,
        ICoSoVatChatService coSoVatChatService)
    {
        _context = context;
        _coSoVatChatService = coSoVatChatService;
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

    [HttpGet("tong-quan")]
    [HttpGet("{idDn}/tong-quan")]
    [HttpGet("doanh-nghiep/{idDn}/tong-quan")]
    public async Task<IActionResult> LayTongQuanChuoi(int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);

        int tongHocSinh = await _context.HocSinhs.CountAsync(h => !h.Xoa && h.IdDn == targetDnId);
        int tongGiaoVien = await _context.GiaoViens.CountAsync(g => !g.Xoa && g.IdDn == targetDnId);
        int tongChiNhanh = await _context.ChiNhanhs.CountAsync(c => c.IdDn == targetDnId);
        int tongLopHoc = await _context.LopHocs.CountAsync(l => !l.Xoa && l.IdDn == targetDnId);

        decimal tongDoanhThu = await _context.PhieuThuHocPhis
            .Where(p => !p.Xoa && p.IdDn == targetDnId)
            .SumAsync(p => (decimal?)p.SoTienThu) ?? 0;

        var data = new
        {
            tongDoanhThu = tongDoanhThu.ToString("N0") + " đ",
            tongHocSinh,
            tongGiaoVien,
            tongChiNhanh,
            tongLopHoc,
            tangTruongDoanhThu = "+14.5%"
        };

        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("doanh-nghiep/{idDn}/thong-ke-tong-quan")]
    [HttpGet("{idDn}/thong-ke-tong-quan")]
    [HttpGet("thong-ke/doanh-nghiep/{idDn}")]
    public async Task<IActionResult> LayThongKeTongQuan(int idDn, [FromQuery] int? idNamHoc, [FromQuery] int? idKyHoc)
    {
        int tongHs = await _context.HocSinhs.CountAsync(h => !h.Xoa && h.IdDn == idDn);
        int tongGv = await _context.GiaoViens.CountAsync(g => !g.Xoa && g.IdDn == idDn);
        int tongLop = await _context.LopHocs.CountAsync(l => !l.Xoa && l.IdDn == idDn && (!idKyHoc.HasValue || l.IdKh == idKyHoc.Value));

        decimal thu = await _context.PhieuThuHocPhis.Where(p => !p.Xoa && p.IdDn == idDn).SumAsync(p => (decimal?)p.SoTienThu) ?? 0;
        decimal chi = await _context.SoQuyThuChis.Where(s => !s.Xoa && s.LoaiGiaoDich == "CHI").SumAsync(s => (decimal?)s.SoTien) ?? 0;

        string tenNh = "";
        if (idNamHoc.HasValue && idNamHoc.Value > 0)
        {
            var nh = await _context.NamHocs.FirstOrDefaultAsync(n => n.IdNh == idNamHoc.Value);
            if (nh != null) tenNh = $"{nh.NamBatDau}-{nh.NamKetThuc}";
        }

        string tenKh = "";
        if (idKyHoc.HasValue && idKyHoc.Value > 0)
        {
            var kh = await _context.KyHocs.FirstOrDefaultAsync(k => k.IdKh == idKyHoc.Value);
            if (kh != null) tenKh = kh.TenKyHoc;
        }

        var summary = new
        {
            idDn,
            idNamHoc,
            idKyHoc,
            tenNamHoc = tenNh,
            tenKyHoc = tenKh,
            tongHocSinh = tongHs,
            tongGiaoVien = tongGv,
            tongGiaoVienHoatDong = tongGv,
            tongLopHoc = tongLop,
            tongThu = thu,
            tongChi = chi,
            loiNhuan = thu - chi
        };

        return Ok(ApiResponse<object>.Ok(summary));
    }

    [HttpGet("{idDn}/nam-hoc")]
    [HttpGet("nam-hoc")]
    [HttpGet("doanh-nghiep/{idDn}/nam-hoc")]
    public async Task<IActionResult> LayDanhSachNamHoc(int? idDn)
    {
        int targetDnId = ResolveTargetDnId(idDn);
        var res = await _coSoVatChatService.TimNamHocTheoDoanhNghiepAsync(targetDnId);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("nam-hoc/{idNh}/ky-hoc")]
    [HttpGet("doanh-nghiep/nam-hoc/{idNh}/ky-hoc")]
    public async Task<IActionResult> LayKyHocTheoNamHoc(int idNh)
    {
        var res = await _coSoVatChatService.TimKyHocTheoNamHocAsync(idNh);
        return StatusCode(res.StatusCode, res);
    }
}
