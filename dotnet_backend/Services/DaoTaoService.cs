using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class DaoTaoService : IDaoTaoService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<DaoTaoService> _logger;

    public DaoTaoService(QuanLyTrungTamDbContext context, ILogger<DaoTaoService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách lớp học phân trang theo bộ lọc chi nhánh, khóa học, môn học, giáo viên và từ khóa
    /// </summary>
    public async Task<ApiResponse<PagedResult<LopHocDto>>> LayDanhSachLopHocAsync(
        int? idCn, int? idKh, int? idMh, int? idGv, string? keyword, int page, int pageSize)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.LopHocs
                .Include(l => l.ChiNhanh)
                .Include(l => l.KyHoc)
                    .ThenInclude(k => k!.NamHoc)
                .Include(l => l.GiaoVien)
                .Include(l => l.MonHoc)
                    .ThenInclude(m => m!.BoMon)
                .Where(l => !l.Xoa)
                .AsNoTracking();

            if (idCn.HasValue && idCn.Value > 0)
            {
                query = query.Where(l => l.IdCn == idCn.Value);
            }

            if (idKh.HasValue && idKh.Value > 0)
            {
                query = query.Where(l => l.IdKh == idKh.Value);
            }

            if (idMh.HasValue && idMh.Value > 0)
            {
                query = query.Where(l => l.IdMh == idMh.Value);
            }

            if (idGv.HasValue && idGv.Value > 0)
            {
                query = query.Where(l => l.IdGv == idGv.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                string kw = keyword.Trim().ToLower();
                query = query.Where(l => l.TenLop.ToLower().Contains(kw) ||
                                         (l.MonHoc != null && l.MonHoc.TenMon.ToLower().Contains(kw)) ||
                                         (l.GiaoVien != null && l.GiaoVien.HoTen.ToLower().Contains(kw)));
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.IdLop)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new LopHocDto
                {
                    IdLop = l.IdLop,
                    TenLop = l.TenLop,
                    SiSoToiDa = l.SiSoToiDa,
                    TrangThai = l.TrangThai,
                    IdChiNhanh = l.IdCn,
                    TenChiNhanh = l.ChiNhanh != null ? l.ChiNhanh.TenCn : "Chưa xác định",
                    IdGiaoVien = l.IdGv,
                    TenGiaoVien = l.GiaoVien != null ? l.GiaoVien.HoTen : "Chưa phân công",
                    IdMonHoc = l.IdMh,
                    TenMonHoc = l.MonHoc != null ? l.MonHoc.TenMon : "Chưa chọn môn",
                    IdBoMon = l.MonHoc != null ? l.MonHoc.IdBoMon : null,
                    TenBoMon = (l.MonHoc != null && l.MonHoc.BoMon != null) ? l.MonHoc.BoMon.TenBoMon : null,
                    IdKyHoc = l.IdKh,
                    TenKyHoc = l.KyHoc != null ? l.KyHoc.TenKyHoc : $"Kỳ #{l.IdKh}",
                    IdNamHoc = l.KyHoc != null ? l.KyHoc.IdNh : null,
                    TenNamHoc = (l.KyHoc != null && l.KyHoc.NamHoc != null) ? $"{l.KyHoc.NamHoc.NamBatDau} - {l.KyHoc.NamHoc.NamKetThuc}" : null,
                    IdDn = l.IdDn
                })
                .ToListAsync();

            var result = new PagedResult<LopHocDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = page,
                PageSize = pageSize
            };

            return ApiResponse<PagedResult<LopHocDto>>.Ok(result, "Lấy danh sách lớp học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách lớp học");
            return ApiResponse<PagedResult<LopHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tìm thông tin chi tiết của một lớp học theo ID
    /// </summary>
    public async Task<ApiResponse<LopHocDto>> LayLopHocTheoIdAsync(int idLop)
    {
        try
        {
            var l = await _context.LopHocs
                .Include(x => x.ChiNhanh)
                .Include(x => x.KyHoc)
                .Include(x => x.GiaoVien)
                .Include(x => x.MonHoc)
                .FirstOrDefaultAsync(x => x.IdLop == idLop && !x.Xoa);

            if (l == null)
            {
                return ApiResponse<LopHocDto>.Fail($"Không tìm thấy lớp học với ID {idLop}", 404);
            }

            var dto = new LopHocDto
            {
                IdLop = l.IdLop,
                TenLop = l.TenLop,
                SiSoToiDa = l.SiSoToiDa,
                TrangThai = l.TrangThai,
                IdChiNhanh = l.IdCn,
                TenChiNhanh = l.ChiNhanh?.TenCn ?? "Chưa xác định",
                IdGiaoVien = l.IdGv,
                TenGiaoVien = l.GiaoVien?.HoTen ?? "Chưa phân công",
                IdMonHoc = l.IdMh,
                TenMonHoc = l.MonHoc?.TenMon ?? "Chưa chọn môn",
                IdKyHoc = l.IdKh,
                TenKyHoc = l.KyHoc?.TenKyHoc ?? $"Kỳ #{l.IdKh}",
                IdDn = l.IdDn
            };

            return ApiResponse<LopHocDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết lớp học #{IdLop}", idLop);
            return ApiResponse<LopHocDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo mới một lớp học
    /// </summary>
    public async Task<ApiResponse<LopHocDto>> TaoLopHocAsync(TaoLopHocRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.TenLop))
            {
                return ApiResponse<LopHocDto>.Fail("Tên lớp học không được để trống", 400);
            }

            var lop = new LopHoc
            {
                TenLop = request.TenLop.Trim(),
                IdCn = request.IdCn,
                IdKh = request.IdKh,
                IdMh = request.IdMh,
                IdGv = request.IdGv,
                SiSoToiDa = request.SiSoToiDa ?? 30,
                TrangThai = request.TrangThai ?? "DangMo",
                IdDn = request.IdDn ?? 1,
                Xoa = false
            };

            _context.LopHocs.Add(lop);
            await _context.SaveChangesAsync();

            return await LayLopHocTheoIdAsync(lop.IdLop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo lớp học mới: {TenLop}", request.TenLop);
            return ApiResponse<LopHocDto>.Fail("Lỗi tạo mới: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật thông tin của lớp học hiện có
    /// </summary>
    public async Task<ApiResponse<LopHocDto>> CapNhatLopHocAsync(int idLop, CapNhatLopHocRequest request)
    {
        try
        {
            var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == idLop && !l.Xoa);
            if (lop == null)
            {
                return ApiResponse<LopHocDto>.Fail($"Không tìm thấy lớp học với ID {idLop}", 404);
            }

            if (!string.IsNullOrWhiteSpace(request.TenLop))
            {
                lop.TenLop = request.TenLop.Trim();
            }

            if (request.IdCn.HasValue && request.IdCn.Value > 0)
            {
                lop.IdCn = request.IdCn.Value;
            }

            if (request.IdKh.HasValue && request.IdKh.Value > 0)
            {
                lop.IdKh = request.IdKh.Value;
            }

            if (request.IdMh.HasValue && request.IdMh.Value > 0)
            {
                lop.IdMh = request.IdMh.Value;
            }

            if (request.IdGv.HasValue)
            {
                lop.IdGv = request.IdGv.Value > 0 ? request.IdGv.Value : null;
            }

            if (request.SiSoToiDa.HasValue && request.SiSoToiDa.Value > 0)
            {
                lop.SiSoToiDa = request.SiSoToiDa.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.TrangThai))
            {
                lop.TrangThai = request.TrangThai;
            }

            await _context.SaveChangesAsync();
            return await LayLopHocTheoIdAsync(idLop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật lớp học #{IdLop}", idLop);
            return ApiResponse<LopHocDto>.Fail("Lỗi cập nhật: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm một lớp học
    /// </summary>
    public async Task<ApiResponse<bool>> XoaLopHocAsync(int idLop)
    {
        try
        {
            var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == idLop && !l.Xoa);
            if (lop == null)
            {
                return ApiResponse<bool>.Fail($"Không tìm thấy lớp học với ID {idLop}", 404);
            }

            lop.Xoa = true;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Xóa lớp học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa lớp học #{IdLop}", idLop);
            return ApiResponse<bool>.Fail("Lỗi xóa: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Phân công giáo viên chủ nhiệm hoặc giảng dạy chính cho lớp học
    /// </summary>
    public async Task<ApiResponse<LopHocDto>> PhanCongGiaoVienAsync(int idLop, int idGv)
    {
        try
        {
            var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == idLop && !l.Xoa);
            if (lop == null)
            {
                return ApiResponse<LopHocDto>.Fail($"Không tìm thấy lớp học với ID {idLop}", 404);
            }

            var gv = await _context.GiaoViens.FirstOrDefaultAsync(g => g.IdGv == idGv && !g.Xoa);
            if (gv == null)
            {
                return ApiResponse<LopHocDto>.Fail($"Không tìm thấy giáo viên với ID {idGv}", 404);
            }

            lop.IdGv = idGv;
            await _context.SaveChangesAsync();

            return await LayLopHocTheoIdAsync(idLop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi phân công giáo viên {IdGv} cho lớp {IdLop}", idGv, idLop);
            return ApiResponse<LopHocDto>.Fail("Lỗi phân công: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách khóa học theo bộ lọc môn học, bộ môn và lớp học
    /// </summary>
    public async Task<ApiResponse<List<KhoaHocDto>>> LayDanhSachKhoaHocAsync(int? idMh, int? idBoMon, int? idLop)
    {
        try
        {
            var query = _context.KhoaHocs
                .Include(k => k.LopHoc)
                .Where(k => !k.Xoa)
                .AsNoTracking();

            if (idLop.HasValue && idLop.Value > 0)
            {
                query = query.Where(k => k.IdLop == idLop.Value);
            }

            if (idBoMon.HasValue && idBoMon.Value > 0)
            {
                query = query.Where(k => k.IdBoMon == idBoMon.Value);
            }

            var items = await query
                .OrderByDescending(k => k.IdKhoaHoc)
                .Select(k => new KhoaHocDto
                {
                    IdKhoaHoc = k.IdKhoaHoc,
                    TenKhoaHoc = k.TenKhoaHoc,
                    SoTiet = k.SoTiet,
                    SoBuoiDaDay = k.SoBuoiDaDay,
                    TrangThaiHoanThanh = k.TrangThaiHoanThanh,
                    IdBoMon = k.IdBoMon,
                    IdLop = k.IdLop,
                    TenLop = k.LopHoc != null ? k.LopHoc.TenLop : null,
                    IdDn = k.IdDn
                })
                .ToListAsync();

            return ApiResponse<List<KhoaHocDto>>.Ok(items, "Lấy danh sách khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách khóa học");
            return ApiResponse<List<KhoaHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo mới một khóa học đào tạo
    /// </summary>
    public async Task<ApiResponse<KhoaHocDto>> TaoKhoaHocAsync(TaoKhoaHocRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.TenKhoaHoc))
            {
                return ApiResponse<KhoaHocDto>.Fail("Tên khóa học không được để trống", 400);
            }

            var kh = new KhoaHoc
            {
                TenKhoaHoc = request.TenKhoaHoc.Trim(),
                IdBoMon = request.IdBoMon > 0 ? request.IdBoMon : 1,
                IdLop = request.IdLop,
                SoTiet = request.SoTiet ?? 30,
                SoBuoiDaDay = 0,
                TrangThaiHoanThanh = false,
                IdDn = request.IdDn > 0 ? request.IdDn : 1,
                Xoa = false
            };

            _context.KhoaHocs.Add(kh);
            await _context.SaveChangesAsync();

            var dto = new KhoaHocDto
            {
                IdKhoaHoc = kh.IdKhoaHoc,
                TenKhoaHoc = kh.TenKhoaHoc,
                SoTiet = kh.SoTiet,
                SoBuoiDaDay = kh.SoBuoiDaDay,
                TrangThaiHoanThanh = kh.TrangThaiHoanThanh,
                IdBoMon = kh.IdBoMon,
                IdLop = kh.IdLop,
                IdDn = kh.IdDn
            };

            return ApiResponse<KhoaHocDto>.Ok(dto, "Tạo khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo khóa học mới: {TenKhoaHoc}", request.TenKhoaHoc);
            return ApiResponse<KhoaHocDto>.Fail("Lỗi tạo mới: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm một khóa học
    /// </summary>
    public async Task<ApiResponse<bool>> XoaKhoaHocAsync(int idKh)
    {
        try
        {
            var kh = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdKhoaHoc == idKh && !k.Xoa);
            if (kh == null)
            {
                return ApiResponse<bool>.Fail($"Không tìm thấy khóa học với ID {idKh}", 404);
            }

            kh.Xoa = true;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Xóa khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa khóa học #{IdKh}", idKh);
            return ApiResponse<bool>.Fail("Lỗi xóa: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy thời khóa biểu tuần theo lớp học và tuần học
    /// </summary>
    public async Task<ApiResponse<List<ThoiKhoaBieuTuanDto>>> LayThoiKhoaBieuTuanTheoLopAsync(int idLop, int? idTuan)
    {
        try
        {
            var query = _context.ThoiKhoaBieuTuans
                .Include(t => t.LopHoc)
                .Include(t => t.GiaoVien)
                .Include(t => t.PhongHoc)
                .Where(t => t.IdLop == idLop && !t.Xoa)
                .AsNoTracking();

            if (idTuan.HasValue && idTuan.Value > 0)
            {
                query = query.Where(t => t.IdTh == idTuan.Value);
            }

            var list = await query
                .OrderBy(t => t.Thu)
                .ThenBy(t => t.CaHoc)
                .Select(t => new ThoiKhoaBieuTuanDto
                {
                    IdTkb = t.IdTkbTuan,
                    IdTh = t.IdTh,
                    ThuTrongTuan = t.Thu,
                    CaHoc = t.CaHoc,
                    GioBatDau = t.GioBatDau,
                    GioKetThuc = t.GioKetThuc,
                    IdLop = t.IdLop,
                    TenLop = t.LopHoc != null ? t.LopHoc.TenLop : "",
                    IdGv = t.IdGiaoVien,
                    TenGv = t.GiaoVien != null ? t.GiaoVien.HoTen : null,
                    IdPhong = t.IdPhong,
                    TenPhong = t.PhongHoc != null ? t.PhongHoc.TenPhong : null
                })
                .ToListAsync();

            return ApiResponse<List<ThoiKhoaBieuTuanDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy TKB lớp #{IdLop}", idLop);
            return ApiResponse<List<ThoiKhoaBieuTuanDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy thời khóa biểu tuần giảng dạy của giáo viên
    /// </summary>
    public async Task<ApiResponse<List<ThoiKhoaBieuTuanDto>>> LayThoiKhoaBieuTuanTheoGiaoVienAsync(int idGv, int? idTuan)
    {
        try
        {
            var query = _context.ThoiKhoaBieuTuans
                .Include(t => t.LopHoc)
                .Include(t => t.PhongHoc)
                .Where(t => t.IdGiaoVien == idGv && !t.Xoa)
                .AsNoTracking();

            if (idTuan.HasValue && idTuan.Value > 0)
            {
                query = query.Where(t => t.IdTh == idTuan.Value);
            }

            var list = await query
                .OrderBy(t => t.Thu)
                .ThenBy(t => t.CaHoc)
                .Select(t => new ThoiKhoaBieuTuanDto
                {
                    IdTkb = t.IdTkbTuan,
                    IdTh = t.IdTh,
                    ThuTrongTuan = t.Thu,
                    CaHoc = t.CaHoc,
                    GioBatDau = t.GioBatDau,
                    GioKetThuc = t.GioKetThuc,
                    IdLop = t.IdLop,
                    TenLop = t.LopHoc != null ? t.LopHoc.TenLop : "",
                    IdGv = t.IdGiaoVien,
                    IdPhong = t.IdPhong,
                    TenPhong = t.PhongHoc != null ? t.PhongHoc.TenPhong : null
                })
                .ToListAsync();

            return ApiResponse<List<ThoiKhoaBieuTuanDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy TKB giáo viên #{IdGv}", idGv);
            return ApiResponse<List<ThoiKhoaBieuTuanDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy thời khóa biểu tuần của một phòng học
    /// </summary>
    public async Task<ApiResponse<List<ThoiKhoaBieuTuanDto>>> LayThoiKhoaBieuTuanTheoPhongHocAsync(int idPhong, int? idTuan)
    {
        try
        {
            var query = _context.ThoiKhoaBieuTuans
                .Include(t => t.LopHoc)
                .Include(t => t.GiaoVien)
                .Where(t => t.IdPhong == idPhong && !t.Xoa)
                .AsNoTracking();

            if (idTuan.HasValue && idTuan.Value > 0)
            {
                query = query.Where(t => t.IdTh == idTuan.Value);
            }

            var list = await query
                .OrderBy(t => t.Thu)
                .ThenBy(t => t.CaHoc)
                .Select(t => new ThoiKhoaBieuTuanDto
                {
                    IdTkb = t.IdTkbTuan,
                    IdTh = t.IdTh,
                    ThuTrongTuan = t.Thu,
                    CaHoc = t.CaHoc,
                    GioBatDau = t.GioBatDau,
                    GioKetThuc = t.GioKetThuc,
                    IdLop = t.IdLop,
                    TenLop = t.LopHoc != null ? t.LopHoc.TenLop : "",
                    IdGv = t.IdGiaoVien,
                    TenGv = t.GiaoVien != null ? t.GiaoVien.HoTen : null,
                    IdPhong = t.IdPhong
                })
                .ToListAsync();

            return ApiResponse<List<ThoiKhoaBieuTuanDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy TKB phòng #{IdPhong}", idPhong);
            return ApiResponse<List<ThoiKhoaBieuTuanDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lưu hoặc cập nhật một bản ghi thời khóa biểu tuần
    /// </summary>
    public async Task<ApiResponse<ThoiKhoaBieuTuan>> LuuThoiKhoaBieuTuanAsync(ThoiKhoaBieuTuan tkb)
    {
        try
        {
            if (tkb.IdLop <= 0 || tkb.IdTh <= 0 || tkb.IdPhong <= 0 || tkb.Thu < 2 || tkb.Thu > 8 || tkb.CaHoc < 1)
            {
                return ApiResponse<ThoiKhoaBieuTuan>.Fail("Thông tin thời khóa biểu không hợp lệ", 400);
            }

            if (tkb.IdDn <= 0)
            {
                var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == tkb.IdLop);
                tkb.IdDn = lop?.IdDn ?? 1;
            }

            // 1. Trùng phòng học
            var conflictPhong = await _context.ThoiKhoaBieuTuans.AnyAsync(t =>
                t.IdTh == tkb.IdTh &&
                t.Thu == tkb.Thu &&
                t.CaHoc == tkb.CaHoc &&
                t.IdPhong == tkb.IdPhong &&
                t.IdTkbTuan != tkb.IdTkbTuan &&
                !t.Xoa);

            if (conflictPhong)
            {
                return ApiResponse<ThoiKhoaBieuTuan>.Fail("Phòng học đã có lịch xếp vào thời điểm này", 409);
            }

            // 2. Trùng lớp học
            var conflictLop = await _context.ThoiKhoaBieuTuans.AnyAsync(t =>
                t.IdTh == tkb.IdTh &&
                t.Thu == tkb.Thu &&
                t.CaHoc == tkb.CaHoc &&
                t.IdLop == tkb.IdLop &&
                t.IdTkbTuan != tkb.IdTkbTuan &&
                !t.Xoa);

            if (conflictLop)
            {
                return ApiResponse<ThoiKhoaBieuTuan>.Fail("Lớp học đã có lịch xếp vào thời điểm này", 409);
            }

            // 3. Trùng giáo viên
            if (tkb.IdGiaoVien.HasValue && tkb.IdGiaoVien.Value > 0)
            {
                var conflictGv = await _context.ThoiKhoaBieuTuans.AnyAsync(t =>
                    t.IdTh == tkb.IdTh &&
                    t.Thu == tkb.Thu &&
                    t.CaHoc == tkb.CaHoc &&
                    t.IdGiaoVien == tkb.IdGiaoVien.Value &&
                    t.IdTkbTuan != tkb.IdTkbTuan &&
                    !t.Xoa);

                if (conflictGv)
                {
                    return ApiResponse<ThoiKhoaBieuTuan>.Fail("Giáo viên đã có lịch dạy vào thời điểm này", 409);
                }
            }

            if (tkb.IdTkbTuan > 0)
            {
                var existing = await _context.ThoiKhoaBieuTuans.FirstOrDefaultAsync(t => t.IdTkbTuan == tkb.IdTkbTuan && !t.Xoa);
                if (existing == null)
                {
                    return ApiResponse<ThoiKhoaBieuTuan>.Fail("Không tìm thấy thời khóa biểu cần sửa", 404);
                }

                existing.IdLop = tkb.IdLop;
                existing.IdTh = tkb.IdTh;
                existing.IdPhong = tkb.IdPhong;
                existing.IdGiaoVien = tkb.IdGiaoVien;
                existing.Thu = tkb.Thu;
                existing.CaHoc = tkb.CaHoc;
                existing.GioBatDau = tkb.GioBatDau;
                existing.GioKetThuc = tkb.GioKetThuc;
                await _context.SaveChangesAsync();
                return ApiResponse<ThoiKhoaBieuTuan>.Ok(existing, "Cập nhật thời khóa biểu thành công");
            }

            tkb.Xoa = false;
            _context.ThoiKhoaBieuTuans.Add(tkb);
            await _context.SaveChangesAsync();

            return ApiResponse<ThoiKhoaBieuTuan>.Created(tkb, "Lưu thời khóa biểu thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lưu thời khóa biểu tuần");
            return ApiResponse<ThoiKhoaBieuTuan>.Fail("Lỗi lưu TKB: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lưu hàng loạt bản ghi thời khóa biểu tuần có kiểm tra xung đột trùng lặp
    /// </summary>
    public async Task<ApiResponse<List<ThoiKhoaBieuTuan>>> LuuThoiKhoaBieuHangLoatAsync(List<ThoiKhoaBieuTuan> dsTkb)
    {
        try
        {
            if (dsTkb == null || !dsTkb.Any())
            {
                return ApiResponse<List<ThoiKhoaBieuTuan>>.Fail("Danh sách TKB không được để trống", 400);
            }

            // Kiểm tra xung đột nội bộ trong mảng gửi lên
            var seenPhong = new HashSet<string>();
            var seenLop = new HashSet<string>();
            var seenGv = new HashSet<string>();

            foreach (var item in dsTkb)
            {
                string keyPhong = $"{item.IdTh}_{item.Thu}_{item.CaHoc}_{item.IdPhong}";
                if (!seenPhong.Add(keyPhong))
                {
                    return ApiResponse<List<ThoiKhoaBieuTuan>>.Fail($"Xung đột phòng học trùng lịch: Thứ {item.Thu}, Ca {item.CaHoc}, Phòng #{item.IdPhong}", 409);
                }

                string keyLop = $"{item.IdTh}_{item.Thu}_{item.CaHoc}_{item.IdLop}";
                if (!seenLop.Add(keyLop))
                {
                    return ApiResponse<List<ThoiKhoaBieuTuan>>.Fail($"Xung đột lớp học trùng lịch: Thứ {item.Thu}, Ca {item.CaHoc}, Lớp #{item.IdLop}", 409);
                }

                if (item.IdGiaoVien.HasValue && item.IdGiaoVien.Value > 0)
                {
                    string keyGv = $"{item.IdTh}_{item.Thu}_{item.CaHoc}_{item.IdGiaoVien.Value}";
                    if (!seenGv.Add(keyGv))
                    {
                        return ApiResponse<List<ThoiKhoaBieuTuan>>.Fail($"Xung đột giáo viên trùng ca dạy: Thứ {item.Thu}, Ca {item.CaHoc}, GV #{item.IdGiaoVien.Value}", 409);
                    }
                }

                if (item.IdDn <= 0)
                {
                    var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == item.IdLop);
                    item.IdDn = lop?.IdDn ?? 1;
                }
                item.Xoa = false;
                _context.ThoiKhoaBieuTuans.Add(item);
            }

            await _context.SaveChangesAsync();
            return ApiResponse<List<ThoiKhoaBieuTuan>>.Ok(dsTkb, $"Đã lưu thành công {dsTkb.Count} bản ghi thời khóa biểu");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lưu thời khóa biểu hàng loạt");
            return ApiResponse<List<ThoiKhoaBieuTuan>>.Fail("Lỗi lưu hàng loạt: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm một bản ghi thời khóa biểu tuần
    /// </summary>
    public async Task<ApiResponse<bool>> XoaThoiKhoaBieuTuanAsync(int idTkb)
    {
        try
        {
            var item = await _context.ThoiKhoaBieuTuans.FirstOrDefaultAsync(t => t.IdTkbTuan == idTkb && !t.Xoa);
            if (item == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy thời khóa biểu", 404);
            }

            // Chặn xóa thời khóa biểu của tuần học đã kết thúc trong quá khứ (giống Java)
            var tuan = await _context.TuanHocs.FirstOrDefaultAsync(t => t.IdTh == item.IdTh);
            if (tuan?.NgayKetThuc.HasValue == true && tuan.NgayKetThuc.Value < DateOnly.FromDateTime(DateTime.Today))
            {
                return ApiResponse<bool>.Fail("Không thể xóa thời khóa biểu của tuần học đã kết thúc trong quá khứ", 400);
            }

            item.Xoa = true;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Xóa thời khóa biểu thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa thời khóa biểu #{IdTkb}", idTkb);
            return ApiResponse<bool>.Fail("Lỗi xóa: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách khung lịch học cố định của một lớp học
    /// </summary>
    public async Task<ApiResponse<List<KhungLichHocCoDinhDto>>> LayKhungLichCoDinhTheoLopAsync(int idLop)
    {
        try
        {
            var list = await _context.KhungLichHocCoDinhs
                .Include(k => k.LopHoc)
                .Include(k => k.PhongHoc)
                .Where(k => k.IdLop == idLop && !k.Xoa)
                .AsNoTracking()
                .Select(k => new KhungLichHocCoDinhDto
                {
                    IdLich = k.IdKhungLich,
                    IdLop = k.IdLop,
                    TenLop = k.LopHoc != null ? k.LopHoc.TenLop : "",
                    IdPhong = k.IdPhong,
                    TenPhong = k.PhongHoc != null ? k.PhongHoc.TenPhong : "",
                    ThuTrongTuan = k.Thu,
                    GioBatDau = k.GioBatDau ?? new TimeOnly(7, 30),
                    GioKetThuc = k.GioKetThuc ?? new TimeOnly(9, 30)
                })
                .ToListAsync();

            return ApiResponse<List<KhungLichHocCoDinhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy khung lịch lớp #{IdLop}", idLop);
            return ApiResponse<List<KhungLichHocCoDinhDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách khung lịch học cố định của một phòng học
    /// </summary>
    public async Task<ApiResponse<List<KhungLichHocCoDinhDto>>> LayKhungLichCoDinhTheoPhongAsync(int idPhong)
    {
        try
        {
            var list = await _context.KhungLichHocCoDinhs
                .Include(k => k.LopHoc)
                .Include(k => k.PhongHoc)
                .Where(k => k.IdPhong == idPhong && !k.Xoa)
                .AsNoTracking()
                .Select(k => new KhungLichHocCoDinhDto
                {
                    IdLich = k.IdKhungLich,
                    IdLop = k.IdLop,
                    TenLop = k.LopHoc != null ? k.LopHoc.TenLop : "",
                    IdPhong = k.IdPhong,
                    TenPhong = k.PhongHoc != null ? k.PhongHoc.TenPhong : "",
                    ThuTrongTuan = k.Thu,
                    GioBatDau = k.GioBatDau ?? new TimeOnly(7, 30),
                    GioKetThuc = k.GioKetThuc ?? new TimeOnly(9, 30)
                })
                .ToListAsync();

            return ApiResponse<List<KhungLichHocCoDinhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy khung lịch phòng #{IdPhong}", idPhong);
            return ApiResponse<List<KhungLichHocCoDinhDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lưu mới hoặc cập nhật khung lịch học cố định
    /// </summary>
    public async Task<ApiResponse<KhungLichHocCoDinh>> LuuKhungLichCoDinhAsync(KhungLichHocCoDinh lich)
    {
        try
        {
            if (lich.IdLop <= 0 || lich.IdPhong <= 0 || lich.Thu < 2 || lich.Thu > 8)
            {
                return ApiResponse<KhungLichHocCoDinh>.Fail("Thông tin khung lịch cố định không hợp lệ", 400);
            }

            if (lich.IdDn <= 0)
            {
                var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == lich.IdLop);
                lich.IdDn = lop?.IdDn ?? 1;
            }

            lich.Xoa = false;
            if (lich.IdKhungLich > 0)
            {
                var existing = await _context.KhungLichHocCoDinhs.FirstOrDefaultAsync(k => k.IdKhungLich == lich.IdKhungLich && !k.Xoa);
                if (existing == null)
                {
                    return ApiResponse<KhungLichHocCoDinh>.Fail("Không tìm thấy khung lịch", 404);
                }

                existing.IdLop = lich.IdLop;
                existing.IdPhong = lich.IdPhong;
                existing.Thu = lich.Thu;
                existing.CaHoc = lich.CaHoc;
                existing.GioBatDau = lich.GioBatDau;
                existing.GioKetThuc = lich.GioKetThuc;
                await _context.SaveChangesAsync();
                return ApiResponse<KhungLichHocCoDinh>.Ok(existing, "Cập nhật khung lịch thành công");
            }

            var existingSlot = await _context.KhungLichHocCoDinhs.FirstOrDefaultAsync(k =>
                k.IdPhong == lich.IdPhong &&
                k.Thu == lich.Thu &&
                k.CaHoc == lich.CaHoc &&
                !k.Xoa);

            if (existingSlot != null)
            {
                existingSlot.IdLop = lich.IdLop;
                existingSlot.GioBatDau = lich.GioBatDau;
                existingSlot.GioKetThuc = lich.GioKetThuc;
                existingSlot.IdDn = lich.IdDn;
                await _context.SaveChangesAsync();
                return ApiResponse<KhungLichHocCoDinh>.Ok(existingSlot, "Cập nhật khung lịch thành công");
            }

            _context.KhungLichHocCoDinhs.Add(lich);
            await _context.SaveChangesAsync();

            return ApiResponse<KhungLichHocCoDinh>.Created(lich, "Tạo khung lịch cố định thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lưu khung lịch cố định");
            return ApiResponse<KhungLichHocCoDinh>.Fail("Lỗi lưu khung lịch: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm một khung lịch học cố định
    /// </summary>
    public async Task<ApiResponse<bool>> XoaKhungLichCoDinhAsync(int idKhungLich)
    {
        try
        {
            var item = await _context.KhungLichHocCoDinhs.FirstOrDefaultAsync(k => k.IdKhungLich == idKhungLich && !k.Xoa);
            if (item == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy khung lịch", 404);
            }

            item.Xoa = true;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Xóa khung lịch cố định thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa khung lịch #{IdKhungLich}", idKhungLich);
            return ApiResponse<bool>.Fail("Lỗi xóa: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tự động sinh danh sách buổi học theo tuần cho lớp dựa vào thời khóa biểu tuần hoặc khung lịch cố định
    /// </summary>
    public async Task<ApiResponse<List<BuoiHocDto>>> TuDongSinhBuoiHocTheoTuanAsync(int idLop, int idTuan)
    {
        try
        {
            var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == idLop && !l.Xoa);
            if (lop == null)
            {
                return ApiResponse<List<BuoiHocDto>>.Fail("Không tìm thấy lớp học", 404);
            }

            var tuan = await _context.TuanHocs.FirstOrDefaultAsync(t => t.IdTh == idTuan && !t.Xoa);
            if (tuan == null)
            {
                return ApiResponse<List<BuoiHocDto>>.Fail("Không tìm thấy tuần học", 404);
            }

            var khoaHoc = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdLop == idLop && !k.Xoa);
            int idKhTarget = khoaHoc?.IdKhoaHoc ?? 1;

            var tkbList = await _context.ThoiKhoaBieuTuans
                .Where(t => t.IdLop == idLop && t.IdTh == idTuan && !t.Xoa)
                .ToListAsync();

            if (!tkbList.Any())
            {
                var khungLichList = await _context.KhungLichHocCoDinhs
                    .Where(k => k.IdLop == idLop && !k.Xoa)
                    .ToListAsync();

                foreach (var kl in khungLichList)
                {
                    var newTkb = new ThoiKhoaBieuTuan
                    {
                        IdLop = idLop,
                        IdTh = idTuan,
                        IdPhong = kl.IdPhong,
                        IdGiaoVien = lop.IdGv,
                        Thu = kl.Thu,
                        CaHoc = kl.CaHoc,
                        GioBatDau = kl.GioBatDau,
                        GioKetThuc = kl.GioKetThuc,
                        IdDn = lop.IdDn,
                        Xoa = false
                    };
                    _context.ThoiKhoaBieuTuans.Add(newTkb);
                    tkbList.Add(newTkb);
                }

                if (tkbList.Any())
                {
                    await _context.SaveChangesAsync();
                }
            }

            var startDate = tuan.NgayBatDau ?? DateOnly.FromDateTime(DateTime.Today);
            var buoiHocsToReturn = new List<BuoiHoc>();

            int countNew = 0;
            foreach (var tkb in tkbList)
            {
                int dayOffset = Math.Max(0, tkb.Thu - 2);
                var targetDate = startDate.AddDays(dayOffset);

                var existingBuoi = await _context.BuoiHocs.FirstOrDefaultAsync(b =>
                    b.IdLop == idLop &&
                    b.NgayHoc == targetDate &&
                    b.CaHoc == tkb.CaHoc &&
                    !b.Xoa);

                if (existingBuoi == null)
                {
                    var newBuoi = new BuoiHoc
                    {
                        IdTkbTuan = tkb.IdTkbTuan,
                        IdKhoaHoc = idKhTarget,
                        IdLop = idLop,
                        IdPhong = tkb.IdPhong,
                        NgayHoc = targetDate,
                        CaHoc = tkb.CaHoc,
                        GioBatDau = tkb.GioBatDau,
                        GioKetThuc = tkb.GioKetThuc,
                        NoiDung = $"Buổi học Lớp {lop.TenLop} - Thứ {tkb.Thu} Ca {tkb.CaHoc}",
                        IdDn = lop.IdDn,
                        Xoa = false
                    };
                    _context.BuoiHocs.Add(newBuoi);
                    buoiHocsToReturn.Add(newBuoi);
                    countNew++;
                }
                else
                {
                    buoiHocsToReturn.Add(existingBuoi);
                }
            }

            if (countNew > 0 && khoaHoc != null)
            {
                khoaHoc.SoBuoiDaDay += countNew;
                if (khoaHoc.SoTiet.HasValue && khoaHoc.SoBuoiDaDay >= khoaHoc.SoTiet.Value)
                {
                    khoaHoc.TrangThaiHoanThanh = true;
                }
            }

            await _context.SaveChangesAsync();

            var dtoList = buoiHocsToReturn.Select(b => new BuoiHocDto
            {
                IdBuoiHoc = b.IdBuoiHoc,
                IdLop = b.IdLop,
                TenLop = lop.TenLop,
                IdGv = lop.IdGv,
                IdPhong = b.IdPhong,
                NgayHoc = b.NgayHoc ?? DateOnly.MinValue,
                GioBatDau = b.GioBatDau ?? new TimeOnly(7, 30),
                GioKetThuc = b.GioKetThuc ?? new TimeOnly(9, 30),
                NoiDungBaiHoc = b.NoiDung
            }).ToList();

            return ApiResponse<List<BuoiHocDto>>.Ok(dtoList, $"Sinh thành công {dtoList.Count} buổi học cho tuần #{idTuan}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tự động sinh buổi học lớp {IdLop} tuần {IdTuan}", idLop, idTuan);
            return ApiResponse<List<BuoiHocDto>>.Fail("Lỗi tự động sinh buổi học: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách các buổi học của một lớp học
    /// </summary>
    public async Task<ApiResponse<List<BuoiHocDto>>> LayDanhSachBuoiHocTheoLopAsync(int idLop)
    {
        try
        {
            var list = await _context.BuoiHocs
                .Include(b => b.LopHoc)
                .Include(b => b.PhongHoc)
                .Where(b => b.IdLop == idLop && !b.Xoa)
                .OrderBy(b => b.NgayHoc)
                .ThenBy(b => b.CaHoc)
                .AsNoTracking()
                .Select(b => new BuoiHocDto
                {
                    IdBuoiHoc = b.IdBuoiHoc,
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdPhong = b.IdPhong,
                    TenPhong = b.PhongHoc != null ? b.PhongHoc.TenPhong : "",
                    NgayHoc = b.NgayHoc ?? DateOnly.MinValue,
                    GioBatDau = b.GioBatDau ?? new TimeOnly(7, 30),
                    GioKetThuc = b.GioKetThuc ?? new TimeOnly(9, 30),
                    NoiDungBaiHoc = b.NoiDung
                })
                .ToListAsync();

            return ApiResponse<List<BuoiHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách buổi học lớp #{IdLop}", idLop);
            return ApiResponse<List<BuoiHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách các buổi học thuộc một khóa học
    /// </summary>
    public async Task<ApiResponse<List<BuoiHocDto>>> LayDanhSachBuoiHocTheoKhoaHocAsync(int idKhoaHoc)
    {
        try
        {
            var list = await _context.BuoiHocs
                .Include(b => b.LopHoc)
                .Include(b => b.PhongHoc)
                .Where(b => b.IdKhoaHoc == idKhoaHoc && !b.Xoa)
                .OrderBy(b => b.NgayHoc)
                .ThenBy(b => b.CaHoc)
                .AsNoTracking()
                .Select(b => new BuoiHocDto
                {
                    IdBuoiHoc = b.IdBuoiHoc,
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdPhong = b.IdPhong,
                    TenPhong = b.PhongHoc != null ? b.PhongHoc.TenPhong : "",
                    NgayHoc = b.NgayHoc ?? DateOnly.MinValue,
                    GioBatDau = b.GioBatDau ?? new TimeOnly(7, 30),
                    GioKetThuc = b.GioKetThuc ?? new TimeOnly(9, 30),
                    NoiDungBaiHoc = b.NoiDung
                })
                .ToListAsync();

            return ApiResponse<List<BuoiHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách buổi học khóa #{IdKhoaHoc}", idKhoaHoc);
            return ApiResponse<List<BuoiHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách các buổi học được tổ chức tại một phòng học
    /// </summary>
    public async Task<ApiResponse<List<BuoiHocDto>>> LayDanhSachBuoiHocTheoPhongAsync(int idPhong)
    {
        try
        {
            var list = await _context.BuoiHocs
                .Include(b => b.LopHoc)
                .Include(b => b.PhongHoc)
                .Where(b => b.IdPhong == idPhong && !b.Xoa)
                .OrderBy(b => b.NgayHoc)
                .ThenBy(b => b.CaHoc)
                .AsNoTracking()
                .Select(b => new BuoiHocDto
                {
                    IdBuoiHoc = b.IdBuoiHoc,
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdPhong = b.IdPhong,
                    TenPhong = b.PhongHoc != null ? b.PhongHoc.TenPhong : "",
                    NgayHoc = b.NgayHoc ?? DateOnly.MinValue,
                    GioBatDau = b.GioBatDau ?? new TimeOnly(7, 30),
                    GioKetThuc = b.GioKetThuc ?? new TimeOnly(9, 30),
                    NoiDungBaiHoc = b.NoiDung
                })
                .ToListAsync();

            return ApiResponse<List<BuoiHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách buổi học phòng #{IdPhong}", idPhong);
            return ApiResponse<List<BuoiHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết một buổi học theo ID
    /// </summary>
    public async Task<ApiResponse<BuoiHocDto>> LayBuoiHocTheoIdAsync(int idBuoiHoc)
    {
        try
        {
            var b = await _context.BuoiHocs
                .Include(x => x.LopHoc)
                .Include(x => x.PhongHoc)
                .FirstOrDefaultAsync(x => x.IdBuoiHoc == idBuoiHoc && !x.Xoa);

            if (b == null)
            {
                return ApiResponse<BuoiHocDto>.Fail($"Không tìm thấy buổi học với ID {idBuoiHoc}", 404);
            }

            var dto = new BuoiHocDto
            {
                IdBuoiHoc = b.IdBuoiHoc,
                IdLop = b.IdLop,
                TenLop = b.LopHoc?.TenLop ?? "",
                IdPhong = b.IdPhong,
                TenPhong = b.PhongHoc?.TenPhong ?? "",
                NgayHoc = b.NgayHoc ?? DateOnly.MinValue,
                GioBatDau = b.GioBatDau ?? new TimeOnly(7, 30),
                GioKetThuc = b.GioKetThuc ?? new TimeOnly(9, 30),
                NoiDungBaiHoc = b.NoiDung
            };

            return ApiResponse<BuoiHocDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết buổi học #{IdBuoiHoc}", idBuoiHoc);
            return ApiResponse<BuoiHocDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lưu mới hoặc cập nhật thông tin một buổi học
    /// </summary>
    public async Task<ApiResponse<BuoiHoc>> LuuBuoiHocAsync(BuoiHoc buoi)
    {
        try
        {
            if (buoi.IdLop <= 0 || buoi.IdPhong <= 0)
            {
                return ApiResponse<BuoiHoc>.Fail("Lớp học và phòng học là bắt buộc khi tạo buổi học", 400);
            }

            if (buoi.IdKhoaHoc <= 0)
            {
                var kh = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdLop == buoi.IdLop && !k.Xoa);
                buoi.IdKhoaHoc = kh?.IdKhoaHoc ?? 1;
            }

            if (buoi.IdDn <= 0)
            {
                var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == buoi.IdLop);
                buoi.IdDn = lop?.IdDn ?? 1;
            }

            buoi.Xoa = false;

            if (buoi.IdBuoiHoc > 0)
            {
                var existing = await _context.BuoiHocs.FirstOrDefaultAsync(b => b.IdBuoiHoc == buoi.IdBuoiHoc && !b.Xoa);
                if (existing == null)
                {
                    return ApiResponse<BuoiHoc>.Fail("Không tìm thấy buổi học", 404);
                }

                existing.IdLop = buoi.IdLop;
                existing.IdKhoaHoc = buoi.IdKhoaHoc;
                existing.IdPhong = buoi.IdPhong;
                existing.IdTkbTuan = buoi.IdTkbTuan;
                existing.NgayHoc = buoi.NgayHoc;
                existing.CaHoc = buoi.CaHoc;
                existing.GioBatDau = buoi.GioBatDau;
                existing.GioKetThuc = buoi.GioKetThuc;
                existing.NoiDung = buoi.NoiDung;

                await _context.SaveChangesAsync();
                return ApiResponse<BuoiHoc>.Ok(existing, "Cập nhật buổi học thành công");
            }

            _context.BuoiHocs.Add(buoi);

            // Cập nhật số buổi đã dạy của khóa học (giống Java)
            var khTarget = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdKhoaHoc == buoi.IdKhoaHoc && !k.Xoa);
            if (khTarget != null)
            {
                khTarget.SoBuoiDaDay += 1;
                if (khTarget.SoTiet.HasValue && khTarget.SoBuoiDaDay >= khTarget.SoTiet.Value)
                {
                    khTarget.TrangThaiHoanThanh = true;
                }
            }

            await _context.SaveChangesAsync();

            return ApiResponse<BuoiHoc>.Created(buoi, "Tạo buổi học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lưu buổi học");
            return ApiResponse<BuoiHoc>.Fail("Lỗi lưu buổi học: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm một buổi học (có ràng buộc không xóa buổi học quá khứ)
    /// </summary>
    public async Task<ApiResponse<bool>> XoaBuoiHocAsync(int idBuoiHoc)
    {
        try
        {
            var item = await _context.BuoiHocs.FirstOrDefaultAsync(b => b.IdBuoiHoc == idBuoiHoc && !b.Xoa);
            if (item == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy buổi học", 404);
            }

            // Chặn xóa buổi học đã diễn ra trong quá khứ (giống Java)
            if (item.NgayHoc.HasValue && item.NgayHoc.Value < DateOnly.FromDateTime(DateTime.Today))
            {
                return ApiResponse<bool>.Fail("Không thể xóa buổi học đã diễn ra trong quá khứ", 400);
            }

            item.Xoa = true;

            // Giảm số buổi đã dạy và reset trạng thái hoàn thành nếu có (giống Java)
            var khTarget = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdKhoaHoc == item.IdKhoaHoc && !k.Xoa);
            if (khTarget != null && khTarget.SoBuoiDaDay > 0)
            {
                khTarget.SoBuoiDaDay -= 1;
                khTarget.TrangThaiHoanThanh = false;
            }

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Xóa buổi học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa buổi học #{IdBuoiHoc}", idBuoiHoc);
            return ApiResponse<bool>.Fail("Lỗi xóa: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách đăng ký học của một lớp học
    /// </summary>
    public async Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoLopAsync(int idLop)
    {
        try
        {
            var list = await _context.DangKyHocs
                .Include(d => d.HocSinh)
                .Include(d => d.LopHoc)
                .Where(d => d.IdLop == idLop && !d.Xoa)
                .AsNoTracking()
                .Select(d => new DangKyHocDto
                {
                    IdDangKy = d.IdDangKy,
                    IdHs = d.IdHs,
                    TenHs = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    TenHocSinh = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    IdLop = d.IdLop,
                    TenLop = d.LopHoc != null ? d.LopHoc.TenLop : "",
                    NgayDangKy = d.NgayDangKy,
                    TrangThaiThanhToan = d.TrangThaiThanhToan,
                    TrangThai = d.TrangThaiThanhToan ? "Đã thanh toán" : "Chưa thanh toán"
                })
                .ToListAsync();

            return ApiResponse<List<DangKyHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách đăng ký lớp #{IdLop}", idLop);
            return ApiResponse<List<DangKyHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách đăng ký lớp học của một học sinh
    /// </summary>
    public async Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoHocSinhAsync(int idHs)
    {
        try
        {
            var list = await _context.DangKyHocs
                .Include(d => d.HocSinh)
                .Include(d => d.LopHoc)
                .Where(d => d.IdHs == idHs && !d.Xoa)
                .AsNoTracking()
                .Select(d => new DangKyHocDto
                {
                    IdDangKy = d.IdDangKy,
                    IdHs = d.IdHs,
                    TenHs = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    TenHocSinh = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    IdLop = d.IdLop,
                    TenLop = d.LopHoc != null ? d.LopHoc.TenLop : "",
                    NgayDangKy = d.NgayDangKy,
                    TrangThaiThanhToan = d.TrangThaiThanhToan,
                    TrangThai = d.TrangThaiThanhToan ? "Đã thanh toán" : "Chưa thanh toán"
                })
                .ToListAsync();

            return ApiResponse<List<DangKyHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách đăng ký học sinh #{IdHs}", idHs);
            return ApiResponse<List<DangKyHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách đăng ký học theo Doanh nghiệp
    /// </summary>
    public async Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.DangKyHocs
                .Include(d => d.HocSinh)
                .Include(d => d.LopHoc)
                .Where(d => d.IdDn == idDn && !d.Xoa)
                .AsNoTracking()
                .Select(d => new DangKyHocDto
                {
                    IdDangKy = d.IdDangKy,
                    IdHs = d.IdHs,
                    TenHs = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    TenHocSinh = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    IdLop = d.IdLop,
                    TenLop = d.LopHoc != null ? d.LopHoc.TenLop : "",
                    NgayDangKy = d.NgayDangKy,
                    TrangThaiThanhToan = d.TrangThaiThanhToan,
                    TrangThai = d.TrangThaiThanhToan ? "Đã thanh toán" : "Chưa thanh toán"
                })
                .ToListAsync();

            return ApiResponse<List<DangKyHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách đăng ký doanh nghiệp #{IdDn}", idDn);
            return ApiResponse<List<DangKyHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách đăng ký học theo Chi nhánh
    /// </summary>
    public async Task<ApiResponse<List<DangKyHocDto>>> LayDanhSachDangKyTheoChiNhanhAsync(int idCn)
    {
        try
        {
            var list = await _context.DangKyHocs
                .Include(d => d.HocSinh)
                .Include(d => d.LopHoc)
                .Where(d => d.LopHoc != null && d.LopHoc.IdCn == idCn && !d.Xoa)
                .AsNoTracking()
                .Select(d => new DangKyHocDto
                {
                    IdDangKy = d.IdDangKy,
                    IdHs = d.IdHs,
                    TenHs = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    TenHocSinh = d.HocSinh != null ? d.HocSinh.HoTen : "",
                    IdLop = d.IdLop,
                    TenLop = d.LopHoc != null ? d.LopHoc.TenLop : "",
                    NgayDangKy = d.NgayDangKy,
                    TrangThaiThanhToan = d.TrangThaiThanhToan,
                    TrangThai = d.TrangThaiThanhToan ? "Đã thanh toán" : "Chưa thanh toán"
                })
                .ToListAsync();

            return ApiResponse<List<DangKyHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách đăng ký chi nhánh #{IdCn}", idCn);
            return ApiResponse<List<DangKyHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Đăng ký học sinh vào lớp học (có kiểm tra sĩ số tối đa và đồng bộ sang hoc_sinh_khoa_hoc)
    /// </summary>
    public async Task<ApiResponse<DangKyHoc>> DangKyHocAsync(int idHs, int idLop, int? idPh = null, decimal? hocPhi = null)
    {
        if (idHs <= 0 || idLop <= 0)
        {
            return ApiResponse<DangKyHoc>.Fail("Học sinh và lớp học không hợp lệ", 400);
        }

        try
        {
            var hs = await _context.HocSinhs.FirstOrDefaultAsync(h => h.IdHs == idHs && !h.Xoa);
            if (hs == null) return ApiResponse<DangKyHoc>.Fail("Không tìm thấy học sinh", 404);

            var lop = await _context.LopHocs.FirstOrDefaultAsync(l => l.IdLop == idLop && !l.Xoa);
            if (lop == null) return ApiResponse<DangKyHoc>.Fail("Không tìm thấy lớp học", 404);

            // Kiểm tra giới hạn sĩ số tối đa của lớp học
            if (lop.SiSoToiDa.HasValue && lop.SiSoToiDa.Value > 0)
            {
                var siSoHienTai = await _context.DangKyHocs.CountAsync(d => d.IdLop == idLop && !d.Xoa);
                if (siSoHienTai >= lop.SiSoToiDa.Value)
                {
                    return ApiResponse<DangKyHoc>.Fail($"Lớp học '{lop.TenLop}' đã đạt sĩ số tối đa ({lop.SiSoToiDa.Value} học viên)", 400);
                }
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            decimal mucHocPhi = hocPhi ?? 0;

            var existingDk = await _context.DangKyHocs
                .FirstOrDefaultAsync(d => d.IdHs == idHs && d.IdLop == idLop);

            DangKyHoc resultDk;
            if (existingDk != null)
            {
                existingDk.Xoa = false;
                existingDk.NgayDangKy = today;
                if (idPh.HasValue) existingDk.IdPh = idPh.Value;
                if (mucHocPhi > 0) existingDk.HocPhi = mucHocPhi;
                resultDk = existingDk;
            }
            else
            {
                resultDk = new DangKyHoc
                {
                    IdHs = idHs,
                    IdLop = idLop,
                    IdPh = idPh,
                    IdDn = lop.IdDn,
                    NgayDangKy = today,
                    TrangThaiThanhToan = false,
                    HocPhi = mucHocPhi,
                    Xoa = false
                };
                _context.DangKyHocs.Add(resultDk);
            }

            // Đồng bộ thêm/khôi phục vào hoc_sinh_khoa_hoc đối với tất cả khóa học của lớp này (giống Java)
            var dsKhoaHoc = await _context.KhoaHocs.Where(k => k.IdLop == idLop && !k.Xoa).ToListAsync();
            foreach (var kh in dsKhoaHoc)
            {
                var hskh = await _context.HocSinhKhoaHocs
                    .FirstOrDefaultAsync(h => h.IdHs == idHs && h.IdKhoaHoc == kh.IdKhoaHoc);
                if (hskh != null)
                {
                    hskh.Xoa = false;
                    hskh.TrangThai = true;
                    hskh.HoTen = hs.HoTen;
                }
                else
                {
                    _context.HocSinhKhoaHocs.Add(new HocSinhKhoaHoc
                    {
                        IdHs = idHs,
                        IdKhoaHoc = kh.IdKhoaHoc,
                        HoTen = hs.HoTen,
                        NgayDangKy = today,
                        TrangThai = true,
                        SoBuoiDaHoc = 0,
                        IdDn = lop.IdDn,
                        Xoa = false
                    });
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<DangKyHoc>.Ok(resultDk, "Đăng ký học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi đăng ký học sinh {IdHs} vào lớp {IdLop}", idHs, idLop);
            return ApiResponse<DangKyHoc>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa đăng ký học theo ID đăng ký (và cascade soft-delete hoc_sinh_khoa_hoc)
    /// </summary>
    public async Task<ApiResponse<bool>> XoaDangKyHocAsync(int idDangKy)
    {
        try
        {
            var dk = await _context.DangKyHocs.FirstOrDefaultAsync(d => d.IdDangKy == idDangKy && !d.Xoa);
            if (dk == null) return ApiResponse<bool>.Fail("Không tìm thấy đăng ký học", 404);

            dk.Xoa = true;

            // Cascade xóa học sinh khỏi các khóa học của lớp này
            var dsKhId = await _context.KhoaHocs
                .Where(k => k.IdLop == dk.IdLop && !k.Xoa)
                .Select(k => k.IdKhoaHoc)
                .ToListAsync();

            if (dsKhId.Any())
            {
                var hskhList = await _context.HocSinhKhoaHocs
                    .Where(h => h.IdHs == dk.IdHs && dsKhId.Contains(h.IdKhoaHoc) && !h.Xoa)
                    .ToListAsync();
                foreach (var hskh in hskhList)
                {
                    hskh.Xoa = true;
                    hskh.TrangThai = false;
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa đăng ký học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa đăng ký học #{IdDangKy}", idDangKy);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa học sinh khỏi lớp học
    /// </summary>
    public async Task<ApiResponse<bool>> XoaHocSinhKhoiLopAsync(int idLop, int idHs)
    {
        var dk = await _context.DangKyHocs.FirstOrDefaultAsync(d => d.IdLop == idLop && d.IdHs == idHs && !d.Xoa);
        if (dk == null) return ApiResponse<bool>.Fail("Học sinh không có trong lớp học này", 404);

        return await XoaDangKyHocAsync(dk.IdDangKy);
    }

    /// <summary>
    /// Hủy đăng ký học
    /// </summary>
    public async Task<ApiResponse<bool>> HuyDangKyHocAsync(int idDangKy)
    {
        return await XoaDangKyHocAsync(idDangKy);
    }

    /// <summary>
    /// Lấy danh sách lựa chọn chi nhánh cho Dropdown
    /// </summary>
    public async Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownChiNhanhAsync()
    {
        var items = await _context.ChiNhanhs
            .AsNoTracking()
            .Select(c => new DropdownOptionDto
            {
                Id = c.IdCn,
                Ten = c.TenCn,
                Extra = c.DiaChi
            })
            .ToListAsync();
        return ApiResponse<List<DropdownOptionDto>>.Ok(items);
    }

    /// <summary>
    /// Lấy danh sách lựa chọn môn học cho Dropdown
    /// </summary>
    public async Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownMonHocAsync()
    {
        var items = await _context.MonHocs
            .Where(m => !m.Xoa)
            .AsNoTracking()
            .Select(m => new DropdownOptionDto
            {
                Id = m.IdMh,
                Ten = m.TenMon,
                Extra = m.MoTa
            })
            .ToListAsync();
        return ApiResponse<List<DropdownOptionDto>>.Ok(items);
    }

    /// <summary>
    /// Lấy danh sách lựa chọn kỳ học cho Dropdown
    /// </summary>
    public async Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownKyHocAsync()
    {
        var items = await _context.KyHocs
            .Where(k => !k.Xoa)
            .AsNoTracking()
            .Select(k => new DropdownOptionDto
            {
                Id = k.IdKh,
                Ten = k.TenKyHoc
            })
            .ToListAsync();
        return ApiResponse<List<DropdownOptionDto>>.Ok(items);
    }

    /// <summary>
    /// Lấy danh sách lựa chọn giáo viên cho Dropdown
    /// </summary>
    public async Task<ApiResponse<List<DropdownOptionDto>>> LayDropdownGiaoVienAsync()
    {
        var items = await _context.GiaoViens
            .Where(g => !g.Xoa && g.ConHoatDong)
            .AsNoTracking()
            .Select(g => new DropdownOptionDto
            {
                Id = g.IdGv,
                Ten = g.HoTen,
                Extra = g.Sdt
            })
            .ToListAsync();
        return ApiResponse<List<DropdownOptionDto>>.Ok(items);
    }
}
