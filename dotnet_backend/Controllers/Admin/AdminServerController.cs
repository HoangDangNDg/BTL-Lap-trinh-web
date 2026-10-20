using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.Admin;

/// <summary>
/// Giám sát tài nguyên máy chủ, doanh nghiệp và hạ tầng kỹ thuật dành cho ADMIN SERVER
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN,ROLE_ADMIN")]
public class AdminServerController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminServerController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("thong-ke-server")]
    [HttpGet("thong-ke/tong-quan-server")]
    public async Task<IActionResult> LayThongKeServer()
    {
        var res = await _adminService.LayThongKeServerAsync();
        return StatusCode(res.StatusCode, res);
    }
}
