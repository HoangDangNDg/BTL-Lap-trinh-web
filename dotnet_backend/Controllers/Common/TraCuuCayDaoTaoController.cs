using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Controllers.Common;

/// <summary>
/// Controller truy vấn theo nhánh cây phân cấp Đào tạo:
/// DoanhNghiep -> ChiNhanh & NamHoc -> KyHoc -> LopHoc -> KhoaHoc
/// </summary>
[ApiController]
[Route("api/tra-cuu/cay")]
[Route("api/v1/tree-query")]
[Authorize]
public class TraCuuCayDaoTaoController : ControllerBase
{
    private readonly QuanLyTrungTamDbContext _context;

    public TraCuuCayDaoTaoController(QuanLyTrungTamDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. Nhánh Chi nhánh theo Doanh nghiệp: DoanhNghiep -> ChiNhanh
    /// </summary>
    [HttpGet("chi-nhanh")]
    public async Task<IActionResult> LayChiNhanhTheoDoanhNghiep([FromQuery] int? idDn)
    {
        int targetDnId = idDn ?? 1;
        var list = await _context.ChiNhanhs
            .Where(c => c.IdDn == targetDnId)
            .AsNoTracking()
            .Select(cn => new NodeCayDto
            {
                Id = cn.IdCn,
                Ten = cn.TenCn,
                Loai = "CHI_NHANH",
                ParentId = targetDnId
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NodeCayDto>>.Ok(list));
    }

    /// <summary>
    /// 2. Nhánh Năm học theo Doanh nghiệp: DoanhNghiep -> NamHoc
    /// </summary>
    [HttpGet("nam-hoc")]
    public async Task<IActionResult> LayNamHocTheoDoanhNghiep([FromQuery] int? idDn)
    {
        int targetDnId = idDn ?? 1;
        var list = await _context.NamHocs
            .Where(n => n.IdDn == targetDnId && !n.Xoa)
            .OrderByDescending(n => n.NgayBatDau)
            .AsNoTracking()
            .Select(nh => new NodeCayDto
            {
                Id = nh.IdNh,
                Ten = $"Năm học {nh.NamBatDau} - {nh.NamKetThuc}",
                Loai = "NAM_HOC",
                ParentId = targetDnId
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NodeCayDto>>.Ok(list));
    }

    /// <summary>
    /// 3. Nhánh Kỳ học theo Năm học: NamHoc -> KyHoc
    /// </summary>
    [HttpGet("ky-hoc")]
    public async Task<IActionResult> LayKyHocTheoNamHoc([FromQuery] int idNh)
    {
        var list = await _context.KyHocs
            .Where(k => k.IdNh == idNh && !k.Xoa)
            .OrderBy(k => k.NgayBatDau)
            .AsNoTracking()
            .Select(kh => new NodeCayDto
            {
                Id = kh.IdKh,
                Ten = kh.TenKyHoc,
                Loai = "KY_HOC",
                ParentId = idNh
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NodeCayDto>>.Ok(list));
    }

    /// <summary>
    /// 4. Nhánh Lớp học theo Chi nhánh và/hoặc Kỳ học: (ChiNhanh + KyHoc) -> LopHoc
    /// </summary>
    [HttpGet("lop-hoc")]
    public async Task<IActionResult> LayLopHocTheoNhanh(
        [FromQuery] int? idCn,
        [FromQuery] int? idKh,
        [FromQuery] int? idMh)
    {
        var query = _context.LopHocs
            .Include(l => l.ChiNhanh)
            .Include(l => l.GiaoVien)
            .Include(l => l.MonHoc)
            .Where(l => !l.Xoa);

        if (idCn.HasValue) query = query.Where(l => l.IdCn == idCn.Value);
        if (idKh.HasValue) query = query.Where(l => l.IdKh == idKh.Value);
        if (idMh.HasValue) query = query.Where(l => l.IdMh == idMh.Value);

        var list = await query
            .AsNoTracking()
            .Select(l => new LopHocDto
            {
                IdLop = l.IdLop,
                TenLop = l.TenLop,
                IdCn = l.IdCn,
                TenChiNhanh = l.ChiNhanh != null ? l.ChiNhanh.TenCn : null,
                IdKh = l.IdKh,
                IdMh = l.IdMh,
                TenMonHoc = l.MonHoc != null ? l.MonHoc.TenMon : null,
                IdGv = l.IdGv,
                TenGiaoVien = l.GiaoVien != null ? l.GiaoVien.HoTen : null,
                TrangThai = l.TrangThai
            })
            .ToListAsync();

        return Ok(ApiResponse<List<LopHocDto>>.Ok(list));
    }

    /// <summary>
    /// 5. Nhánh Khóa học theo Lớp học: LopHoc -> KhoaHoc
    /// </summary>
    [HttpGet("khoa-hoc")]
    public async Task<IActionResult> LayKhoaHocTheoLop([FromQuery] int idLop)
    {
        var list = await _context.KhoaHocs
            .Where(k => k.IdLop == idLop && !k.Xoa)
            .AsNoTracking()
            .Select(kh => new NodeCayDto
            {
                Id = kh.IdKhoaHoc,
                Ten = kh.TenKhoaHoc,
                Loai = "KHOA_HOC",
                ParentId = idLop
            })
            .ToListAsync();

        return Ok(ApiResponse<List<NodeCayDto>>.Ok(list));
    }

    /// <summary>
    /// 6. Toàn bộ Cây phân cấp Đào tạo của Doanh nghiệp (Treeview)
    /// </summary>
    [HttpGet("toan-bo")]
    [HttpGet("toan-bo/{idDn}")]
    public async Task<IActionResult> LayToanBoCayDaoTao([FromRoute] int? idDn)
    {
        int targetDnId = idDn ?? 1;

        var dn = await _context.DoanhNghieps
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.IdDn == targetDnId && !d.Xoa);

        if (dn == null) return NotFound(ApiResponse<CayPhanCapDaoTaoDto>.Fail("Không tìm thấy doanh nghiệp", 404));

        var chiNhanhs = await _context.ChiNhanhs
            .Where(c => c.IdDn == targetDnId)
            .AsNoTracking()
            .Select(c => new CayPhanCapDaoTaoDto.ChiNhanhNodeDto
            {
                IdCn = c.IdCn,
                TenCn = c.TenCn,
                DiaChi = c.DiaChi,
                Sdt = c.Sdt
            })
            .ToListAsync();

        var namHocs = await _context.NamHocs
            .Where(n => n.IdDn == targetDnId && !n.Xoa)
            .OrderByDescending(n => n.NgayBatDau)
            .AsNoTracking()
            .Select(n => new CayPhanCapDaoTaoDto.NamHocNodeDto
            {
                IdNh = n.IdNh,
                NamBatDau = n.NamBatDau,
                NamKetThuc = n.NamKetThuc,
                DaHoanThanh = n.DaHoanThanh
            })
            .ToListAsync();

        // Nạp kỳ học cho từng năm học
        foreach (var nh in namHocs)
        {
            nh.KyHocs = await _context.KyHocs
                .Where(k => k.IdNh == nh.IdNh && !k.Xoa)
                .AsNoTracking()
                .Select(k => new CayPhanCapDaoTaoDto.KyHocNodeDto
                {
                    IdKh = k.IdKh,
                    TenKyHoc = k.TenKyHoc
                })
                .ToListAsync();
        }

        var result = new CayPhanCapDaoTaoDto
        {
            IdDn = dn.IdDn,
            TenDn = dn.TenDn,
            ChiNhanhs = chiNhanhs,
            NamHocs = namHocs
        };

        return Ok(ApiResponse<CayPhanCapDaoTaoDto>.Ok(result));
    }
}
