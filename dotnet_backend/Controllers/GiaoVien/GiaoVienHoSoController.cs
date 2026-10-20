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
/// Hồ sơ cá nhân, Tài khoản, Mật khẩu & Chứng chỉ dành cho GIÁO VIÊN
/// </summary>
[ApiController]
[Route("api/giao-vien/ho-so")]
[Route("api/v1/teacher/profile")]
[Authorize(Roles = "GIAO_VIEN,ROLE_GIAO_VIEN,QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class GiaoVienHoSoController : ControllerBase
{
    private readonly QuanLyTrungTamDbContext _context;

    public GiaoVienHoSoController(QuanLyTrungTamDbContext context)
    {
        _context = context;
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

    private int LayIdTaiKhoanHienTai()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int idTk) ? idTk : 1;
    }

    [HttpGet]
    public async Task<IActionResult> LayHoSoCaNhan()
    {
        int gvId = LayIdGiaoVienHienTai();
        return await LayHoSoTheoId(gvId);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> LayHoSoTheoId(int id)
    {
        var gv = await _context.GiaoViens
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.IdGv == id && !g.Xoa);

        if (gv == null) return NotFound(ApiResponse<HoSoGiaoVienDto>.Fail("Không tìm thấy giáo viên", 404));

        var chiTiet = await _context.ChiTietGvs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdGv == id && !c.Xoa);

        var chungChis = await _context.ChungChiGiaoViens
            .Where(c => c.IdGv == id && !c.Xoa)
            .AsNoTracking()
            .Select(c => new ChungChiGiaoVienDto
            {
                IdChungChi = c.IdChungChi,
                TenChungChi = c.TenChungChi,
                NgayCap = c.NgayCap,
                UrlAnh = c.UrlAnh
            })
            .ToListAsync();

        var chuyenMons = await _context.GiaoVienChuyenMons
            .Include(gc => gc.ChuyenMon)
            .Where(gc => gc.IdGv == id)
            .Select(gc => gc.ChuyenMon != null ? gc.ChuyenMon.TenCm : "")
            .ToListAsync();

        var chiNhanhs = await _context.GiaoVienChiNhanhs
            .Include(gc => gc.ChiNhanh)
            .Where(gc => gc.IdGv == id)
            .Select(gc => gc.ChiNhanh != null ? gc.ChiNhanh.TenCn : "")
            .ToListAsync();

        var tenDangNhap = await _context.TaiKhoanGvs
            .Include(t => t.TaiKhoan)
            .Where(t => t.IdGv == id)
            .Select(t => t.TaiKhoan != null ? t.TaiKhoan.TenDangNhap : "")
            .FirstOrDefaultAsync();

        var dto = new HoSoGiaoVienDto
        {
            IdGv = gv.IdGv,
            HoTen = gv.HoTen,
            GioiTinh = gv.GioiTinh,
            NgaySinh = gv.NgaySinh,
            Sdt = gv.Sdt,
            Email = gv.Email,
            Cccd = chiTiet?.Cccd?.ToString(),
            DiaChi = chiTiet?.DiaChi,
            TenDangNhap = tenDangNhap,
            ChungChis = chungChis,
            ChuyenMons = chuyenMons,
            ChiNhanhs = chiNhanhs
        };

        return Ok(ApiResponse<HoSoGiaoVienDto>.Ok(dto));
    }

    [HttpPut]
    public async Task<IActionResult> CapNhatHoSoCaNhan([FromBody] CapNhatHoSoGiaoVienDto req)
    {
        int gvId = LayIdGiaoVienHienTai();
        return await CapNhatHoSoTheoId(gvId, req);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> CapNhatHoSoTheoId(int id, [FromBody] CapNhatHoSoGiaoVienDto req)
    {
        var gv = await _context.GiaoViens.FirstOrDefaultAsync(g => g.IdGv == id && !g.Xoa);
        if (gv == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy giáo viên", 404));

        if (!string.IsNullOrWhiteSpace(req.HoTen)) gv.HoTen = req.HoTen.Trim();
        if (req.GioiTinh != null) gv.GioiTinh = req.GioiTinh;
        if (req.NgaySinh.HasValue) gv.NgaySinh = req.NgaySinh;
        if (req.Sdt != null) gv.Sdt = req.Sdt.Trim();
        if (req.Email != null) gv.Email = req.Email.Trim();

        var chiTiet = await _context.ChiTietGvs.FirstOrDefaultAsync(c => c.IdGv == id && !c.Xoa);
        if (chiTiet == null)
        {
            chiTiet = new ChiTietGv { IdGv = id, Xoa = false, TrangThaiHoatDong = true };
            _context.ChiTietGvs.Add(chiTiet);
        }

        if (req.Cccd != null && long.TryParse(req.Cccd.Trim(), out long parsedCccd)) chiTiet.Cccd = parsedCccd;
        if (req.DiaChi != null) chiTiet.DiaChi = req.DiaChi.Trim();

        await _context.SaveChangesAsync();
        return await LayHoSoTheoId(id);
    }

    [HttpPut("doi-mat-khau")]
    public async Task<IActionResult> DoiMatKhau([FromBody] DoiMatKhauDto req)
    {
        int idTk = LayIdTaiKhoanHienTai();
        var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.IdTk == idTk && !t.Xoa);
        if (tk == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy tài khoản", 404));

        if (!BCrypt.Net.BCrypt.Verify(req.MatKhauCu, tk.MatKhau))
        {
            return BadRequest(ApiResponse<bool>.Fail("Mật khẩu cũ không chính xác", 400));
        }

        tk.MatKhau = BCrypt.Net.BCrypt.HashPassword(req.MatKhauMoi);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đổi mật khẩu thành công"));
    }

    /// <summary>
    /// Cập nhật thông tin tài khoản đăng nhập của giáo viên
    /// </summary>
    [HttpPut("tai-khoan")]
    public async Task<IActionResult> CapNhatTaiKhoan([FromBody] CapNhatTaiKhoanDto req)
    {
        int idTk = LayIdTaiKhoanHienTai();
        var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.IdTk == idTk && !t.Xoa);
        if (tk == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy tài khoản", 404));

        if (!string.IsNullOrWhiteSpace(req.TenDangNhap) && req.TenDangNhap.Trim() != tk.TenDangNhap)
        {
            var exists = await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap == req.TenDangNhap.Trim() && t.IdTk != idTk && !t.Xoa);
            if (exists) return Conflict(ApiResponse<bool>.Fail("Tên đăng nhập đã tồn tại trên hệ thống", 409));
            tk.TenDangNhap = req.TenDangNhap.Trim();
        }

        if (!string.IsNullOrWhiteSpace(req.MatKhauMoi))
        {
            if (string.IsNullOrWhiteSpace(req.MatKhauCu)) return BadRequest(ApiResponse<bool>.Fail("Vui lòng nhập mật khẩu cũ để đổi mật khẩu", 400));
            if (!BCrypt.Net.BCrypt.Verify(req.MatKhauCu, tk.MatKhau)) return BadRequest(ApiResponse<bool>.Fail("Mật khẩu cũ không chính xác", 400));
            tk.MatKhau = BCrypt.Net.BCrypt.HashPassword(req.MatKhauMoi.Trim());
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật tài khoản thành công"));
    }

    [HttpGet("certificates")]
    public async Task<IActionResult> LayDanhSachChungChi()
    {
        int gvId = LayIdGiaoVienHienTai();
        var list = await _context.ChungChiGiaoViens
            .Where(c => c.IdGv == gvId && !c.Xoa)
            .AsNoTracking()
            .Select(c => new ChungChiGiaoVienDto
            {
                IdChungChi = c.IdChungChi,
                TenChungChi = c.TenChungChi,
                NgayCap = c.NgayCap,
                UrlAnh = c.UrlAnh
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ChungChiGiaoVienDto>>.Ok(list));
    }

    [HttpPost("chung-chi")]
    [HttpPost("certificates")]
    public async Task<IActionResult> ThemChungChi([FromBody] ChungChiRequestDto req)
    {
        int gvId = LayIdGiaoVienHienTai();
        var cc = new ChungChiGiaoVien
        {
            IdGv = gvId,
            TenChungChi = req.TenChungChi.Trim(),
            NgayCap = req.NgayCap,
            UrlAnh = req.UrlAnh,
            IdDn = 1,
            Xoa = false
        };

        _context.ChungChiGiaoViens.Add(cc);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<ChungChiGiaoVienDto>.Ok(new ChungChiGiaoVienDto
        {
            IdChungChi = cc.IdChungChi,
            TenChungChi = cc.TenChungChi,
            NgayCap = cc.NgayCap,
            UrlAnh = cc.UrlAnh
        }, "Thêm chứng chỉ thành công"));
    }

    /// <summary>
    /// Sửa thông tin chứng chỉ cá nhân của giáo viên
    /// </summary>
    [HttpPut("chung-chi/{idChungChi}")]
    [HttpPut("certificates/{idChungChi}")]
    public async Task<IActionResult> SuaChungChi(int idChungChi, [FromBody] ChungChiRequestDto req)
    {
        int gvId = LayIdGiaoVienHienTai();
        var cc = await _context.ChungChiGiaoViens.FirstOrDefaultAsync(c => c.IdChungChi == idChungChi && !c.Xoa);
        if (cc == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy chứng chỉ", 404));
        if (cc.IdGv != gvId) return StatusCode(403, ApiResponse<bool>.Fail("Chứng chỉ không thuộc quyền sở hữu của bạn", 403));

        if (!string.IsNullOrWhiteSpace(req.TenChungChi)) cc.TenChungChi = req.TenChungChi.Trim();
        if (req.NgayCap.HasValue) cc.NgayCap = req.NgayCap;
        if (req.UrlAnh != null) cc.UrlAnh = req.UrlAnh;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<ChungChiGiaoVienDto>.Ok(new ChungChiGiaoVienDto
        {
            IdChungChi = cc.IdChungChi,
            TenChungChi = cc.TenChungChi,
            NgayCap = cc.NgayCap,
            UrlAnh = cc.UrlAnh
        }, "Cập nhật chứng chỉ thành công"));
    }

    [HttpDelete("chung-chi/{idChungChi}")]
    [HttpDelete("certificates/{idChungChi}")]
    public async Task<IActionResult> XoaChungChi(int idChungChi)
    {
        int gvId = LayIdGiaoVienHienTai();
        var cc = await _context.ChungChiGiaoViens.FirstOrDefaultAsync(c => c.IdChungChi == idChungChi && !c.Xoa);
        if (cc == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy chứng chỉ", 404));
        if (cc.IdGv != gvId) return StatusCode(403, ApiResponse<bool>.Fail("Chứng chỉ không thuộc quyền sở hữu của bạn", 403));

        cc.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa chứng chỉ thành công"));
    }
}
