using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class HocSinhService : IHocSinhService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<HocSinhService> _logger;
    private readonly ILocalizationService _localizer;

    public HocSinhService(
        QuanLyTrungTamDbContext context,
        ILogger<HocSinhService> logger,
        ILocalizationService? localizer = null)
    {
        _context = context;
        _logger = logger;
        _localizer = localizer ?? new LocalizationService();
    }

    /// <summary>
    /// Lấy danh sách học sinh theo phân trang, tìm kiếm từ khóa và lọc chi nhánh/doanh nghiệp.
    /// </summary>
    public async Task<ApiResponse<PagedResult<HocSinhResponseDto>>> LayDanhSachHocSinhAsync(HocSinhFilterDto filter)
    {
        try
        {
            var query = _context.HocSinhs
                .Include(h => h.PhuHuynh)
                .Where(h => !h.Xoa);

            if (filter.IdDn.HasValue && filter.IdDn.Value > 0)
            {
                query = query.Where(h => h.IdDn == filter.IdDn.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var kw = filter.Keyword.Trim().ToLower();
                query = query.Where(h => h.HoTen.ToLower().Contains(kw) 
                                      || (h.SoDienThoai != null && h.SoDienThoai.Contains(kw))
                                      || (h.Cccd != null && h.Cccd.Contains(kw)));
            }

            int totalCount = await query.CountAsync();

            int pageIndex = filter.PageIndex > 0 ? filter.PageIndex : 1;
            int pageSize = filter.PageSize > 0 ? filter.PageSize : 10;

            var items = await query
                .OrderByDescending(h => h.IdHs)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(h => new HocSinhResponseDto
                {
                    IdHs = h.IdHs,
                    HoTen = h.HoTen,
                    NgaySinh = h.NgaySinh,
                    GioiTinh = h.GioiTinh,
                    SoDienThoai = h.SoDienThoai,
                    Cccd = h.Cccd,
                    DiaChi = h.DiaChi,
                    IdPh = h.IdPh,
                    TenPhuHuynh = h.PhuHuynh != null ? h.PhuHuynh.HoTen : null,
                    SdtPhuHuynh = h.PhuHuynh != null ? h.PhuHuynh.Sdt : null,
                    IdDn = h.IdDn
                })
                .ToListAsync();

            var result = new PagedResult<HocSinhResponseDto>(items, totalCount, pageIndex, pageSize);
            return ApiResponse<PagedResult<HocSinhResponseDto>>.Ok(result, _localizer["Student_ListSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách học sinh");
            return ApiResponse<PagedResult<HocSinhResponseDto>>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu chi tiết hồ sơ học sinh theo mã định danh.
    /// </summary>
    public async Task<ApiResponse<HocSinhResponseDto>> TimHocSinhTheoIdAsync(int idHs)
    {
        try
        {
            var h = await _context.HocSinhs
                .Include(x => x.PhuHuynh)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdHs == idHs && !x.Xoa);

            if (h == null)
            {
                return ApiResponse<HocSinhResponseDto>.Fail(_localizer.Get("Student_NotFound", idHs), 404);
            }

            var dto = new HocSinhResponseDto
            {
                IdHs = h.IdHs,
                HoTen = h.HoTen,
                NgaySinh = h.NgaySinh,
                GioiTinh = h.GioiTinh,
                SoDienThoai = h.SoDienThoai,
                Cccd = h.Cccd,
                DiaChi = h.DiaChi,
                IdPh = h.IdPh,
                TenPhuHuynh = h.PhuHuynh?.HoTen,
                SdtPhuHuynh = h.PhuHuynh?.Sdt,
                IdDn = h.IdDn
            };

            return ApiResponse<HocSinhResponseDto>.Ok(dto, _localizer["Common_Success"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm học sinh #{IdHs}", idHs);
            return ApiResponse<HocSinhResponseDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo mới một học sinh vào hệ thống.
    /// </summary>
    public async Task<ApiResponse<HocSinh>> LuuHocSinhAsync(int idDn, HocSinh hs)
    {
        if (string.IsNullOrWhiteSpace(hs.HoTen))
        {
            return ApiResponse<HocSinh>.Fail("Họ tên học sinh không được để trống", 400);
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(hs.Cccd))
            {
                var cccdTrim = hs.Cccd.Trim();
                bool cccdExisted = await _context.HocSinhs.AnyAsync(x => x.Cccd == cccdTrim && !x.Xoa);
                if (cccdExisted)
                {
                    return ApiResponse<HocSinh>.Fail($"Số CCCD '{cccdTrim}' đã tồn tại cho một học sinh khác", 409);
                }
                hs.Cccd = cccdTrim;
            }

            int targetDn = idDn;
            if (targetDn <= 0)
            {
                var firstDn = await _context.DoanhNghieps.Where(d => !d.Xoa).Select(d => d.IdDn).FirstOrDefaultAsync();
                targetDn = firstDn > 0 ? firstDn : 1;
            }

            hs.IdDn = targetDn;
            hs.Xoa = false;

            _context.HocSinhs.Add(hs);
            await _context.SaveChangesAsync();

            return ApiResponse<HocSinh>.Created(hs, _localizer["Student_CreateSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tạo học sinh");
            return ApiResponse<HocSinh>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật thông tin học sinh và cascade cập nhật họ tên vào bảng khóa học liên quan.
    /// </summary>
    public async Task<ApiResponse<HocSinh>> CapNhatHocSinhAsync(int idHs, HocSinh hs)
    {
        try
        {
            var existing = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == idHs && !x.Xoa);
            if (existing == null)
            {
                return ApiResponse<HocSinh>.Fail(_localizer.Get("Student_NotFound", idHs), 404);
            }

            if (!string.IsNullOrWhiteSpace(hs.Cccd))
            {
                var cccdTrim = hs.Cccd.Trim();
                bool cccdExisted = await _context.HocSinhs.AnyAsync(x => x.IdHs != idHs && x.Cccd == cccdTrim && !x.Xoa);
                if (cccdExisted)
                {
                    return ApiResponse<HocSinh>.Fail($"Số CCCD '{cccdTrim}' đã tồn tại cho một học sinh khác", 409);
                }
                existing.Cccd = cccdTrim;
            }

            if (!string.IsNullOrWhiteSpace(hs.HoTen))
            {
                var newHoTen = hs.HoTen.Trim();
                existing.HoTen = newHoTen;

                // Cascade cập nhật họ tên vào cột denormalized trên bảng trung gian hoc_sinh_khoa_hoc (giống Java)
                var hskhList = await _context.HocSinhKhoaHocs.Where(h => h.IdHs == idHs).ToListAsync();
                foreach (var hskh in hskhList)
                {
                    hskh.HoTen = newHoTen;
                }
            }

            if (hs.NgaySinh.HasValue) existing.NgaySinh = hs.NgaySinh.Value;
            if (hs.GioiTinh != null) existing.GioiTinh = hs.GioiTinh;
            if (hs.SoDienThoai != null) existing.SoDienThoai = hs.SoDienThoai.Trim();
            if (hs.DiaChi != null) existing.DiaChi = hs.DiaChi.Trim();
            if (hs.IdPh.HasValue) existing.IdPh = hs.IdPh.Value;

            await _context.SaveChangesAsync();

            return ApiResponse<HocSinh>.Ok(existing, _localizer["Student_UpdateSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi cập nhật học sinh #{IdHs}", idHs);
            return ApiResponse<HocSinh>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm học sinh.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaHocSinhAsync(int idHs)
    {
        try
        {
            var hs = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == idHs && !x.Xoa);
            if (hs == null)
            {
                return ApiResponse<bool>.Fail(_localizer.Get("Student_NotFound", idHs), 404);
            }

            hs.Xoa = true;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, _localizer["Student_DeleteSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa học sinh #{IdHs}", idHs);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu học sinh theo số điện thoại.
    /// </summary>
    public async Task<ApiResponse<List<HocSinhResponseDto>>> TimHocSinhTheoSdtAsync(string sdt, int? idDn)
    {
        try
        {
            var query = _context.HocSinhs
                .Include(h => h.PhuHuynh)
                .Where(h => !h.Xoa && h.SoDienThoai != null && h.SoDienThoai.Contains(sdt.Trim()))
                .AsNoTracking();

            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(h => h.IdDn == idDn.Value);
            }

            var list = await query.Select(h => new HocSinhResponseDto
            {
                IdHs = h.IdHs,
                HoTen = h.HoTen,
                NgaySinh = h.NgaySinh,
                GioiTinh = h.GioiTinh,
                SoDienThoai = h.SoDienThoai,
                Cccd = h.Cccd,
                DiaChi = h.DiaChi,
                IdPh = h.IdPh,
                TenPhuHuynh = h.PhuHuynh != null ? h.PhuHuynh.HoTen : null,
                SdtPhuHuynh = h.PhuHuynh != null ? h.PhuHuynh.Sdt : null,
                IdDn = h.IdDn
            }).ToListAsync();

            return ApiResponse<List<HocSinhResponseDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm học sinh theo SĐT {Sdt}", sdt);
            return ApiResponse<List<HocSinhResponseDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu học sinh theo căn cước công dân.
    /// </summary>
    public async Task<ApiResponse<List<HocSinhResponseDto>>> TimHocSinhTheoCccdAsync(string cccd, int? idDn)
    {
        try
        {
            var query = _context.HocSinhs
                .Include(h => h.PhuHuynh)
                .Where(h => !h.Xoa && h.Cccd != null && h.Cccd.Contains(cccd.Trim()))
                .AsNoTracking();

            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(h => h.IdDn == idDn.Value);
            }

            var list = await query.Select(h => new HocSinhResponseDto
            {
                IdHs = h.IdHs,
                HoTen = h.HoTen,
                NgaySinh = h.NgaySinh,
                GioiTinh = h.GioiTinh,
                SoDienThoai = h.SoDienThoai,
                Cccd = h.Cccd,
                DiaChi = h.DiaChi,
                IdPh = h.IdPh,
                TenPhuHuynh = h.PhuHuynh != null ? h.PhuHuynh.HoTen : null,
                SdtPhuHuynh = h.PhuHuynh != null ? h.PhuHuynh.Sdt : null,
                IdDn = h.IdDn
            }).ToListAsync();

            return ApiResponse<List<HocSinhResponseDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm học sinh theo CCCD {Cccd}", cccd);
            return ApiResponse<List<HocSinhResponseDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách phụ huynh liên kết của một học sinh qua bảng quan hệ đa phụ huynh.
    /// </summary>
    public async Task<ApiResponse<List<PhuHuynhHocSinhDto>>> LayDanhSachPhuHuynhTheoHocSinhAsync(int idHs)
    {
        try
        {
            var list = await _context.PhuHuynhHocSinhs
                .Include(p => p.PhuHuynh)
                .Include(p => p.HocSinh)
                .Where(p => p.IdHs == idHs && !p.Xoa && p.PhuHuynh != null && !p.PhuHuynh.Xoa)
                .AsNoTracking()
                .Select(p => new PhuHuynhHocSinhDto
                {
                    IdPhHs = p.IdPhHs,
                    IdHs = p.IdHs,
                    TenHocSinh = p.HocSinh != null ? p.HocSinh.HoTen : "",
                    IdPh = p.IdPh,
                    TenPhuHuynh = p.PhuHuynh != null ? p.PhuHuynh.HoTen : "",
                    SdtPhuHuynh = p.PhuHuynh != null ? p.PhuHuynh.Sdt : "",
                    LaNguoiDaiDien = p.LaNguoiDaiDien,
                    QuanHe = p.QuanHe
                })
                .ToListAsync();

            // Đảm bảo không bỏ sót nếu học sinh có IdPh trực tiếp mà chưa vào bảng phụ
            var hs = await _context.HocSinhs
                .Include(h => h.PhuHuynh)
                .FirstOrDefaultAsync(h => h.IdHs == idHs && !h.Xoa);

            if (hs?.IdPh != null && hs.PhuHuynh != null && !hs.PhuHuynh.Xoa)
            {
                if (!list.Any(x => x.IdPh == hs.IdPh.Value))
                {
                    list.Add(new PhuHuynhHocSinhDto
                    {
                        IdHs = hs.IdHs,
                        TenHocSinh = hs.HoTen,
                        IdPh = hs.PhuHuynh.IdPh,
                        TenPhuHuynh = hs.PhuHuynh.HoTen,
                        SdtPhuHuynh = hs.PhuHuynh.Sdt ?? "",
                        LaNguoiDaiDien = true,
                        QuanHe = "Người bảo hộ"
                    });
                }
            }

            return ApiResponse<List<PhuHuynhHocSinhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy danh sách phụ huynh của học sinh #{IdHs}", idHs);
            return ApiResponse<List<PhuHuynhHocSinhDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách các học sinh liên kết với một phụ huynh.
    /// </summary>
    public async Task<ApiResponse<List<PhuHuynhHocSinhDto>>> LayDanhSachHocSinhTheoPhuHuynhAsync(int idPh)
    {
        try
        {
            var list = await _context.PhuHuynhHocSinhs
                .Include(p => p.PhuHuynh)
                .Include(p => p.HocSinh)
                .Where(p => p.IdPh == idPh && !p.Xoa && p.HocSinh != null && !p.HocSinh.Xoa)
                .AsNoTracking()
                .Select(p => new PhuHuynhHocSinhDto
                {
                    IdPhHs = p.IdPhHs,
                    IdHs = p.IdHs,
                    TenHocSinh = p.HocSinh != null ? p.HocSinh.HoTen : "",
                    IdPh = p.IdPh,
                    TenPhuHuynh = p.PhuHuynh != null ? p.PhuHuynh.HoTen : "",
                    SdtPhuHuynh = p.PhuHuynh != null ? p.PhuHuynh.Sdt : "",
                    LaNguoiDaiDien = p.LaNguoiDaiDien,
                    QuanHe = p.QuanHe
                })
                .ToListAsync();

            // Đảm bảo không bỏ sót học sinh nào liên kết trực tiếp qua hoc_sinh.id_ph
            var hsDirect = await _context.HocSinhs
                .Where(h => h.IdPh == idPh && !h.Xoa)
                .AsNoTracking()
                .ToListAsync();

            var existingHsIds = list.Select(x => x.IdHs).ToHashSet();
            foreach (var h in hsDirect)
            {
                if (!existingHsIds.Contains(h.IdHs))
                {
                    list.Add(new PhuHuynhHocSinhDto
                    {
                        IdHs = h.IdHs,
                        TenHocSinh = h.HoTen,
                        IdPh = idPh,
                        TenPhuHuynh = "",
                        SdtPhuHuynh = "",
                        LaNguoiDaiDien = true,
                        QuanHe = "Người bảo hộ"
                    });
                }
            }

            return ApiResponse<List<PhuHuynhHocSinhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy danh sách học sinh của phụ huynh #{IdPh}", idPh);
            return ApiResponse<List<PhuHuynhHocSinhDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Gán mối quan hệ phụ huynh - học sinh vào bảng liên kết.
    /// </summary>
    public async Task<ApiResponse<PhuHuynhHocSinhDto>> GanPhuHuynhVaoHocSinhAsync(GanPhuHuynhRequest request)
    {
        try
        {
            var hs = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == request.IdHs && !x.Xoa);
            if (hs == null) return ApiResponse<PhuHuynhHocSinhDto>.Fail("Không tìm thấy học sinh", 404);

            var ph = await _context.PhuHuynhs.FirstOrDefaultAsync(x => x.IdPh == request.IdPh && !x.Xoa);
            if (ph == null) return ApiResponse<PhuHuynhHocSinhDto>.Fail("Không tìm thấy phụ huynh", 404);

            var link = await _context.PhuHuynhHocSinhs
                .FirstOrDefaultAsync(x => x.IdHs == request.IdHs && x.IdPh == request.IdPh);

            if (link != null)
            {
                link.Xoa = false;
                link.LaNguoiDaiDien = request.LaNguoiDaiDien;
                link.QuanHe = request.QuanHe;
            }
            else
            {
                link = new PhuHuynhHocSinh
                {
                    IdHs = request.IdHs,
                    IdPh = request.IdPh,
                    LaNguoiDaiDien = request.LaNguoiDaiDien,
                    QuanHe = request.QuanHe,
                    Xoa = false
                };
                _context.PhuHuynhHocSinhs.Add(link);
            }

            if (request.LaNguoiDaiDien == true)
            {
                hs.IdPh = request.IdPh;
            }

            await _context.SaveChangesAsync();

            var dto = new PhuHuynhHocSinhDto
            {
                IdPhHs = link.IdPhHs,
                IdHs = link.IdHs,
                TenHocSinh = hs.HoTen,
                IdPh = link.IdPh,
                TenPhuHuynh = ph.HoTen,
                SdtPhuHuynh = ph.Sdt,
                LaNguoiDaiDien = link.LaNguoiDaiDien,
                QuanHe = link.QuanHe
            };

            return ApiResponse<PhuHuynhHocSinhDto>.Ok(dto, "Gán phụ huynh thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi gán phụ huynh vào học sinh");
            return ApiResponse<PhuHuynhHocSinhDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mối liên kết giữa phụ huynh và học sinh.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaQuanHePhuHuynhHocSinhAsync(int idHs, int idPh)
    {
        try
        {
            var link = await _context.PhuHuynhHocSinhs
                .FirstOrDefaultAsync(x => x.IdHs == idHs && x.IdPh == idPh && !x.Xoa);

            if (link == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy liên kết phụ huynh - học sinh", 404);
            }

            link.Xoa = true;

            var hs = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == idHs);
            if (hs != null && hs.IdPh == idPh)
            {
                var anotherPh = await _context.PhuHuynhHocSinhs
                    .Where(x => x.IdHs == idHs && x.IdPh != idPh && !x.Xoa)
                    .Select(x => (int?)x.IdPh)
                    .FirstOrDefaultAsync();

                hs.IdPh = anotherPh;
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa quan hệ phụ huynh học sinh thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa quan hệ phụ huynh học sinh #{IdHs}-#{IdPh}", idHs, idPh);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mối liên kết giữa phụ huynh và học sinh theo ID liên kết (bảng phụ phu_huynh_hoc_sinh).
    /// </summary>
    public async Task<ApiResponse<bool>> XoaQuanHePhuHuynhHocSinhByIdAsync(int idPhHs)
    {
        try
        {
            var link = await _context.PhuHuynhHocSinhs
                .FirstOrDefaultAsync(x => x.IdPhHs == idPhHs && !x.Xoa);

            if (link == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy liên kết phụ huynh - học sinh", 404);
            }

            link.Xoa = true;

            var hs = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == link.IdHs);
            if (hs != null && hs.IdPh == link.IdPh)
            {
                var anotherPh = await _context.PhuHuynhHocSinhs
                    .Where(x => x.IdHs == link.IdHs && x.IdPh != link.IdPh && !x.Xoa)
                    .Select(x => (int?)x.IdPh)
                    .FirstOrDefaultAsync();

                hs.IdPh = anotherPh;
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa quan hệ phụ huynh học sinh thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa quan hệ phụ huynh học sinh #{IdPhHs}", idPhHs);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo mới một phụ huynh hoặc tái sử dụng phụ huynh có sẵn theo CCCD và tự động thiết lập liên kết với học sinh.
    /// </summary>
    public async Task<ApiResponse<PhuHuynhHocSinhDto>> TaoMoiPhuHuynhChoHocSinhAsync(int idHs, TaoPhuHuynhChoHocSinhRequest request)
    {
        try
        {
            var hs = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == idHs && !x.Xoa);
            if (hs == null) return ApiResponse<PhuHuynhHocSinhDto>.Fail("Không tìm thấy học sinh", 404);

            if (string.IsNullOrWhiteSpace(request.HoTen))
            {
                return ApiResponse<PhuHuynhHocSinhDto>.Fail("Họ tên phụ huynh không được để trống", 400);
            }

            PhuHuynh? ph = null;
            if (!string.IsNullOrWhiteSpace(request.Cccd))
            {
                var cleanCccd = request.Cccd.Trim();
                ph = await _context.PhuHuynhs.FirstOrDefaultAsync(p => p.Cccd == cleanCccd && !p.Xoa);
            }

            if (ph == null)
            {
                ph = new PhuHuynh
                {
                    HoTen = request.HoTen.Trim(),
                    Sdt = request.Sdt?.Trim(),
                    Cccd = request.Cccd?.Trim(),
                    Email = request.Email?.Trim(),
                    IdDn = request.IdDn ?? hs.IdDn,
                    Xoa = false
                };
                _context.PhuHuynhs.Add(ph);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Nếu phụ huynh đã tồn tại, bổ sung SĐT hoặc Email nếu chưa có
                if (string.IsNullOrWhiteSpace(ph.Sdt) && !string.IsNullOrWhiteSpace(request.Sdt)) ph.Sdt = request.Sdt.Trim();
                if (string.IsNullOrWhiteSpace(ph.Email) && !string.IsNullOrWhiteSpace(request.Email)) ph.Email = request.Email.Trim();
                await _context.SaveChangesAsync();
            }

            var link = await _context.PhuHuynhHocSinhs
                .FirstOrDefaultAsync(x => x.IdHs == idHs && x.IdPh == ph.IdPh);

            if (link != null)
            {
                link.Xoa = false;
                link.LaNguoiDaiDien = request.LaNguoiDaiDien;
                link.QuanHe = request.QuanHe;
            }
            else
            {
                link = new PhuHuynhHocSinh
                {
                    IdHs = idHs,
                    IdPh = ph.IdPh,
                    LaNguoiDaiDien = request.LaNguoiDaiDien,
                    QuanHe = request.QuanHe,
                    Xoa = false
                };
                _context.PhuHuynhHocSinhs.Add(link);
            }

            if (request.LaNguoiDaiDien == true || hs.IdPh == null)
            {
                hs.IdPh = ph.IdPh;
            }

            await _context.SaveChangesAsync();

            var dto = new PhuHuynhHocSinhDto
            {
                IdPhHs = link.IdPhHs,
                IdHs = idHs,
                TenHocSinh = hs.HoTen,
                IdPh = ph.IdPh,
                TenPhuHuynh = ph.HoTen,
                SdtPhuHuynh = ph.Sdt,
                LaNguoiDaiDien = link.LaNguoiDaiDien,
                QuanHe = link.QuanHe
            };

            return ApiResponse<PhuHuynhHocSinhDto>.Created(dto, "Tạo mới và liên kết phụ huynh thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tạo mới phụ huynh cho học sinh #{IdHs}", idHs);
            return ApiResponse<PhuHuynhHocSinhDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu phụ huynh theo số điện thoại.
    /// </summary>
    public async Task<ApiResponse<List<PhuHuynhDto>>> TimPhuHuynhTheoSdtAsync(string sdt, int? idDn)
    {
        try
        {
            var query = _context.PhuHuynhs
                .Where(p => !p.Xoa && p.Sdt != null && p.Sdt.Contains(sdt.Trim()))
                .AsNoTracking();

            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(p => p.IdDn == idDn.Value);
            }

            var list = await query.Select(p => new PhuHuynhDto
            {
                IdPh = p.IdPh,
                IdDn = p.IdDn,
                HoTen = p.HoTen,
                Sdt = p.Sdt,
                Cccd = p.Cccd,
                Email = p.Email
            }).ToListAsync();

            return ApiResponse<List<PhuHuynhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm phụ huynh theo SĐT {Sdt}", sdt);
            return ApiResponse<List<PhuHuynhDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu phụ huynh theo căn cước công dân.
    /// </summary>
    public async Task<ApiResponse<List<PhuHuynhDto>>> TimPhuHuynhTheoCccdAsync(string cccd, int? idDn)
    {
        try
        {
            var query = _context.PhuHuynhs
                .Where(p => !p.Xoa && p.Cccd != null && p.Cccd.Contains(cccd.Trim()))
                .AsNoTracking();

            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(p => p.IdDn == idDn.Value);
            }

            var list = await query.Select(p => new PhuHuynhDto
            {
                IdPh = p.IdPh,
                IdDn = p.IdDn,
                HoTen = p.HoTen,
                Sdt = p.Sdt,
                Cccd = p.Cccd,
                Email = p.Email
            }).ToListAsync();

            return ApiResponse<List<PhuHuynhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm phụ huynh theo CCCD {Cccd}", cccd);
            return ApiResponse<List<PhuHuynhDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Gán một học sinh vào khóa học (và tự động đồng bộ sang dang_ky_hoc nếu khóa học thuộc lớp).
    /// </summary>
    public async Task<ApiResponse<HocSinhKhoaHoc>> GanHocSinhVaoKhoaHocAsync(GanHocSinhKhoaHocDto request)
    {
        try
        {
            var hs = await _context.HocSinhs.FirstOrDefaultAsync(h => h.IdHs == request.IdHs && !h.Xoa);
            if (hs == null) return ApiResponse<HocSinhKhoaHoc>.Fail("Không tìm thấy học sinh", 404);

            var kh = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdKhoaHoc == request.IdKhoaHoc && !k.Xoa);
            if (kh == null) return ApiResponse<HocSinhKhoaHoc>.Fail("Không tìm thấy khóa học", 404);

            var existing = await _context.HocSinhKhoaHocs
                .FirstOrDefaultAsync(h => h.IdHs == request.IdHs && h.IdKhoaHoc == request.IdKhoaHoc);

            HocSinhKhoaHoc item;
            if (existing != null)
            {
                existing.Xoa = false;
                existing.TrangThai = true;
                existing.HoTen = hs.HoTen;
                existing.SoBuoiDaHoc = request.SoBuoiDaHoc;
                item = existing;
            }
            else
            {
                item = new HocSinhKhoaHoc
                {
                    IdHs = request.IdHs,
                    IdKhoaHoc = request.IdKhoaHoc,
                    HoTen = hs.HoTen,
                    NgayDangKy = request.NgayDangKy ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    TrangThai = true,
                    SoBuoiDaHoc = request.SoBuoiDaHoc,
                    IdDn = request.IdDn > 0 ? request.IdDn : hs.IdDn,
                    Xoa = false
                };
                _context.HocSinhKhoaHocs.Add(item);
            }

            // Đồng bộ bản ghi đăng ký lớp học nếu khóa học này gắn với một lớp học cụ thể (giống Java)
            if (kh.IdLop.HasValue && kh.IdLop.Value > 0)
            {
                int idLop = kh.IdLop.Value;
                var dkList = await _context.DangKyHocs
                    .Where(d => d.IdLop == idLop && d.IdHs == request.IdHs)
                    .ToListAsync();

                if (!dkList.Any())
                {
                    var dk = new DangKyHoc
                    {
                        IdHs = request.IdHs,
                        IdLop = idLop,
                        NgayDangKy = request.NgayDangKy ?? DateOnly.FromDateTime(DateTime.UtcNow),
                        TrangThaiThanhToan = false,
                        HocPhi = 0,
                        IdDn = request.IdDn > 0 ? request.IdDn : hs.IdDn,
                        Xoa = false
                    };
                    _context.DangKyHocs.Add(dk);
                }
                else
                {
                    foreach (var dk in dkList)
                    {
                        dk.Xoa = false;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<HocSinhKhoaHoc>.Ok(item, "Gán học sinh vào khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi gán học sinh vào khóa học");
            return ApiResponse<HocSinhKhoaHoc>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Gán hàng loạt nhiều học sinh vào một khóa học.
    /// </summary>
    public async Task<ApiResponse<List<HocSinhKhoaHoc>>> GanNhieuHocSinhVaoKhoaHocAsync(int idKhoaHoc, List<int> dsIdHs)
    {
        try
        {
            var kh = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdKhoaHoc == idKhoaHoc && !k.Xoa);
            if (kh == null) return ApiResponse<List<HocSinhKhoaHoc>>.Fail("Không tìm thấy khóa học", 404);

            var result = new List<HocSinhKhoaHoc>();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var existingLinks = await _context.HocSinhKhoaHocs
                .Where(h => h.IdKhoaHoc == idKhoaHoc && dsIdHs.Contains(h.IdHs))
                .ToListAsync();

            var hsList = await _context.HocSinhs
                .Where(h => dsIdHs.Contains(h.IdHs) && !h.Xoa)
                .ToListAsync();

            List<DangKyHoc>? existingDangKys = null;
            if (kh.IdLop.HasValue && kh.IdLop.Value > 0)
            {
                existingDangKys = await _context.DangKyHocs
                    .Where(d => d.IdLop == kh.IdLop.Value && dsIdHs.Contains(d.IdHs))
                    .ToListAsync();
            }

            foreach (var hs in hsList)
            {
                var ex = existingLinks.FirstOrDefault(x => x.IdHs == hs.IdHs);
                if (ex != null)
                {
                    ex.Xoa = false;
                    ex.TrangThai = true;
                    ex.HoTen = hs.HoTen;
                    result.Add(ex);
                }
                else
                {
                    var item = new HocSinhKhoaHoc
                    {
                        IdHs = hs.IdHs,
                        IdKhoaHoc = idKhoaHoc,
                        HoTen = hs.HoTen,
                        NgayDangKy = today,
                        TrangThai = true,
                        SoBuoiDaHoc = 0,
                        IdDn = kh.IdDn,
                        Xoa = false
                    };
                    _context.HocSinhKhoaHocs.Add(item);
                    result.Add(item);
                }

                // Đồng bộ DangKyHoc nếu khóa học có liên kết lớp học
                if (kh.IdLop.HasValue && kh.IdLop.Value > 0 && existingDangKys != null)
                {
                    var dkEx = existingDangKys.FirstOrDefault(d => d.IdHs == hs.IdHs);
                    if (dkEx != null)
                    {
                        dkEx.Xoa = false;
                    }
                    else
                    {
                        var dk = new DangKyHoc
                        {
                            IdHs = hs.IdHs,
                            IdLop = kh.IdLop.Value,
                            NgayDangKy = today,
                            TrangThaiThanhToan = false,
                            HocPhi = 0,
                            IdDn = kh.IdDn,
                            Xoa = false
                        };
                        _context.DangKyHocs.Add(dk);
                        existingDangKys.Add(dk);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<List<HocSinhKhoaHoc>>.Ok(result, "Gán học sinh vào khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi gán nhiều học sinh vào khóa học");
            return ApiResponse<List<HocSinhKhoaHoc>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách học sinh theo khóa học.
    /// </summary>
    public async Task<ApiResponse<List<HocSinhKhoaHocDto>>> LayDanhSachHocSinhTheoKhoaHocAsync(int idKhoaHoc)
    {
        try
        {
            var list = await _context.HocSinhKhoaHocs
                .Include(h => h.HocSinh)
                .Include(h => h.KhoaHoc)
                .Where(h => h.IdKhoaHoc == idKhoaHoc && !h.Xoa)
                .AsNoTracking()
                .Select(h => new HocSinhKhoaHocDto
                {
                    IdHsKh = h.IdHsKh,
                    IdHs = h.IdHs,
                    TenHocSinh = h.HocSinh != null ? h.HocSinh.HoTen : h.HoTen,
                    SoDienThoai = h.HocSinh != null ? h.HocSinh.SoDienThoai : null,
                    GioiTinh = h.HocSinh != null ? h.HocSinh.GioiTinh : null,
                    IdKhoaHoc = h.IdKhoaHoc,
                    TenKhoaHoc = h.KhoaHoc != null ? h.KhoaHoc.TenKhoaHoc : "",
                    SoBuoiDaHoc = h.SoBuoiDaHoc,
                    TrangThai = h.TrangThai,
                    NgayDangKy = h.NgayDangKy
                })
                .ToListAsync();

            return ApiResponse<List<HocSinhKhoaHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy danh sách học sinh theo khóa học #{IdKhoaHoc}", idKhoaHoc);
            return ApiResponse<List<HocSinhKhoaHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa học sinh khỏi khóa học (đồng thời cascade soft-delete trong dang_ky_hoc nếu khóa học thuộc lớp).
    /// </summary>
    public async Task<ApiResponse<bool>> XoaHocSinhKhoiKhoaHocAsync(int idHs, int idKhoaHoc)
    {
        try
        {
            var item = await _context.HocSinhKhoaHocs
                .FirstOrDefaultAsync(h => h.IdHs == idHs && h.IdKhoaHoc == idKhoaHoc && !h.Xoa);

            if (item == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy bản ghi học sinh trong khóa học", 404);
            }

            item.Xoa = true;
            item.TrangThai = false;

            // Đồng bộ xóa trong dang_ky_hoc nếu khóa học thuộc một lớp học (giống Java)
            var kh = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdKhoaHoc == idKhoaHoc);
            if (kh?.IdLop.HasValue == true && kh.IdLop.Value > 0)
            {
                var dkList = await _context.DangKyHocs
                    .Where(d => d.IdLop == kh.IdLop.Value && d.IdHs == idHs && !d.Xoa)
                    .ToListAsync();
                foreach (var dk in dkList)
                {
                    dk.Xoa = true;
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa học sinh khỏi khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa học sinh #{IdHs} khỏi khóa học #{IdKhoaHoc}", idHs, idKhoaHoc);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }
}
