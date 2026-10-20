using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class TaiChinhService : ITaiChinhService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<TaiChinhService> _logger;
    private readonly ILocalizationService _localizer;

    public TaiChinhService(
        QuanLyTrungTamDbContext context,
        ILogger<TaiChinhService> logger,
        ILocalizationService? localizer = null)
    {
        _context = context;
        _logger = logger;
        _localizer = localizer ?? new LocalizationService();
    }

    /// <summary>
    /// Lập phiếu thu học phí và tự động ghi sổ quỹ chi nhánh.
    /// Tái sử dụng: Được gọi khi thu ngân xác nhận nạp tiền học phí.
    /// Logic: Tạo bản ghi PhieuThuHocPhi, tính giảm giá nếu có, tự động thêm giao dịch THU vào SoQuyThuChi.
    /// </summary>
    public async Task<ApiResponse<PhieuThuHocPhi>> LapPhieuThuHocPhiAsync(TaoPhieuThuRequest request)
    {
        if (request.IdHs <= 0)
        {
            return ApiResponse<PhieuThuHocPhi>.Fail("Học sinh không hợp lệ", 400);
        }

        if (request.SoTien <= 0)
        {
            return ApiResponse<PhieuThuHocPhi>.Fail("Số tiền học phí phải lớn hơn 0", 400);
        }

        try
        {
            decimal phanTram = request.PhanTramGiam ?? 0;
            if (phanTram < 0 || phanTram > 100)
            {
                return ApiResponse<PhieuThuHocPhi>.Fail("Phần trăm giảm giá phải từ 0 đến 100%", 400);
            }

            decimal thucThu = request.SoTien * (1 - (phanTram / 100m));
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            int targetIdDn = request.IdDn > 0 ? request.IdDn : 1;
            if (targetIdDn == 1)
            {
                var hs = await _context.HocSinhs.FirstOrDefaultAsync(h => h.IdHs == request.IdHs && !h.Xoa);
                if (hs != null && hs.IdDn > 0) targetIdDn = hs.IdDn;
            }

            int targetIdCn = 1;
            if (request.IdDangKy.HasValue && request.IdDangKy.Value > 0)
            {
                var dk = await _context.DangKyHocs
                    .Include(d => d.LopHoc)
                    .FirstOrDefaultAsync(d => d.IdDangKy == request.IdDangKy.Value);
                if (dk != null)
                {
                    dk.TrangThaiThanhToan = true;
                    if (dk.LopHoc != null && dk.LopHoc.IdCn > 0)
                    {
                        targetIdCn = dk.LopHoc.IdCn;
                    }
                }
            }

            var phieu = new PhieuThuHocPhi
            {
                IdHs = request.IdHs,
                IdDangKy = request.IdDangKy,
                SoTienThu = thucThu,
                NgayThu = today,
                PhuongThuc = request.HinhThucThanhToan,
                IdDn = targetIdDn,
                Xoa = false
            };

            _context.PhieuThuHocPhis.Add(phieu);

            var soQuy = new SoQuyThuChi
            {
                IdCn = targetIdCn,
                IdDn = targetIdDn,
                LoaiGiaoDich = "THU",
                SoTien = thucThu,
                NgayGiaoDich = today,
                MoTa = $"Thu học phí học sinh ID #{request.IdHs} - {request.HinhThucThanhToan}",
                Xoa = false
            };
            _context.SoQuyThuChis.Add(soQuy);

            // Đồng bộ tiến độ nộp học phí khóa học của học sinh
            int? targetKhoaHocId = request.IdKhoaHoc;
            if (!targetKhoaHocId.HasValue && request.IdDangKy.HasValue)
            {
                var dk = await _context.DangKyHocs.FirstOrDefaultAsync(d => d.IdDangKy == request.IdDangKy.Value);
                if (dk != null)
                {
                    var kh = await _context.KhoaHocs.FirstOrDefaultAsync(k => k.IdLop == dk.IdLop && !k.TrangThaiHoanThanh && !k.Xoa);
                    if (kh != null) targetKhoaHocId = kh.IdKhoaHoc;
                }
            }

            if (targetKhoaHocId.HasValue && targetKhoaHocId.Value > 0)
            {
                var ttHsKh = await _context.ThanhToanHocPhiKhoaHocHocSinhs
                    .FirstOrDefaultAsync(t => t.IdHs == request.IdHs && t.IdKhoaHoc == targetKhoaHocId.Value && !t.Xoa);

                if (ttHsKh == null)
                {
                    var hskh = await _context.HocSinhKhoaHocs
                        .FirstOrDefaultAsync(h => h.IdHs == request.IdHs && h.IdKhoaHoc == targetKhoaHocId.Value);

                    ttHsKh = new ThanhToanHocPhiKhoaHocHocSinh
                    {
                        IdHs = request.IdHs,
                        IdKhoaHoc = targetKhoaHocId.Value,
                        IdHsKh = hskh?.IdHsKh ?? 0,
                        IdDn = targetIdDn,
                        TongTienPhaiNap = request.SoTien,
                        SoTienDaNap = 0,
                        Xoa = false
                    };
                    _context.ThanhToanHocPhiKhoaHocHocSinhs.Add(ttHsKh);
                }

                ttHsKh.SoTienDaNap += thucThu;
                if (ttHsKh.TongTienPhaiNap <= 0) ttHsKh.TongTienPhaiNap = request.SoTien;
                ttHsKh.TrangThai = ttHsKh.SoTienDaNap >= ttHsKh.TongTienPhaiNap;
                ttHsKh.IdPhieuThu = phieu.IdPhieuThu;
            }

            await _context.SaveChangesAsync();

            // Cập nhật Rollup 4 cấp
            await CapNhatRollupThuChiAsync(targetIdDn, targetIdCn, today, thucThu, 0, $"Thu học phí học sinh #{request.IdHs}");

            return ApiResponse<PhieuThuHocPhi>.Created(phieu, _localizer["Finance_ReceiptSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lập phiếu thu học phí cho học sinh {IdHs}", request.IdHs);
            return ApiResponse<PhieuThuHocPhi>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu lịch sử các phiếu thu của một học sinh.
    /// </summary>
    public async Task<ApiResponse<List<PhieuThuHocPhi>>> TimPhieuThuTheoHocSinhAsync(int idHs)
    {
        try
        {
            var list = await _context.PhieuThuHocPhis
                .Where(p => p.IdHs == idHs && !p.Xoa)
                .OrderByDescending(p => p.NgayThu)
                .ToListAsync();

            return ApiResponse<List<PhieuThuHocPhi>>.Ok(list, _localizer["Common_Success"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm phiếu thu theo học sinh {IdHs}", idHs);
            return ApiResponse<List<PhieuThuHocPhi>>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Thống kê tổng hợp doanh thu và chi phí trong một khoảng thời gian.
    /// </summary>
    public async Task<ApiResponse<BaoCaoThuChiSummaryDto>> LayBaoCaoTongHopAsync(int idDn, DateOnly? tuNgay, DateOnly? denNgay)
    {
        try
        {
            var query = _context.SoQuyThuChis.Where(s => s.IdDn == idDn && !s.Xoa);

            if (tuNgay.HasValue) query = query.Where(s => s.NgayGiaoDich >= tuNgay.Value);
            if (denNgay.HasValue) query = query.Where(s => s.NgayGiaoDich <= denNgay.Value);

            var aggregates = await query
                .GroupBy(s => s.LoaiGiaoDich)
                .Select(g => new
                {
                    LoaiGiaoDich = g.Key,
                    TongTien = g.Sum(s => s.SoTien),
                    SoPhieu = g.Count()
                })
                .ToListAsync();

            decimal tongThu = aggregates.FirstOrDefault(x => x.LoaiGiaoDich == "THU")?.TongTien ?? 0m;
            decimal tongChi = aggregates.FirstOrDefault(x => x.LoaiGiaoDich == "CHI")?.TongTien ?? 0m;
            int soPhieuThu = aggregates.FirstOrDefault(x => x.LoaiGiaoDich == "THU")?.SoPhieu ?? 0;
            int soPhieuChi = aggregates.FirstOrDefault(x => x.LoaiGiaoDich == "CHI")?.SoPhieu ?? 0;

            var summary = new BaoCaoThuChiSummaryDto
            {
                TongThu = tongThu,
                TongChi = tongChi,
                SoPhieuThu = soPhieuThu,
                SoPhieuChi = soPhieuChi
            };

            return ApiResponse<BaoCaoThuChiSummaryDto>.Ok(summary, _localizer["Finance_CashbookSuccess"]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tính toán báo cáo thu chi");
            return ApiResponse<BaoCaoThuChiSummaryDto>.Fail(_localizer["Common_InternalError"] + ": " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Ghi nhận trực tiếp một giao dịch thu hoặc chi vào sổ quỹ.
    /// </summary>
    public async Task<ApiResponse<SoQuyThuChi>> GhiSoQuyAsync(SoQuyThuChi soQuy)
    {
        soQuy.NgayGiaoDich ??= DateOnly.FromDateTime(DateTime.UtcNow);
        soQuy.Xoa = false;

        _context.SoQuyThuChis.Add(soQuy);
        await _context.SaveChangesAsync();

        bool isThu = string.Equals(soQuy.LoaiGiaoDich?.Trim(), "THU", StringComparison.OrdinalIgnoreCase);
        bool isChi = string.Equals(soQuy.LoaiGiaoDich?.Trim(), "CHI", StringComparison.OrdinalIgnoreCase);
        decimal thu = isThu ? soQuy.SoTien : 0;
        decimal chi = isChi ? soQuy.SoTien : 0;

        await CapNhatRollupThuChiAsync(soQuy.IdDn, soQuy.IdCn, soQuy.NgayGiaoDich.Value, thu, chi, soQuy.MoTa);

        return ApiResponse<SoQuyThuChi>.Created(soQuy, _localizer["Finance_PaymentRecorded"]);
    }

    /// <summary>
    /// Xóa giao dịch sổ quỹ và hoàn tác số dư Rollup
    /// </summary>
    public async Task<ApiResponse<bool>> XoaSoQuyAsync(int idGd)
    {
        try
        {
            var item = await _context.SoQuyThuChis.FirstOrDefaultAsync(s => s.IdGiaoDich == idGd && !s.Xoa);
            if (item == null) return ApiResponse<bool>.Fail("Không tìm thấy giao dịch", 404);

            item.Xoa = true;
            await _context.SaveChangesAsync();

            bool isThu = string.Equals(item.LoaiGiaoDich?.Trim(), "THU", StringComparison.OrdinalIgnoreCase);
            bool isChi = string.Equals(item.LoaiGiaoDich?.Trim(), "CHI", StringComparison.OrdinalIgnoreCase);

            decimal thu = isThu ? -item.SoTien : 0;
            decimal chi = isChi ? -item.SoTien : 0;

            if (item.NgayGiaoDich.HasValue)
            {
                await CapNhatRollupThuChiAsync(item.IdDn, item.IdCn, item.NgayGiaoDich.Value, thu, chi, $"Hủy giao dịch sổ quỹ: {item.MoTa}");
            }

            return ApiResponse<bool>.Ok(true, "Xóa giao dịch sổ quỹ và hoàn tác báo cáo thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa giao dịch sổ quỹ #{IdGd}", idGd);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo đơn bảo lưu khóa học cho học sinh và đồng bộ trạng thái khóa học sang tạm dừng.
    /// </summary>
    public async Task<ApiResponse<BaoLuuKhoaHocDto>> TaoBaoLuuAsync(TaoBaoLuuRequest request)
    {
        try
        {
            if (request.IdHs <= 0 || request.IdLop <= 0)
            {
                return ApiResponse<BaoLuuKhoaHocDto>.Fail("Học sinh hoặc lớp học không hợp lệ", 400);
            }

            var hs = await _context.HocSinhs.FirstOrDefaultAsync(x => x.IdHs == request.IdHs && !x.Xoa);
            if (hs == null) return ApiResponse<BaoLuuKhoaHocDto>.Fail("Không tìm thấy học sinh", 404);

            var lop = await _context.LopHocs.FirstOrDefaultAsync(x => x.IdLop == request.IdLop && !x.Xoa);
            if (lop == null) return ApiResponse<BaoLuuKhoaHocDto>.Fail("Không tìm thấy lớp học", 404);

            int targetDangKy = request.IdDangKy;
            if (targetDangKy <= 0)
            {
                var dk = await _context.DangKyHocs
                    .FirstOrDefaultAsync(d => d.IdHs == request.IdHs && d.IdLop == request.IdLop && !d.Xoa);
                if (dk != null)
                {
                    targetDangKy = dk.IdDangKy;
                }
                else
                {
                    var newDk = new DangKyHoc
                    {
                        IdHs = request.IdHs,
                        IdLop = request.IdLop,
                        NgayDangKy = request.NgayBatDau ?? DateOnly.FromDateTime(DateTime.UtcNow),
                        TrangThaiThanhToan = false,
                        HocPhi = 0,
                        IdDn = request.IdDn > 0 ? request.IdDn : lop.IdDn,
                        Xoa = false
                    };
                    _context.DangKyHocs.Add(newDk);
                    await _context.SaveChangesAsync();
                    targetDangKy = newDk.IdDangKy;
                }
            }

            var baoLuu = new BaoLuuKhoaHoc
            {
                IdHs = request.IdHs,
                IdLop = request.IdLop,
                IdDangKy = targetDangKy,
                IdDn = request.IdDn > 0 ? request.IdDn : lop.IdDn,
                NgayBatDau = request.NgayBatDau ?? DateOnly.FromDateTime(DateTime.UtcNow),
                NgayKetThuc = request.NgayKetThuc,
                SoBuoiDaHoc = request.SoBuoiDaHoc ?? 0,
                TrangThaiBaoLuu = true,
                Xoa = false
            };

            _context.BaoLuuKhoaHocs.Add(baoLuu);

            var dsKhoaHoc = await _context.KhoaHocs
                .Where(kh => kh.IdLop == request.IdLop && !kh.Xoa)
                .Select(kh => kh.IdKhoaHoc)
                .ToListAsync();

            if (dsKhoaHoc.Count > 0)
            {
                var hskhList = await _context.HocSinhKhoaHocs
                    .Where(h => h.IdHs == request.IdHs && dsKhoaHoc.Contains(h.IdKhoaHoc))
                    .ToListAsync();

                foreach (var h in hskhList)
                {
                    h.TrangThai = false;
                }
            }

            await _context.SaveChangesAsync();

            var dto = new BaoLuuKhoaHocDto
            {
                IdBaoLuu = baoLuu.IdBaoLuu,
                IdHs = baoLuu.IdHs,
                TenHocSinh = hs.HoTen,
                IdLop = baoLuu.IdLop,
                TenLop = lop.TenLop,
                IdDangKy = baoLuu.IdDangKy,
                IdDn = baoLuu.IdDn,
                NgayBatDau = baoLuu.NgayBatDau,
                NgayKetThuc = baoLuu.NgayKetThuc,
                SoBuoiDaHoc = baoLuu.SoBuoiDaHoc,
                TrangThaiBaoLuu = baoLuu.TrangThaiBaoLuu
            };

            return ApiResponse<BaoLuuKhoaHocDto>.Created(dto, "Tạo đơn bảo lưu khóa học thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tạo bảo lưu khóa học");
            return ApiResponse<BaoLuuKhoaHocDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Phê duyệt hoặc cập nhật trạng thái bảo lưu khóa học.
    /// </summary>
    public async Task<ApiResponse<BaoLuuKhoaHocDto>> DuyetBaoLuuAsync(int idBaoLuu, DuyetBaoLuuRequest request)
    {
        try
        {
            var bl = await _context.BaoLuuKhoaHocs
                .Include(x => x.HocSinh)
                .Include(x => x.LopHoc)
                .FirstOrDefaultAsync(x => x.IdBaoLuu == idBaoLuu && !x.Xoa);

            if (bl == null)
            {
                return ApiResponse<BaoLuuKhoaHocDto>.Fail("Không tìm thấy đơn bảo lưu", 404);
            }

            bl.TrangThaiBaoLuu = request.TrangThaiBaoLuu;
            if (request.NgayKetThuc.HasValue)
            {
                bl.NgayKetThuc = request.NgayKetThuc.Value;
            }

            var dsKhoaHoc = await _context.KhoaHocs
                .Where(kh => kh.IdLop == bl.IdLop && !kh.Xoa)
                .Select(kh => kh.IdKhoaHoc)
                .ToListAsync();

            if (dsKhoaHoc.Count > 0)
            {
                var hskhList = await _context.HocSinhKhoaHocs
                    .Where(h => h.IdHs == bl.IdHs && dsKhoaHoc.Contains(h.IdKhoaHoc))
                    .ToListAsync();

                foreach (var h in hskhList)
                {
                    h.TrangThai = !request.TrangThaiBaoLuu;
                }
            }

            await _context.SaveChangesAsync();

            var dto = new BaoLuuKhoaHocDto
            {
                IdBaoLuu = bl.IdBaoLuu,
                IdHs = bl.IdHs,
                TenHocSinh = bl.HocSinh?.HoTen ?? "",
                IdLop = bl.IdLop,
                TenLop = bl.LopHoc?.TenLop ?? "",
                IdDangKy = bl.IdDangKy,
                IdDn = bl.IdDn,
                NgayBatDau = bl.NgayBatDau,
                NgayKetThuc = bl.NgayKetThuc,
                SoBuoiDaHoc = bl.SoBuoiDaHoc,
                TrangThaiBaoLuu = bl.TrangThaiBaoLuu
            };

            return ApiResponse<BaoLuuKhoaHocDto>.Ok(dto, "Cập nhật phê duyệt bảo lưu thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi duyệt bảo lưu #{IdBaoLuu}", idBaoLuu);
            return ApiResponse<BaoLuuKhoaHocDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Hoàn trả bảo lưu: Ghi nhận ngày kết thúc/hoàn trả bảo lưu và khôi phục trạng thái học tập của học sinh
    /// </summary>
    public async Task<ApiResponse<BaoLuuKhoaHocDto>> HoanTraBaoLuuAsync(int idBaoLuu)
    {
        try
        {
            var bl = await _context.BaoLuuKhoaHocs
                .Include(x => x.HocSinh)
                .Include(x => x.LopHoc)
                .FirstOrDefaultAsync(x => x.IdBaoLuu == idBaoLuu && !x.Xoa);

            if (bl == null)
            {
                return ApiResponse<BaoLuuKhoaHocDto>.Fail("Không tìm thấy đơn bảo lưu", 404);
            }

            bl.TrangThaiBaoLuu = false;
            bl.NgayHoanTra = DateOnly.FromDateTime(DateTime.Today);
            if (bl.NgayKetThuc == null)
            {
                bl.NgayKetThuc = DateOnly.FromDateTime(DateTime.Today);
            }

            // Khôi phục trạng thái đang học cho học sinh trong các khóa học thuộc lớp này
            var dsKhoaHoc = await _context.KhoaHocs
                .Where(kh => kh.IdLop == bl.IdLop && !kh.Xoa)
                .Select(kh => kh.IdKhoaHoc)
                .ToListAsync();

            if (dsKhoaHoc.Count > 0)
            {
                var hskhList = await _context.HocSinhKhoaHocs
                    .Where(h => h.IdHs == bl.IdHs && dsKhoaHoc.Contains(h.IdKhoaHoc))
                    .ToListAsync();

                foreach (var h in hskhList)
                {
                    h.TrangThai = true;
                }
            }

            // Khôi phục trạng thái DangKyHoc nếu có
            if (bl.IdDangKy > 0)
            {
                var dk = await _context.DangKyHocs.FirstOrDefaultAsync(d => d.IdDangKy == bl.IdDangKy);
                if (dk != null)
                {
                    dk.Xoa = false;
                }
            }

            await _context.SaveChangesAsync();

            var dto = new BaoLuuKhoaHocDto
            {
                IdBaoLuu = bl.IdBaoLuu,
                IdHs = bl.IdHs,
                TenHocSinh = bl.HocSinh?.HoTen ?? "",
                IdLop = bl.IdLop,
                TenLop = bl.LopHoc?.TenLop ?? "",
                IdDangKy = bl.IdDangKy,
                IdDn = bl.IdDn,
                NgayBatDau = bl.NgayBatDau,
                NgayKetThuc = bl.NgayKetThuc,
                NgayHoanTra = bl.NgayHoanTra,
                SoBuoiDaHoc = bl.SoBuoiDaHoc,
                TrangThaiBaoLuu = bl.TrangThaiBaoLuu
            };

            return ApiResponse<BaoLuuKhoaHocDto>.Ok(dto, "Hoàn trả bảo lưu và khôi phục trạng thái học tập thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hoàn trả bảo lưu #{IdBaoLuu}", idBaoLuu);
            return ApiResponse<BaoLuuKhoaHocDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa đơn bảo lưu và hoàn trả trạng thái học cho học sinh.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaBaoLuuKhoaHocAsync(int idBaoLuu)
    {
        try
        {
            var bl = await _context.BaoLuuKhoaHocs.FirstOrDefaultAsync(x => x.IdBaoLuu == idBaoLuu && !x.Xoa);
            if (bl == null) return ApiResponse<bool>.Fail("Không tìm thấy đơn bảo lưu", 404);

            bl.Xoa = true;

            var dsKhoaHoc = await _context.KhoaHocs
                .Where(kh => kh.IdLop == bl.IdLop && !kh.Xoa)
                .Select(kh => kh.IdKhoaHoc)
                .ToListAsync();

            if (dsKhoaHoc.Count > 0)
            {
                var hskhList = await _context.HocSinhKhoaHocs
                    .Where(h => h.IdHs == bl.IdHs && dsKhoaHoc.Contains(h.IdKhoaHoc))
                    .ToListAsync();

                foreach (var h in hskhList)
                {
                    h.TrangThai = true;
                }
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa đơn bảo lưu thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa bảo lưu #{IdBaoLuu}", idBaoLuu);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách bảo lưu theo học sinh.
    /// </summary>
    public async Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoHocSinhAsync(int idHs)
    {
        try
        {
            var list = await _context.BaoLuuKhoaHocs
                .Where(b => b.IdHs == idHs && !b.Xoa)
                .Include(b => b.HocSinh)
                .Include(b => b.LopHoc)
                .AsNoTracking()
                .Select(b => new BaoLuuKhoaHocDto
                {
                    IdBaoLuu = b.IdBaoLuu,
                    IdHs = b.IdHs,
                    TenHocSinh = b.HocSinh != null ? b.HocSinh.HoTen : "",
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdDangKy = b.IdDangKy,
                    IdDn = b.IdDn,
                    NgayBatDau = b.NgayBatDau,
                    NgayKetThuc = b.NgayKetThuc,
                    SoBuoiDaHoc = b.SoBuoiDaHoc,
                    TrangThaiBaoLuu = b.TrangThaiBaoLuu,
                    NgayHoanTra = b.NgayHoanTra
                })
                .ToListAsync();

            return ApiResponse<List<BaoLuuKhoaHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm bảo lưu theo học sinh #{IdHs}", idHs);
            return ApiResponse<List<BaoLuuKhoaHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách bảo lưu theo lớp học.
    /// </summary>
    public async Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoLopAsync(int idLop)
    {
        try
        {
            var list = await _context.BaoLuuKhoaHocs
                .Where(b => b.IdLop == idLop && !b.Xoa)
                .Include(b => b.HocSinh)
                .Include(b => b.LopHoc)
                .AsNoTracking()
                .Select(b => new BaoLuuKhoaHocDto
                {
                    IdBaoLuu = b.IdBaoLuu,
                    IdHs = b.IdHs,
                    TenHocSinh = b.HocSinh != null ? b.HocSinh.HoTen : "",
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdDangKy = b.IdDangKy,
                    IdDn = b.IdDn,
                    NgayBatDau = b.NgayBatDau,
                    NgayKetThuc = b.NgayKetThuc,
                    SoBuoiDaHoc = b.SoBuoiDaHoc,
                    TrangThaiBaoLuu = b.TrangThaiBaoLuu,
                    NgayHoanTra = b.NgayHoanTra
                })
                .ToListAsync();

            return ApiResponse<List<BaoLuuKhoaHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm bảo lưu theo lớp #{IdLop}", idLop);
            return ApiResponse<List<BaoLuuKhoaHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách bảo lưu theo chi nhánh.
    /// </summary>
    public async Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoChiNhanhAsync(int idCn)
    {
        try
        {
            var list = await _context.BaoLuuKhoaHocs
                .Where(b => !b.Xoa && b.LopHoc != null && b.LopHoc.IdCn == idCn)
                .Include(b => b.HocSinh)
                .Include(b => b.LopHoc)
                .AsNoTracking()
                .Select(b => new BaoLuuKhoaHocDto
                {
                    IdBaoLuu = b.IdBaoLuu,
                    IdHs = b.IdHs,
                    TenHocSinh = b.HocSinh != null ? b.HocSinh.HoTen : "",
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdDangKy = b.IdDangKy,
                    IdDn = b.IdDn,
                    NgayBatDau = b.NgayBatDau,
                    NgayKetThuc = b.NgayKetThuc,
                    SoBuoiDaHoc = b.SoBuoiDaHoc,
                    TrangThaiBaoLuu = b.TrangThaiBaoLuu,
                    NgayHoanTra = b.NgayHoanTra
                })
                .ToListAsync();

            return ApiResponse<List<BaoLuuKhoaHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm bảo lưu theo chi nhánh #{IdCn}", idCn);
            return ApiResponse<List<BaoLuuKhoaHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách bảo lưu theo doanh nghiệp.
    /// </summary>
    public async Task<ApiResponse<List<BaoLuuKhoaHocDto>>> TimBaoLuuTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.BaoLuuKhoaHocs
                .Where(b => b.IdDn == idDn && !b.Xoa)
                .Include(b => b.HocSinh)
                .Include(b => b.LopHoc)
                .AsNoTracking()
                .Select(b => new BaoLuuKhoaHocDto
                {
                    IdBaoLuu = b.IdBaoLuu,
                    IdHs = b.IdHs,
                    TenHocSinh = b.HocSinh != null ? b.HocSinh.HoTen : "",
                    IdLop = b.IdLop,
                    TenLop = b.LopHoc != null ? b.LopHoc.TenLop : "",
                    IdDangKy = b.IdDangKy,
                    IdDn = b.IdDn,
                    NgayBatDau = b.NgayBatDau,
                    NgayKetThuc = b.NgayKetThuc,
                    SoBuoiDaHoc = b.SoBuoiDaHoc,
                    TrangThaiBaoLuu = b.TrangThaiBaoLuu,
                    NgayHoanTra = b.NgayHoanTra
                })
                .ToListAsync();

            return ApiResponse<List<BaoLuuKhoaHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm bảo lưu theo doanh nghiệp #{IdDn}", idDn);
            return ApiResponse<List<BaoLuuKhoaHocDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Thanh toán lương cho giáo viên và đồng bộ ghi sổ quỹ chi tiêu.
    /// </summary>
    public async Task<ApiResponse<ThanhToanGiaoVien>> ThanhToanLuongGiaoVienAsync(ThanhToanLuongGvRequest request)
    {
        try
        {
            if (request.IdGv <= 0 || request.SoTien <= 0)
            {
                return ApiResponse<ThanhToanGiaoVien>.Fail("Giáo viên hoặc số tiền lương không hợp lệ", 400);
            }

            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == request.IdGv && !x.Xoa);
            if (gv == null) return ApiResponse<ThanhToanGiaoVien>.Fail("Không tìm thấy giáo viên", 404);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            int targetIdDn = request.IdDn > 0 ? request.IdDn : gv.IdDn;
            int targetIdCn = 1;

            if (request.IdKhoaHoc.HasValue && request.IdKhoaHoc.Value > 0)
            {
                var kh = await _context.KhoaHocs
                    .Include(k => k.LopHoc)
                    .FirstOrDefaultAsync(k => k.IdKhoaHoc == request.IdKhoaHoc.Value);
                if (kh?.LopHoc != null && kh.LopHoc.IdCn > 0)
                {
                    targetIdCn = kh.LopHoc.IdCn;
                }
            }

            if (targetIdCn == 1)
            {
                var gvCn = await _context.GiaoVienChiNhanhs
                    .Where(g => g.IdGv == request.IdGv && !g.Xoa)
                    .Select(g => g.IdCn)
                    .FirstOrDefaultAsync();
                if (gvCn > 0) targetIdCn = gvCn;
            }

            var tt = new ThanhToanGiaoVien
            {
                IdGv = request.IdGv,
                IdDn = targetIdDn,
                IdKhoaHoc = request.IdKhoaHoc,
                IdThangHoc = request.IdThangHoc,
                IdTuanHoc = request.IdTuanHoc,
                SoTien = request.SoTien,
                NgayThanhToan = today,
                Xoa = false
            };

            _context.ThanhToanGiaoViens.Add(tt);

            var soQuy = new SoQuyThuChi
            {
                IdCn = targetIdCn,
                IdDn = targetIdDn,
                LoaiGiaoDich = "CHI",
                SoTien = request.SoTien,
                NgayGiaoDich = today,
                MoTa = $"Chi trả lương giáo viên {gv.HoTen} (#{request.IdGv}) - {request.GhiChu ?? "Lương định kỳ"}",
                Xoa = false
            };
            _context.SoQuyThuChis.Add(soQuy);

            // Đồng bộ tiến độ nhận thù lao khóa học của giáo viên
            if (request.IdKhoaHoc.HasValue && request.IdKhoaHoc.Value > 0)
            {
                var ttGvKh = await _context.ThanhToanGiaoVienKhoaHocs
                    .FirstOrDefaultAsync(t => t.IdGv == request.IdGv && t.IdKhoaHoc == request.IdKhoaHoc.Value && !t.Xoa);

                if (ttGvKh == null)
                {
                    ttGvKh = new ThanhToanGiaoVienKhoaHoc
                    {
                        IdGv = request.IdGv,
                        IdKhoaHoc = request.IdKhoaHoc.Value,
                        IdDn = targetIdDn,
                        TongTienPhaiNap = request.SoTien,
                        SoTienDaNap = 0,
                        Xoa = false
                    };
                    _context.ThanhToanGiaoVienKhoaHocs.Add(ttGvKh);
                }

                ttGvKh.SoTienDaNap += request.SoTien;
                if (ttGvKh.TongTienPhaiNap <= 0) ttGvKh.TongTienPhaiNap = request.SoTien;
                ttGvKh.TrangThai = ttGvKh.SoTienDaNap >= ttGvKh.TongTienPhaiNap;
                ttGvKh.NgayThanhToan = today;
                ttGvKh.GhiChu = request.GhiChu;
                ttGvKh.IdThanhToanGv = tt.IdThanhToan;
            }

            await _context.SaveChangesAsync();

            // Cập nhật Rollup 4 cấp
            await CapNhatRollupThuChiAsync(targetIdDn, targetIdCn, today, 0, request.SoTien, $"Chi lương giáo viên #{request.IdGv}");

            return ApiResponse<ThanhToanGiaoVien>.Created(tt, "Thanh toán lương giáo viên thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi thanh toán lương giáo viên #{IdGv}", request.IdGv);
            return ApiResponse<ThanhToanGiaoVien>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy lịch sử nhận lương của một giáo viên.
    /// </summary>
    public async Task<ApiResponse<List<ThanhToanGiaoVien>>> TimThanhToanLuongTheoGiaoVienAsync(int idGv)
    {
        try
        {
            var list = await _context.ThanhToanGiaoViens
                .Where(t => t.IdGv == idGv && !t.Xoa)
                .OrderByDescending(t => t.NgayThanhToan)
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<ThanhToanGiaoVien>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm lịch sử lương giáo viên #{IdGv}", idGv);
            return ApiResponse<List<ThanhToanGiaoVien>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách phiếu thanh toán lương của toàn doanh nghiệp.
    /// </summary>
    public async Task<ApiResponse<List<ThanhToanGiaoVien>>> TimThanhToanLuongTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.ThanhToanGiaoViens
                .Where(t => t.IdDn == idDn && !t.Xoa)
                .Include(t => t.GiaoVien)
                .OrderByDescending(t => t.NgayThanhToan)
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<ThanhToanGiaoVien>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm lương theo doanh nghiệp #{IdDn}", idDn);
            return ApiResponse<List<ThanhToanGiaoVien>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Hủy bỏ một phiếu thanh toán lương giáo viên và đồng bộ hủy bản ghi sổ quỹ tương ứng.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaThanhToanGiaoVienAsync(int idThanhToan)
    {
        try
        {
            var tt = await _context.ThanhToanGiaoViens.FirstOrDefaultAsync(x => x.IdThanhToan == idThanhToan && !x.Xoa);
            if (tt == null) return ApiResponse<bool>.Fail("Không tìm thấy phiếu thanh toán", 404);

            tt.Xoa = true;

            // Đồng bộ hủy bản ghi sổ quỹ tương ứng để tránh sai lệch dòng tiền (chi phí ảo)
            var soQuy = await _context.SoQuyThuChis
                .FirstOrDefaultAsync(s =>
                    s.IdDn == tt.IdDn &&
                    s.LoaiGiaoDich == "CHI" &&
                    s.SoTien == tt.SoTien &&
                    s.NgayGiaoDich == tt.NgayThanhToan &&
                    !s.Xoa &&
                    s.MoTa != null &&
                    s.MoTa.Contains($"#{tt.IdGv}"));

            if (soQuy != null)
            {
                soQuy.Xoa = true;
            }

            await _context.SaveChangesAsync();

            // Hoàn tác Rollup
            int targetIdCn = soQuy?.IdCn ?? 1;
            var ngayTt = tt.NgayThanhToan ?? DateOnly.FromDateTime(DateTime.Today);
            await CapNhatRollupThuChiAsync(tt.IdDn, targetIdCn, ngayTt, 0, -tt.SoTien, $"Hủy thanh toán lương #{tt.IdThanhToan}");

            return ApiResponse<bool>.Ok(true, "Xóa phiếu thanh toán lương thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa phiếu thanh toán lương #{IdThanhToan}", idThanhToan);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Báo cáo thu chi cấp Năm học.
    /// </summary>
    public async Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiNamAsync(int idDn, int? idCn, int idNamHoc)
    {
        try
        {
            var query = _context.ThuChiNamHocs
                .Where(x => x.IdDn == idDn && !x.Xoa);

            if (idNamHoc > 0)
            {
                query = query.Where(x => x.IdNamHoc == idNamHoc);
            }

            if (idCn.HasValue && idCn.Value > 0)
            {
                query = query.Where(x => x.IdCn == idCn.Value);
            }

            var list = await query
                .Include(x => x.ChiNhanh)
                .Include(x => x.NamHoc)
                .AsNoTracking()
                .Select(x => new ThuChiBaoCaoDto
                {
                    Id = x.IdTcNam,
                    TenKyThoiGian = x.NamHoc != null ? $"{x.NamHoc.NamBatDau} - {x.NamHoc.NamKetThuc}" : $"Năm học #{idNamHoc}",
                    IdCn = x.IdCn,
                    TenChiNhanh = x.ChiNhanh != null ? x.ChiNhanh.TenCn : "",
                    TongTienThu = x.TongTienThu,
                    TongChi = x.TongTienChi,
                    TonQuy = x.TonQuy,
                    GhiChu = x.GhiChu
                })
                .ToListAsync();

            return ApiResponse<List<ThuChiBaoCaoDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy thu chi năm học #{IdNamHoc}", idNamHoc);
            return ApiResponse<List<ThuChiBaoCaoDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Báo cáo thu chi cấp Kỳ học.
    /// </summary>
    public async Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiKyAsync(int idDn, int? idCn, int idKyHoc)
    {
        try
        {
            var query = _context.ThuChiKyHocs
                .Where(x => x.IdDn == idDn && !x.Xoa);

            if (idKyHoc > 0)
            {
                query = query.Where(x => x.IdKh == idKyHoc);
            }

            if (idCn.HasValue && idCn.Value > 0)
            {
                query = query.Where(x => x.IdCn == idCn.Value);
            }

            var list = await query
                .Include(x => x.ChiNhanh)
                .Include(x => x.KyHoc)
                .AsNoTracking()
                .Select(x => new ThuChiBaoCaoDto
                {
                    Id = x.IdTcKy,
                    TenKyThoiGian = x.KyHoc != null ? x.KyHoc.TenKyHoc : $"Kỳ học #{idKyHoc}",
                    IdCn = x.IdCn,
                    TenChiNhanh = x.ChiNhanh != null ? x.ChiNhanh.TenCn : "",
                    TongTienThu = x.TongTienThu,
                    TongChi = x.TongTienChi,
                    TonQuy = x.TonQuy,
                    GhiChu = x.GhiChu
                })
                .ToListAsync();

            return ApiResponse<List<ThuChiBaoCaoDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy thu chi kỳ học #{IdKyHoc}", idKyHoc);
            return ApiResponse<List<ThuChiBaoCaoDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Báo cáo thu chi cấp Tháng học.
    /// </summary>
    public async Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiThangAsync(int idDn, int? idCn, int idThangHoc)
    {
        try
        {
            var query = _context.ThuChiThangHocs
                .Where(x => x.IdDn == idDn && !x.Xoa);

            if (idThangHoc > 0)
            {
                query = query.Where(x => x.IdThangHoc == idThangHoc);
            }

            if (idCn.HasValue && idCn.Value > 0)
            {
                query = query.Where(x => x.IdCn == idCn.Value);
            }

            var list = await query
                .Include(x => x.ChiNhanh)
                .Include(x => x.ThangHoc)
                .AsNoTracking()
                .Select(x => new ThuChiBaoCaoDto
                {
                    Id = x.IdTcThang,
                    TenKyThoiGian = x.ThangHoc != null ? x.ThangHoc.TenThang : $"Tháng học #{idThangHoc}",
                    IdCn = x.IdCn,
                    TenChiNhanh = x.ChiNhanh != null ? x.ChiNhanh.TenCn : "",
                    TongTienThu = x.TongTienThu,
                    TongChi = x.TongTienChi,
                    TonQuy = x.TonQuy,
                    GhiChu = x.GhiChu
                })
                .ToListAsync();

            return ApiResponse<List<ThuChiBaoCaoDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy thu chi tháng học #{IdThangHoc}", idThangHoc);
            return ApiResponse<List<ThuChiBaoCaoDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Báo cáo thu chi cấp Tuần học.
    /// </summary>
    public async Task<ApiResponse<List<ThuChiBaoCaoDto>>> LayThuChiTuanAsync(int idDn, int? idCn, int idTuanHoc)
    {
        try
        {
            var query = _context.ThuChiTuanHocs
                .Where(x => x.IdDn == idDn && !x.Xoa);

            if (idTuanHoc > 0)
            {
                query = query.Where(x => x.IdTuanHoc == idTuanHoc);
            }

            if (idCn.HasValue && idCn.Value > 0)
            {
                query = query.Where(x => x.IdCn == idCn.Value);
            }

            var list = await query
                .Include(x => x.ChiNhanh)
                .Include(x => x.TuanHoc)
                .AsNoTracking()
                .Select(x => new ThuChiBaoCaoDto
                {
                    Id = x.IdTcTuan,
                    TenKyThoiGian = x.TuanHoc != null ? (x.TuanHoc.MoTa ?? $"Tuần {x.TuanHoc.SoTuan}") : $"Tuần học #{idTuanHoc}",
                    IdCn = x.IdCn,
                    TenChiNhanh = x.ChiNhanh != null ? x.ChiNhanh.TenCn : "",
                    TongTienThu = x.TongTienThu,
                    TongChi = x.TongTienChi,
                    TonQuy = x.TonQuy,
                    GhiChu = x.GhiChu
                })
                .ToListAsync();

            return ApiResponse<List<ThuChiBaoCaoDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy thu chi tuần học #{IdTuanHoc}", idTuanHoc);
            return ApiResponse<List<ThuChiBaoCaoDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách giao dịch sổ quỹ theo chi nhánh.
    /// </summary>
    public async Task<ApiResponse<List<SoQuyThuChi>>> TimGiaoDichTheoChiNhanhAsync(int idCn)
    {
        try
        {
            var list = await _context.SoQuyThuChis
                .Where(s => s.IdCn == idCn && !s.Xoa)
                .OrderByDescending(s => s.NgayGiaoDich)
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<SoQuyThuChi>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy giao dịch sổ quỹ chi nhánh #{IdCn}", idCn);
            return ApiResponse<List<SoQuyThuChi>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách giao dịch sổ quỹ theo doanh nghiệp.
    /// </summary>
    public async Task<ApiResponse<List<SoQuyThuChi>>> TimGiaoDichTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.SoQuyThuChis
                .Where(s => s.IdDn == idDn && !s.Xoa)
                .OrderByDescending(s => s.NgayGiaoDich)
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<SoQuyThuChi>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy giao dịch sổ quỹ doanh nghiệp #{IdDn}", idDn);
            return ApiResponse<List<SoQuyThuChi>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật tổng hợp số dư tức thì O(1) lên 4 cấp thời gian: Tuần học, Tháng học, Kỳ học, Năm học
    /// </summary>
    public async Task CapNhatRollupThuChiAsync(
        int idDn, int idCn, DateOnly ngayGiaoDich, decimal tienThu, decimal tienChi, string? ghiChu = null)
    {
        if (idCn <= 0 || (tienThu == 0 && tienChi == 0)) return;

        try
        {
            // 1. Phân giải Kỳ học và Năm học từ Doanh nghiệp / Chi nhánh chứa ngày này
            var kyHoc = await _context.KyHocs
                .Include(k => k.NamHoc)
                .FirstOrDefaultAsync(k => k.IdDn == idDn && !k.Xoa && k.NgayBatDau <= ngayGiaoDich && k.NgayKetThuc >= ngayGiaoDich);

            if (kyHoc == null)
            {
                // Fallback kỳ học mới nhất của DN
                kyHoc = await _context.KyHocs
                    .Include(k => k.NamHoc)
                    .OrderByDescending(k => k.NgayBatDau)
                    .FirstOrDefaultAsync(k => k.IdDn == idDn && !k.Xoa);
            }

            var namHoc = kyHoc?.NamHoc ?? await _context.NamHocs
                .OrderByDescending(n => n.NamBatDau)
                .FirstOrDefaultAsync(n => n.IdDn == idDn && !n.Xoa);

            // 2. Tìm hoặc tạo Tháng học
            ThangHoc? thangHoc = null;
            if (kyHoc != null && namHoc != null)
            {
                int m = ngayGiaoDich.Month;
                int y = ngayGiaoDich.Year;
                thangHoc = await _context.ThangHocs
                    .FirstOrDefaultAsync(t => t.IdDn == idDn && t.Thang == m && t.Nam == y && !t.Xoa);

                if (thangHoc == null)
                {
                    var start = new DateOnly(y, m, 1);
                    var end = start.AddMonths(1).AddDays(-1);
                    thangHoc = new ThangHoc
                    {
                        IdDn = idDn,
                        IdKh = kyHoc.IdKh,
                        IdNh = namHoc.IdNh,
                        Thang = m,
                        Nam = y,
                        TenThang = $"Tháng {m:D2}/{y}",
                        NgayBatDau = start,
                        NgayKetThuc = end,
                        Xoa = false
                    };
                    _context.ThangHocs.Add(thangHoc);
                    await _context.SaveChangesAsync();
                }
            }

            // 3. Tìm Tuần học
            TuanHoc? tuanHoc = null;
            if (kyHoc != null)
            {
                tuanHoc = await _context.TuanHocs
                    .FirstOrDefaultAsync(t => t.IdKh == kyHoc.IdKh && !t.Xoa && t.NgayBatDau <= ngayGiaoDich && t.NgayKetThuc >= ngayGiaoDich);
            }
            if (tuanHoc == null)
            {
                tuanHoc = await _context.TuanHocs
                    .FirstOrDefaultAsync(t => t.IdDn == idDn && !t.Xoa && t.NgayBatDau <= ngayGiaoDich && t.NgayKetThuc >= ngayGiaoDich);
            }

            // A. Rollup Tuần học
            if (tuanHoc != null)
            {
                var tcTuan = await _context.ThuChiTuanHocs
                    .FirstOrDefaultAsync(t => t.IdTuanHoc == tuanHoc.IdTh && t.IdCn == idCn && !t.Xoa);
                if (tcTuan == null)
                {
                    tcTuan = new ThuChiTuanHoc
                    {
                        IdTuanHoc = tuanHoc.IdTh,
                        IdCn = idCn,
                        IdDn = idDn,
                        TongTienThu = 0,
                        TongTienChi = 0,
                        TonQuy = 0,
                        GhiChu = ghiChu,
                        Xoa = false
                    };
                    _context.ThuChiTuanHocs.Add(tcTuan);
                }
                tcTuan.TongTienThu += tienThu;
                tcTuan.TongTienChi += tienChi;
                tcTuan.TonQuy = tcTuan.TongTienThu - tcTuan.TongTienChi;
                if (!string.IsNullOrEmpty(ghiChu)) tcTuan.GhiChu = ghiChu;
            }

            // B. Rollup Tháng học
            if (thangHoc != null)
            {
                var tcThang = await _context.ThuChiThangHocs
                    .FirstOrDefaultAsync(t => t.IdThangHoc == thangHoc.IdThangHoc && t.IdCn == idCn && !t.Xoa);
                if (tcThang == null)
                {
                    tcThang = new ThuChiThangHoc
                    {
                        IdThangHoc = thangHoc.IdThangHoc,
                        IdCn = idCn,
                        IdDn = idDn,
                        TongTienThu = 0,
                        TongTienChi = 0,
                        TonQuy = 0,
                        GhiChu = ghiChu,
                        Xoa = false
                    };
                    _context.ThuChiThangHocs.Add(tcThang);
                }
                tcThang.TongTienThu += tienThu;
                tcThang.TongTienChi += tienChi;
                tcThang.TonQuy = tcThang.TongTienThu - tcThang.TongTienChi;
                if (!string.IsNullOrEmpty(ghiChu)) tcThang.GhiChu = ghiChu;
            }

            // C. Rollup Kỳ học
            if (kyHoc != null)
            {
                var tcKy = await _context.ThuChiKyHocs
                    .FirstOrDefaultAsync(t => t.IdKh == kyHoc.IdKh && t.IdCn == idCn && !t.Xoa);
                if (tcKy == null)
                {
                    tcKy = new ThuChiKyHoc
                    {
                        IdKh = kyHoc.IdKh,
                        IdCn = idCn,
                        IdDn = idDn,
                        TongTienThu = 0,
                        TongTienChi = 0,
                        TonQuy = 0,
                        GhiChu = ghiChu,
                        Xoa = false
                    };
                    _context.ThuChiKyHocs.Add(tcKy);
                }
                tcKy.TongTienThu += tienThu;
                tcKy.TongTienChi += tienChi;
                tcKy.TonQuy = tcKy.TongTienThu - tcKy.TongTienChi;
                if (!string.IsNullOrEmpty(ghiChu)) tcKy.GhiChu = ghiChu;
            }

            // D. Rollup Năm học
            if (namHoc != null)
            {
                var tcNam = await _context.ThuChiNamHocs
                    .FirstOrDefaultAsync(t => t.IdNamHoc == namHoc.IdNh && t.IdCn == idCn && !t.Xoa);
                if (tcNam == null)
                {
                    tcNam = new ThuChiNamHoc
                    {
                        IdNamHoc = namHoc.IdNh,
                        IdCn = idCn,
                        IdDn = idDn,
                        TongTienThu = 0,
                        TongTienChi = 0,
                        TonQuy = 0,
                        GhiChu = ghiChu,
                        Xoa = false
                    };
                    _context.ThuChiNamHocs.Add(tcNam);
                }
                tcNam.TongTienThu += tienThu;
                tcNam.TongTienChi += tienChi;
                tcNam.TonQuy = tcNam.TongTienThu - tcNam.TongTienChi;
                if (!string.IsNullOrEmpty(ghiChu)) tcNam.GhiChu = ghiChu;
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi thực hiện Rollup Thu Chi cho DN #{IdDn}, CN #{IdCn}", idDn, idCn);
        }
    }
}
