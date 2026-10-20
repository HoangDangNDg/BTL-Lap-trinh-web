using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Quản lý Nhân sự / Nhân công tại chi nhánh dành cho QUẢN LÝ CƠ SỞ
/// </summary>
[ApiController]
[Route("api/quan-ly/nhan-su")]
[Route("api/v1/manager/other-staffs")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyNhanSuController : ControllerBase
{
    private readonly INhanSuService _nhanSuService;

    public QuanLyNhanSuController(INhanSuService nhanSuService)
    {
        _nhanSuService = nhanSuService;
    }

    [HttpGet]
    public async Task<IActionResult> LayDanhSachNhanVienChiNhanh([FromQuery] int? idCn)
    {
        var result = await _nhanSuService.TimNhanCongTheoChiNhanhAsync(idCn ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    public async Task<IActionResult> TaoNhanVienChiNhanh([FromQuery] int? idCn, [FromBody] TaoNhanCongRequest request)
    {
        if (idCn.HasValue) request.IdCn = idCn.Value;
        var result = await _nhanSuService.LuuNhanCongAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> CapNhatNhanVienChiNhanh(int id, [FromBody] TaoNhanCongRequest request)
    {
        var result = await _nhanSuService.CapNhatNhanCongAsync(id, request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> XoaNhanVienChiNhanh(int id)
    {
        var result = await _nhanSuService.XoaNhanCongAsync(id);
        return StatusCode(result.StatusCode, result);
    }
}
