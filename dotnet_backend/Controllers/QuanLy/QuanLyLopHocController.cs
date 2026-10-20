using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Quản lý Lớp học & Phân công Giáo viên dành cho QUẢN LÝ CƠ SỞ
/// </summary>
[ApiController]
[Route("api/quan-ly/lop-hoc")]
[Route("api/v1/manager/classes")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyLopHocController : ControllerBase
{
    private readonly IDaoTaoService _daoTaoService;

    public QuanLyLopHocController(IDaoTaoService daoTaoService)
    {
        _daoTaoService = daoTaoService;
    }

    [HttpGet]
    [HttpGet("lop-hoc")]
    public async Task<IActionResult> LayDanhSachLopHoc(
        [FromQuery] int? idCn,
        [FromQuery] int? idKh,
        [FromQuery] int? idKyHoc,
        [FromQuery] int? idBoMon,
        [FromQuery] int? idMh,
        [FromQuery] int? idGv,
        [FromQuery] string? keyword,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20)
    {
        int? effectiveKh = idKh ?? idKyHoc;
        var result = await _daoTaoService.LayDanhSachLopHocAsync(idCn ?? 1, effectiveKh, idMh, idGv, keyword, pageIndex, pageSize);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("{id}")]
    [HttpGet("lop-hoc/{id}")]
    public async Task<IActionResult> LayLopHocTheoId(int id)
    {
        var result = await _daoTaoService.LayLopHocTheoIdAsync(id);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    [HttpPost("lop-hoc")]
    public async Task<IActionResult> TaoLopHoc([FromBody] TaoLopHocRequest request)
    {
        var result = await _daoTaoService.TaoLopHocAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("{id}")]
    [HttpPut("lop-hoc/{id}")]
    public async Task<IActionResult> CapNhatLopHoc(int id, [FromBody] CapNhatLopHocRequest request)
    {
        var result = await _daoTaoService.CapNhatLopHocAsync(id, request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("{id}/assign-teacher")]
    [HttpPost("lop-hoc/{id}/assign-teacher")]
    public async Task<IActionResult> PhanCongGiaoVien(int id, [FromBody] PhanCongGiaoVienDto dto)
    {
        var result = await _daoTaoService.PhanCongGiaoVienAsync(id, dto.IdGv);
        return StatusCode(result.StatusCode, result);
    }
}
