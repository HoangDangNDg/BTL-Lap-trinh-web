using dotnet_backend.Common;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers.QuanLy;

/// <summary>
/// Ma trận Xếp lịch tuần, Khung lịch cố định & Buổi học dành cho QUẢN LÝ CƠ SỞ & CHỦ DOANH NGHIỆP
/// </summary>
[ApiController]
[Route("api/quan-ly/thoi-khoa-bieu")]
[Route("api/v1/manager/schedules")]
[Authorize(Roles = "QUAN_LY,ROLE_QUAN_LY,CHU_DOANH_NGHIEP,ROLE_CHU_DOANH_NGHIEP,ADMIN,ROLE_ADMIN")]
public class QuanLyThoiKhoaBieuController : ControllerBase
{
    private readonly IDaoTaoService _daoTaoService;

    public QuanLyThoiKhoaBieuController(IDaoTaoService daoTaoService)
    {
        _daoTaoService = daoTaoService;
    }

    [HttpGet("tuan")]
    [HttpGet("weekly")]
    public async Task<IActionResult> LayTkbTheoTuan(
        [FromQuery] int? idLop,
        [FromQuery] int? idGv,
        [FromQuery] int? idPhong,
        [FromQuery] int? idKy,
        [FromQuery] int? tuan,
        [FromQuery] int? week)
    {
        int? targetWeek = week ?? tuan;

        if (idLop.HasValue && idLop.Value > 0)
        {
            var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoLopAsync(idLop.Value, targetWeek);
            return StatusCode(res.StatusCode, res);
        }

        if (idGv.HasValue && idGv.Value > 0)
        {
            var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoGiaoVienAsync(idGv.Value, targetWeek);
            return StatusCode(res.StatusCode, res);
        }

        if (idPhong.HasValue && idPhong.Value > 0)
        {
            var res = await _daoTaoService.LayThoiKhoaBieuTuanTheoPhongHocAsync(idPhong.Value, targetWeek);
            return StatusCode(res.StatusCode, res);
        }

        var defaultRes = await _daoTaoService.LayThoiKhoaBieuTuanTheoLopAsync(1, targetWeek);
        return StatusCode(defaultRes.StatusCode, defaultRes);
    }

