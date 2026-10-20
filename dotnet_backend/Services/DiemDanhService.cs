using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class DiemDanhService : IDiemDanhService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<DiemDanhService> _logger;
    private readonly ILocalizationService _localizer;

    public DiemDanhService(
        QuanLyTrungTamDbContext context,
        ILogger<DiemDanhService> logger,
        ILocalizationService? localizer = null)
    {
        _context = context;
        _logger = logger;
        _localizer = localizer ?? new LocalizationService();
    }

    /// <summary>
    /// Lưu danh sách điểm danh học sinh theo lô cho một buổi học
    /// </summary>
    public async Task<ApiResponse<List<DiemDanhHocSinh>>> LuuDiemDanhHocSinhBatchAsync(LuuDiemDanhBuoiHocRequest request)
    {
        if (request.IdBuoiHoc <= 0)
        {
            return ApiResponse<List<DiemDanhHocSinh>>.Fail(_localizer["Common_BadRequest"], 400);
        }

        try
        {
            var buoi = await _context.BuoiHocs.FirstOrDefaultAsync(b => b.IdBuoiHoc == request.IdBuoiHoc && !b.Xoa);
            if (buoi == null)
            {
                return ApiResponse<List<DiemDanhHocSinh>>.Fail(_localizer.Get("Attendance_SessionNotFound", request.IdBuoiHoc), 404);
            }

            int idKhoaHoc = request.IdKhoaHoc ?? buoi.IdKhoaHoc;
            var results = new List<DiemDanhHocSinh>();

            // Thu thập toàn bộ ID học sinh của lớp học & khóa học (giống Java)
            var allClassStudentIds = new HashSet<int>();
            if (idKhoaHoc > 0)
            {
                var hskhIds = await _context.HocSinhKhoaHocs
                    .Where(h => h.IdKhoaHoc == idKhoaHoc && !h.Xoa)
                    .Select(h => h.IdHs)
                    .ToListAsync();
                foreach (var id in hskhIds) allClassStudentIds.Add(id);
            }

            if (buoi.IdLop > 0)
            {
                var dkIds = await _context.DangKyHocs
                    .Where(d => d.IdLop == buoi.IdLop && !d.Xoa)
                    .Select(d => d.IdHs)
                    .ToListAsync();
                foreach (var id in dkIds) allClassStudentIds.Add(id);
            }

            // Gộp thêm bất kỳ học sinh nào được gửi trong request
            foreach (var item in request.DanhSach)
            {
                allClassStudentIds.Add(item.IdHs);
            }

            var requestMap = request.DanhSach.ToDictionary(
                x => x.IdHs,
                x => x.TrangThai == "CO_MAT" || x.TrangThai == "1" || x.TrangThai.Equals("true", StringComparison.OrdinalIgnoreCase)
            );

            var existingRecords = await _context.DiemDanhHocSinhs
                .Where(d => d.IdBuoiHoc == request.IdBuoiHoc && allClassStudentIds.Contains(d.IdHs) && !d.Xoa)
                .ToDictionaryAsync(d => d.IdHs);

            foreach (var hsId in allClassStudentIds)
            {
                // Nếu có trong request: lấy trạng thái truyền lên; nếu không: mặc định là vắng mặt (false)
                bool isCoMat = requestMap.TryGetValue(hsId, out var status) && status;

                if (existingRecords.TryGetValue(hsId, out var record))
                {
                    record.TrangThai = isCoMat;
                    results.Add(record);
                }
                else
                {
                    var newRecord = new DiemDanhHocSinh
                    {
                        IdBuoiHoc = request.IdBuoiHoc,
                        IdHs = hsId,
                        IdKhoaHoc = idKhoaHoc,
                        IdDn = buoi.IdDn,
                        TrangThai = isCoMat,
                        Xoa = false
                    };
                    _context.DiemDanhHocSinhs.Add(newRecord);
                    results.Add(newRecord);
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<List<DiemDanhHocSinh>>.Ok(results, _localizer.Get("Attendance_SaveSuccess", results.Count));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi điểm danh học sinh buổi học {IdBuoiHoc}", request.IdBuoiHoc);
            return ApiResponse<List<DiemDanhHocSinh>>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách điểm danh học sinh của một buổi học cụ thể
    /// </summary>
    public async Task<ApiResponse<List<DiemDanhHocSinh>>> LayDiemDanhTheoBuoiHocAsync(int idBuoiHoc)
    {
        try
        {
            var list = await _context.DiemDanhHocSinhs
                .Include(d => d.HocSinh)
                .Where(d => d.IdBuoiHoc == idBuoiHoc && !d.Xoa)
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<DiemDanhHocSinh>>.Ok(list, _localizer["Common_Success"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách điểm danh buổi học {IdBuoiHoc}", idBuoiHoc);
            return ApiResponse<List<DiemDanhHocSinh>>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy lịch sử điểm danh của một học sinh theo khóa học hoặc toàn bộ khóa
    /// </summary>
    public async Task<ApiResponse<List<DiemDanhHocSinh>>> LayLichSuDiemDanhHocSinhAsync(int idHs, int? idKhoaHoc)
    {
        try
        {
            var query = _context.DiemDanhHocSinhs
                .Include(d => d.BuoiHoc)
                .Include(d => d.KhoaHoc)
                .Where(d => d.IdHs == idHs && !d.Xoa)
                .AsNoTracking();

            if (idKhoaHoc.HasValue && idKhoaHoc.Value > 0)
            {
                query = query.Where(d => d.IdKhoaHoc == idKhoaHoc.Value);
            }

            var list = await query
                .OrderByDescending(d => d.IdBuoiHoc)
                .ToListAsync();

            return ApiResponse<List<DiemDanhHocSinh>>.Ok(list, _localizer["Common_Success"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy lịch sử điểm danh học sinh #{IdHs}", idHs);
            return ApiResponse<List<DiemDanhHocSinh>>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy lịch sử điểm danh làm việc của giáo viên
    /// </summary>
    public async Task<ApiResponse<List<DiemDanhGiaoVien>>> LayLichSuDiemDanhGiaoVienAsync(int idGv, int? idBuoiHoc)
    {
        try
        {
            var query = _context.DiemDanhGiaoViens
                .Include(d => d.BuoiHoc)
                .Include(d => d.GiaoVien)
                .Where(d => d.IdGv == idGv && !d.Xoa)
                .AsNoTracking();

            if (idBuoiHoc.HasValue && idBuoiHoc.Value > 0)
            {
                query = query.Where(d => d.IdBuoiHoc == idBuoiHoc.Value);
            }

            var list = await query
                .OrderByDescending(d => d.IdBuoiHoc)
                .ToListAsync();

            return ApiResponse<List<DiemDanhGiaoVien>>.Ok(list, _localizer["Common_Success"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy lịch sử điểm danh giáo viên #{IdGv}", idGv);
            return ApiResponse<List<DiemDanhGiaoVien>>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa danh sách điểm danh học sinh trong một buổi học
    /// </summary>
    public async Task<ApiResponse<bool>> XoaDiemDanhHocSinhBuoiHocAsync(int idBuoiHoc, List<int>? idDiemDanhs)
    {
        try
        {
            var query = _context.DiemDanhHocSinhs.Where(d => d.IdBuoiHoc == idBuoiHoc && !d.Xoa);

            if (idDiemDanhs != null && idDiemDanhs.Any())
            {
                query = query.Where(d => idDiemDanhs.Contains(d.IdDiemDanh));
            }

            var items = await query.ToListAsync();
            if (!items.Any())
            {
                return ApiResponse<bool>.Ok(true, "Không có bản ghi điểm danh nào cần xóa");
            }

            foreach (var item in items)
            {
                item.Xoa = true;
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, $"Đã xóa {items.Count} bản ghi điểm danh học sinh");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa điểm danh học sinh buổi học #{IdBuoiHoc}", idBuoiHoc);
            return ApiResponse<bool>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Điểm danh hoặc lưu trạng thái giảng dạy của giáo viên cho buổi học
    /// </summary>
    public async Task<ApiResponse<DiemDanhGiaoVien>> DiemDanhGiaoVienAsync(DiemDanhGiaoVienRequest request)
    {
        try
        {
            var buoi = await _context.BuoiHocs.FirstOrDefaultAsync(b => b.IdBuoiHoc == request.IdBuoiHoc && !b.Xoa);
            if (buoi == null)
            {
                return ApiResponse<DiemDanhGiaoVien>.Fail(_localizer["Common_NotFound"], 404);
            }

            var gv = await _context.GiaoViens.FirstOrDefaultAsync(g => g.IdGv == request.IdGv && !g.Xoa);
            if (gv == null)
            {
                return ApiResponse<DiemDanhGiaoVien>.Fail(_localizer["Common_NotFound"], 404);
            }

            var existing = await _context.DiemDanhGiaoViens
                .FirstOrDefaultAsync(d => d.IdBuoiHoc == request.IdBuoiHoc && d.IdGv == request.IdGv && !d.Xoa);

            if (existing != null)
            {
                existing.TrangThai = request.TrangThai;
                await _context.SaveChangesAsync();
                return ApiResponse<DiemDanhGiaoVien>.Ok(existing, _localizer["Attendance_GvSuccess"]);
            }

            var entity = new DiemDanhGiaoVien
            {
                IdBuoiHoc = request.IdBuoiHoc,
                IdGv = request.IdGv,
                IdDn = buoi.IdDn,
                TrangThai = request.TrangThai,
                Xoa = false
            };

            _context.DiemDanhGiaoViens.Add(entity);
            await _context.SaveChangesAsync();

            return ApiResponse<DiemDanhGiaoVien>.Created(entity, _localizer["Attendance_GvSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi điểm danh giáo viên");
            return ApiResponse<DiemDanhGiaoVien>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật trạng thái điểm danh giảng dạy của giáo viên
    /// </summary>
    public async Task<ApiResponse<DiemDanhGiaoVien>> CapNhatDiemDanhGiaoVienAsync(int idDiemDanh, string trangThai)
    {
        try
        {
            var item = await _context.DiemDanhGiaoViens.FirstOrDefaultAsync(d => d.IdDiemDanh == idDiemDanh && !d.Xoa);
            if (item == null)
            {
                return ApiResponse<DiemDanhGiaoVien>.Fail("Không tìm thấy bản ghi điểm danh giáo viên", 404);
            }

            item.TrangThai = trangThai;
            await _context.SaveChangesAsync();

            return ApiResponse<DiemDanhGiaoVien>.Ok(item, "Cập nhật điểm danh giáo viên thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật điểm danh giáo viên #{IdDiemDanh}", idDiemDanh);
            return ApiResponse<DiemDanhGiaoVien>.Fail("Lỗi cập nhật: " + ex.Message, 500);
        }
    }
}
