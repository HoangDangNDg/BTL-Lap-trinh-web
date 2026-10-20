using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace dotnet_backend.Controllers.Admin;

/// <summary>
/// Quản trị danh sách tài khoản Quản trị viên (Admin Server)
/// </summary>
[ApiController]
[Route("api/admin/quan-tri-vien")]
[Authorize(Roles = "ADMIN,ROLE_ADMIN")]
public class AdminManagementController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminManagementController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> LayDanhSachAdmin()
    {
        var res = await _adminService.LayDanhSachAdminAsync();
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> LayAdminTheoId(int id)
    {
        var res = await _adminService.LayAdminTheoIdAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("me")]
    public async Task<IActionResult> LayAdminHienTai()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claim, out int idAdmin))
        {
            var res = await _adminService.LayAdminTheoIdAsync(idAdmin);
            return StatusCode(res.StatusCode, res);
        }
        return Ok(ApiResponse<AdminDto?>.Ok(null));
    }

    [HttpPost]
    public async Task<IActionResult> TaoMoiAdmin([FromBody] AdminDto dto)
    {
        var res = await _adminService.TaoMoiAdminAsync(dto);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> CapNhatAdmin(int id, [FromBody] AdminDto dto)
    {
        var res = await _adminService.CapNhatAdminAsync(id, dto);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> XoaAdmin(int id)
    {
        var res = await _adminService.XoaAdminAsync(id);
        return StatusCode(res.StatusCode, res);
    }
}
