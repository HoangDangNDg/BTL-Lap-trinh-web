using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ITaiKhoanService _taiKhoanService;

    public AuthController(ITaiKhoanService taiKhoanService)
    {
        _taiKhoanService = taiKhoanService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> DangNhap([FromBody] LoginRequestDto request)
    {
        var result = await _taiKhoanService.DangNhapAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, result);
        }

        // Tự động gán RefreshToken vào HttpOnly Cookie giống hệt logic Java AuthController
        if (!string.IsNullOrEmpty(result.Data?.RefreshToken))
        {
            ThietLapCookieRefreshToken(result.Data.RefreshToken);
        }

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> LamMoiToken()
    {
        Request.Cookies.TryGetValue("refreshToken", out var refreshToken);

        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(ApiResponse<object>.Fail("Không tìm thấy refreshToken trong Cookie", 400));
        }

        var result = await _taiKhoanService.LamMoiTokenAsync(refreshToken);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, result);
        }

        if (!string.IsNullOrEmpty(result.Data?.RefreshToken))
        {
            ThietLapCookieRefreshToken(result.Data.RefreshToken);
        }

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> DangKy([FromBody] TaiKhoan taiKhoan)
    {
        var result = await _taiKhoanService.DangKyAsync(taiKhoan);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("logout")]
    public IActionResult DangXuat()
    {
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            Path = "/"
        });

        return Ok(ApiResponse<object?>.Ok(null, "Đăng xuất thành công"));
    }

    private void ThietLapCookieRefreshToken(string token)
    {
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            SameSite = SameSiteMode.Lax
        });
    }

    /// <summary>
    /// Reset mật khẩu phục vụ dev
    /// </summary>
    [HttpGet("reset-dev-passwords")]
    public async Task<IActionResult> DatLaiMatKhauDev([FromServices] QuanLyTrungTamDbContext context)
    {
        var accounts = await context.TaiKhoans.Where(t => t.IdTk <= 20).ToListAsync();
        string hashed = BCrypt.Net.BCrypt.HashPassword("123456");
        foreach (var a in accounts)
        {
            a.MatKhau = hashed;
        }
        await context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Đã reset mật khẩu thành '123456' cho các tài khoản ID từ 1 đến 20"));
    }

    /// <summary>
    /// Lấy danh sách tài khoản phục vụ dev
    /// </summary>
    [HttpGet("dev/accounts")]
    public async Task<IActionResult> LayDanhSachTaiKhoanDev([FromServices] QuanLyTrungTamDbContext context)
    {
        var accounts = await context.TaiKhoans
            .Take(10)
            .Select(t => new { t.IdTk, t.TenDangNhap, t.IdTaiKhoanVaiTro })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(accounts));
    }
}
