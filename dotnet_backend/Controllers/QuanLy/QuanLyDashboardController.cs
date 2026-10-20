using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Dashboard dành cho QUẢN LÝ CHI NHÁNH / CƠ SỞ
/// </summary>
[ApiController]
[Route("api/quan-ly")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyDashboardController : ControllerBase
{
    private readonly QuanLyTrungTamDbContext _context;

    public QuanLyDashboardController(QuanLyTrungTamDbContext context)
    {
        _context = context;
    }

    [HttpGet("tong-quan")]
    public async Task<IActionResult> LayTongQuanCoSo([FromQuery] int? idCn)
    {
        int targetCnId = idCn ?? 1;

        var cn = await _context.ChiNhanhs.FirstOrDefaultAsync(c => c.IdCn == targetCnId);
        string tenCn = cn?.TenCn ?? "Chi nhánh cơ sở";

        var lopDangMo = await _context.LopHocs.CountAsync(l => l.IdCn == targetCnId && !l.Xoa);
        var phongHoc = await _context.PhongHocs.CountAsync(p => p.IdCn == targetCnId && !p.Xoa);
        
        var hocSinh = await _context.HocSinhs
            .Where(h => !h.Xoa && _context.DangKyHocs.Any(dk => dk.IdHs == h.IdHs && !dk.Xoa && dk.LopHoc != null && dk.LopHoc.IdCn == targetCnId))
            .CountAsync();

        var giaoVien = await _context.GiaoVienChiNhanhs
            .Where(g => g.IdCn == targetCnId)
            .Select(g => g.IdGv)
            .Distinct()
            .CountAsync();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var caHocHomNay = await _context.BuoiHocs
            .CountAsync(b => !b.Xoa && b.NgayHoc == today && b.LopHoc != null && b.LopHoc.IdCn == targetCnId);

        var dto = new ThongKeChiNhanhDto
        {
            IdCn = targetCnId,
            TenChiNhanh = tenCn,
            LopDangMo = lopDangMo,
            PhongHocHoatDong = phongHoc,
            HocSinhCoSo = hocSinh,
            GiaoVienDay = giaoVien,
            CaHocHomNay = caHocHomNay
        };

        return Ok(ApiResponse<ThongKeChiNhanhDto>.Ok(dto));
    }
}
