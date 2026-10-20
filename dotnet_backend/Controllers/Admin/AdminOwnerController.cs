using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.Admin;

/// <summary>
/// Cấp tài khoản & Quản trị Chủ Doanh nghiệp dành cho ADMIN Hệ thống
/// </summary>
[ApiController]
[Route("api/admin/owners")]
[Route("api/v1/admin/owners")]
[Authorize(Roles = "ADMIN,ROLE_ADMIN")]
public class AdminOwnerController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminOwnerController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpPost]
    public async Task<IActionResult> TaoTaiKhoanChuDoanhNghiep([FromBody] TaoChuDoanhNghiepDto dto)
    {
        var res = await _adminService.TaoTaiKhoanChuDoanhNghiepAsync(dto);
        return StatusCode(res.StatusCode, res);
    }
}