    [HttpPost]
    [HttpPost("single")]
    public async Task<IActionResult> LuuThoiKhoaBieu([FromBody] ThoiKhoaBieuTuan tkb)
    {
        var res = await _daoTaoService.LuuThoiKhoaBieuTuanAsync(tkb);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("batch-save")]
    [HttpPost("weekly/batch")]
    public async Task<IActionResult> LuuDanhSachTkb([FromBody] List<ThoiKhoaBieuTuan> danhSachTkb)
    {
        var res = await _daoTaoService.LuuThoiKhoaBieuHangLoatAsync(danhSachTkb);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> XoaThoiKhoaBieu(int id)
    {
        var res = await _daoTaoService.XoaThoiKhoaBieuTuanAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("fixed")]
    public async Task<IActionResult> LayKhungLichCoDinh([FromQuery] int? idLop, [FromQuery] int? idPhong)
    {
        if (idLop.HasValue && idLop.Value > 0)
        {
            var res = await _daoTaoService.LayKhungLichCoDinhTheoLopAsync(idLop.Value);
            return StatusCode(res.StatusCode, res);
        }

        if (idPhong.HasValue && idPhong.Value > 0)
        {
            var res = await _daoTaoService.LayKhungLichCoDinhTheoPhongAsync(idPhong.Value);
            return StatusCode(res.StatusCode, res);
        }

        var defaultRes = await _daoTaoService.LayKhungLichCoDinhTheoLopAsync(1);
        return StatusCode(defaultRes.StatusCode, defaultRes);
    }

    [HttpPost("fixed")]
    public async Task<IActionResult> TaoKhungLichCoDinh(
        [FromQuery] int? idLop,
        [FromQuery] int? idPhong,
        [FromBody] KhungLichHocCoDinh lich)
    {
        if (idLop.HasValue && idLop.Value > 0) lich.IdLop = idLop.Value;
        if (idPhong.HasValue && idPhong.Value > 0) lich.IdPhong = idPhong.Value;

        var res = await _daoTaoService.LuuKhungLichCoDinhAsync(lich);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("fixed/{id}")]
    public async Task<IActionResult> XoaKhungLichCoDinh(int id)
    {
        var res = await _daoTaoService.XoaKhungLichCoDinhAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> LayDanhSachBuoiHoc([FromQuery] int? idLop, [FromQuery] int? idKhoaHoc, [FromQuery] int? idPhong)
    {
        if (idLop.HasValue && idLop.Value > 0)
        {
            var res = await _daoTaoService.LayDanhSachBuoiHocTheoLopAsync(idLop.Value);
            return StatusCode(res.StatusCode, res);
        }

        if (idKhoaHoc.HasValue && idKhoaHoc.Value > 0)
        {
            var res = await _daoTaoService.LayDanhSachBuoiHocTheoKhoaHocAsync(idKhoaHoc.Value);
            return StatusCode(res.StatusCode, res);
        }

        if (idPhong.HasValue && idPhong.Value > 0)
        {
            var res = await _daoTaoService.LayDanhSachBuoiHocTheoPhongAsync(idPhong.Value);
            return StatusCode(res.StatusCode, res);
        }

        var defaultRes = await _daoTaoService.LayDanhSachBuoiHocTheoLopAsync(1);
        return StatusCode(defaultRes.StatusCode, defaultRes);
    }

    [HttpGet("sessions/{id}")]
    public async Task<IActionResult> LayChiTietBuoiHoc(int id)
    {
        var res = await _daoTaoService.LayBuoiHocTheoIdAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> TaoBuoiHoc(
        [FromQuery] int? idLop,
        [FromQuery] int? idPhong,
        [FromQuery] int? idTh,
        [FromBody] BuoiHoc session)
    {
        if (idLop.HasValue && idLop.Value > 0) session.IdLop = idLop.Value;
        if (idPhong.HasValue && idPhong.Value > 0) session.IdPhong = idPhong.Value;

        var res = await _daoTaoService.LuuBuoiHocAsync(session);
        return StatusCode(res.StatusCode, res);
    }

    [HttpDelete("sessions/{id}")]
    public async Task<IActionResult> XoaBuoiHoc(int id)
    {
        var res = await _daoTaoService.XoaBuoiHocAsync(id);
        return StatusCode(res.StatusCode, res);
    }

    [HttpPost("classes/{idLop}/weeks/{idTuan}/generate-sessions")]
    [HttpPost("tu-dong-sinh-buoi")]
    public async Task<IActionResult> TuDongSinhBuoiHoc([FromRoute] int? idLop, [FromRoute] int? idTuan, [FromQuery] int? lopId, [FromQuery] int? tuanId)
    {
        int targetLop = idLop ?? lopId ?? 1;
        int targetTuan = idTuan ?? tuanId ?? 1;

        var res = await _daoTaoService.TuDongSinhBuoiHocTheoTuanAsync(targetLop, targetTuan);
        return StatusCode(res.StatusCode, res);
    }

    [HttpGet("enrollments")]
    [HttpGet("dang-ky-hoc")]
    public async Task<IActionResult> LayDanhSachDangKy([FromQuery] int? idLop, [FromQuery] int? idHs)
    {
        if (idLop.HasValue && idLop.Value > 0)
        {
            var res = await _daoTaoService.LayDanhSachDangKyTheoLopAsync(idLop.Value);
            return StatusCode(res.StatusCode, res);
        }

        if (idHs.HasValue && idHs.Value > 0)
        {
            var res = await _daoTaoService.LayDanhSachDangKyTheoHocSinhAsync(idHs.Value);
            return StatusCode(res.StatusCode, res);
        }

        var defaultRes = await _daoTaoService.LayDanhSachDangKyTheoLopAsync(1);
        return StatusCode(defaultRes.StatusCode, defaultRes);
    }
}
