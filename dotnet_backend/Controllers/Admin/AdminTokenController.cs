using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.Admin;

/// <summary>
/// Quản lý phiên làm việc, Thu hồi Token & Tài khoản hệ thống dành cho ADMIN
/// </summary>
[ApiController]
[Authorize(Roles = "ADMIN,ROLE_ADMIN")]
public class AdminTokenController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly QuanLyTrungTamDbContext _context;

    public AdminTokenController(
        IAdminService adminService,
        QuanLyTrungTamDbContext context)
    {
        _adminService = adminService;
        _context = context;
    }

    [HttpGet("api/admin/system/tokens")]
    [HttpGet("api/v1/admin/system/tokens")]
    public async Task<IActionResult> LayTatCaTokenDangHoatDong()
    {
        var res = await _adminService.LayDanhSachTokensAsync();
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("api/admin/system/tokens/{id}")]
    [HttpDelete("api/v1/admin/system/tokens/{id}")]
    public async Task<IActionResult> ThuHoiToken(int id)
    {
        var res = await _adminService.ThuHoiTokenAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("api/tai-khoan/{idTk}")]
    public async Task<IActionResult> XoaTaiKhoan(int idTk)
    {
        var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.IdTk == idTk && !t.Xoa);
        if (tk == null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy tài khoản", 404));

        tk.Xoa = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Xóa tài khoản người dùng thành công"));
    }
}
