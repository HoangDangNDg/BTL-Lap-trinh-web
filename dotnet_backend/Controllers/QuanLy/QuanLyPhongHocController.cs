using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Quản lý Phòng học tại chi nhánh dành cho QUẢN LÝ CƠ SỞ
/// </summary>
[ApiController]
[Route("api")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyPhongHocController : ControllerBase
{
    private readonly ICoSoVatChatService _coSoVatChatService;

    public QuanLyPhongHocController(ICoSoVatChatService coSoVatChatService)
    {
        _coSoVatChatService = coSoVatChatService;
    }

    [HttpGet("quan-ly/phong-hoc")]
    [HttpGet("phong-hoc")]
    [HttpGet("v1/manager/rooms")]
    public async Task<IActionResult> LayPhongHocTheoChiNhanh([FromQuery] int? idCn)
    {
        var result = await _coSoVatChatService.TimPhongHocTheoChiNhanhAsync(idCn ?? 1);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("chi-nhanh/{idCn}/phong-hoc")]
    public async Task<IActionResult> LayPhongHocTheoChiNhanhPath(int idCn)
    {
        var result = await _coSoVatChatService.TimPhongHocTheoChiNhanhAsync(idCn);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("quan-ly/phong-hoc/{id}")]
    [HttpGet("phong-hoc/{id}")]
    public async Task<IActionResult> LayPhongHocTheoId(int id)
    {
        var result = await _coSoVatChatService.TimPhongHocTheoIdAsync(id);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("quan-ly/phong-hoc")]
    [HttpPost("phong-hoc")]
    [HttpPost("v1/manager/rooms")]
    public async Task<IActionResult> TaoPhongHoc([FromQuery] int? idCn, [FromBody] TaoPhongHocRequest request)
    {
        if (idCn.HasValue) request.IdCn = idCn.Value;
        var result = await _coSoVatChatService.LuuPhongHocAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("chi-nhanh/{idCn}/phong-hoc")]
    public async Task<IActionResult> TaoPhongHocChiNhanhPath(int idCn, [FromBody] TaoPhongHocRequest request)
    {
        request.IdCn = idCn;
        var result = await _coSoVatChatService.LuuPhongHocAsync(request);
        return StatusCode(result.StatusCode, result);
    }

    [HttpDelete("quan-ly/phong-hoc/{id}")]
    [HttpDelete("phong-hoc/{id}")]
    public async Task<IActionResult> XoaPhongHoc(int id)
    {
        var result = await _coSoVatChatService.XoaPhongHocAsync(id);
        return StatusCode(result.StatusCode, result);
    }
}
