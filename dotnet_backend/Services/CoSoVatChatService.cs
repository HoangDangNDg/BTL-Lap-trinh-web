using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class CoSoVatChatService : ICoSoVatChatService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<CoSoVatChatService> _logger;

    public CoSoVatChatService(QuanLyTrungTamDbContext context, ILogger<CoSoVatChatService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<List<PhongHocDto>>> TimPhongHocTheoChiNhanhAsync(int idCn)
    {
        try
        {
            var list = await _context.PhongHocs
                .Include(p => p.ChiNhanh)
                .Where(p => p.IdCn == idCn && !p.Xoa)
                .AsNoTracking()
                .Select(p => new PhongHocDto
                {
                    IdPhong = p.IdPhong,
                    TenPhong = p.TenPhong,
                    SucChua = p.SucChua,
                    LoaiPhong = p.LoaiPhong,
                    IdCn = p.IdCn,
                    TenChiNhanh = p.ChiNhanh != null ? p.ChiNhanh.TenCn : null
                })
                .ToListAsync();

            return ApiResponse<List<PhongHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<PhongHocDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<PhongHocDto>> TimPhongHocTheoIdAsync(int idPhong)
    {
        try
        {
            var p = await _context.PhongHocs
                .Include(x => x.ChiNhanh)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdPhong == idPhong && !x.Xoa);

            if (p == null) return ApiResponse<PhongHocDto>.Fail("Không tìm thấy phòng học", 404);

            return ApiResponse<PhongHocDto>.Ok(new PhongHocDto
            {
                IdPhong = p.IdPhong,
                TenPhong = p.TenPhong,
                SucChua = p.SucChua,
                LoaiPhong = p.LoaiPhong,
                IdCn = p.IdCn,
                TenChiNhanh = p.ChiNhanh?.TenCn
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<PhongHocDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<PhongHocDto>> LuuPhongHocAsync(TaoPhongHocRequest request)
    {
        try
        {
            int targetDn = request.IdDn.HasValue && request.IdDn.Value > 0 ? request.IdDn.Value : 1;
            if (request.IdCn > 0)
            {
                var cn = await _context.ChiNhanhs.FirstOrDefaultAsync(c => c.IdCn == request.IdCn);
                if (cn != null && cn.IdDn > 0) targetDn = cn.IdDn;
            }

            var p = new PhongHoc
            {
                TenPhong = request.TenPhong.Trim(),
                SucChua = request.SucChua ?? 30,
                LoaiPhong = request.LoaiPhong ?? "LyThuyet",
                IdCn = request.IdCn > 0 ? request.IdCn : 1,
                IdDn = targetDn,
                Xoa = false
            };

            _context.PhongHocs.Add(p);
            await _context.SaveChangesAsync();

            return await TimPhongHocTheoIdAsync(p.IdPhong);
        }
        catch (Exception ex)
        {
            return ApiResponse<PhongHocDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaPhongHocAsync(int idPhong)
    {
        try
        {
            var p = await _context.PhongHocs.FirstOrDefaultAsync(x => x.IdPhong == idPhong && !x.Xoa);
            if (p == null) return ApiResponse<bool>.Fail("Không tìm thấy phòng học", 404);

            p.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa phòng học thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<NamHocDto>>> TimNamHocTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.NamHocs
                .Where(n => n.IdDn == idDn && !n.Xoa)
                .OrderByDescending(n => n.NgayBatDau)
                .AsNoTracking()
                .Select(n => new NamHocDto
                {
                    IdNh = n.IdNh,
                    TenNamHoc = $"{n.NamBatDau} - {n.NamKetThuc}",
                    NamBatDau = n.NamBatDau,
                    NamKetThuc = n.NamKetThuc,
                    NgayBatDau = n.NgayBatDau ?? DateOnly.MinValue,
                    NgayKetThuc = n.NgayKetThuc ?? DateOnly.MinValue,
                    DaHoanThanh = n.DaHoanThanh,
                    IdDn = n.IdDn
                })
                .ToListAsync();

            return ApiResponse<List<NamHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<NamHocDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<NamHocDto>> LuuNamHocAsync(TaoNamHocRequest request)
    {
        try
        {
            var nh = new NamHoc
            {
                NamBatDau = request.NgayBatDau.Year,
                NamKetThuc = request.NgayKetThuc.Year,
                NgayBatDau = request.NgayBatDau,
                NgayKetThuc = request.NgayKetThuc,
                DaHoanThanh = false,
                IdDn = request.IdDn > 0 ? request.IdDn : 1,
                Xoa = false
            };

            _context.NamHocs.Add(nh);
            await _context.SaveChangesAsync();

            return ApiResponse<NamHocDto>.Ok(new NamHocDto
            {
                IdNh = nh.IdNh,
                TenNamHoc = $"{nh.NamBatDau} - {nh.NamKetThuc}",
                NamBatDau = nh.NamBatDau,
                NamKetThuc = nh.NamKetThuc,
                NgayBatDau = nh.NgayBatDau ?? DateOnly.MinValue,
                NgayKetThuc = nh.NgayKetThuc ?? DateOnly.MinValue,
                DaHoanThanh = nh.DaHoanThanh,
                IdDn = nh.IdDn
            }, "Tạo năm học thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<NamHocDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaNamHocAsync(int idNh)
    {
        try
        {
            var nh = await _context.NamHocs.FirstOrDefaultAsync(n => n.IdNh == idNh && !n.Xoa);
            if (nh == null) return ApiResponse<bool>.Fail("Không tìm thấy năm học", 404);

            nh.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa năm học thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<KyHocDto>>> TimKyHocTheoNamHocAsync(int idNh)
    {
        try
        {
            var list = await _context.KyHocs
                .Include(k => k.NamHoc)
                .Where(k => k.IdNh == idNh && !k.Xoa)
                .OrderBy(k => k.NgayBatDau)
                .AsNoTracking()
                .Select(k => new KyHocDto
                {
                    IdKh = k.IdKh,
                    TenKyHoc = k.TenKyHoc,
                    NgayBatDau = k.NgayBatDau ?? DateOnly.MinValue,
                    NgayKetThuc = k.NgayKetThuc ?? DateOnly.MinValue,
                    IdNh = k.IdNh,
                    TenNamHoc = k.NamHoc != null ? $"{k.NamHoc.NamBatDau} - {k.NamHoc.NamKetThuc}" : null
                })
                .ToListAsync();

            return ApiResponse<List<KyHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<KyHocDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<KyHocDto>> LuuKyHocAsync(int idNh, string tenKyHoc, DateOnly tuNgay, DateOnly denNgay)
    {
        try
        {
            var kh = new KyHoc
            {
                IdNh = idNh,
                TenKyHoc = tenKyHoc.Trim(),
                NgayBatDau = tuNgay,
                NgayKetThuc = denNgay,
                IdDn = 1,
                Xoa = false
            };

            _context.KyHocs.Add(kh);
            await _context.SaveChangesAsync();

            return ApiResponse<KyHocDto>.Ok(new KyHocDto
            {
                IdKh = kh.IdKh,
                TenKyHoc = kh.TenKyHoc,
                NgayBatDau = kh.NgayBatDau ?? DateOnly.MinValue,
                NgayKetThuc = kh.NgayKetThuc ?? DateOnly.MinValue,
                IdNh = kh.IdNh
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<KyHocDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaKyHocAsync(int idKh)
    {
        try
        {
            var kh = await _context.KyHocs.FirstOrDefaultAsync(k => k.IdKh == idKh && !k.Xoa);
            if (kh == null) return ApiResponse<bool>.Fail("Không tìm thấy kỳ học", 404);

            kh.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa kỳ học thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<TuanHocDto>>> TimTuanHocTheoKyHocAsync(int idKh)
    {
        try
        {
            var list = await _context.TuanHocs
                .Where(t => t.IdKh == idKh && !t.Xoa)
                .OrderBy(t => t.SoTuan)
                .AsNoTracking()
                .Select(t => new TuanHocDto
                {
                    IdTh = t.IdTh,
                    TenTuan = t.MoTa ?? $"Tuần {t.SoTuan}",
                    SoThuTuTuan = t.SoTuan,
                    NgayBatDau = t.NgayBatDau ?? DateOnly.MinValue,
                    NgayKetThuc = t.NgayKetThuc ?? DateOnly.MinValue,
                    IdKh = t.IdKh
                })
                .ToListAsync();

            return ApiResponse<List<TuanHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<TuanHocDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<TuanHocDto>>> TaoTuanHocHangLoatAsync(int idNh)
    {
        try
        {
            var nh = await _context.NamHocs.FirstOrDefaultAsync(n => n.IdNh == idNh && !n.Xoa);
            if (nh == null) return ApiResponse<List<TuanHocDto>>.Fail("Không tìm thấy năm học", 404);

            if (!nh.NgayBatDau.HasValue || !nh.NgayKetThuc.HasValue)
            {
                return ApiResponse<List<TuanHocDto>>.Fail($"Năm học #{idNh} chưa có đầy đủ ngày bắt đầu và kết thúc", 400);
            }

            var ngayBatDau = nh.NgayBatDau.Value;
            var ngayKetThuc = nh.NgayKetThuc.Value;

            if (ngayKetThuc < ngayBatDau)
            {
                return ApiResponse<List<TuanHocDto>>.Fail("Ngày kết thúc năm học không được trước ngày bắt đầu", 400);
            }

            // 1. Lấy danh sách kỳ học của năm học này, nếu chưa có thì tự động sinh 2 học kỳ (Kỳ 1 và Kỳ 2)
            var kyList = await _context.KyHocs.Where(k => k.IdNh == idNh && !k.Xoa).OrderBy(k => k.NgayBatDau).ToListAsync();
            if (kyList.Count == 0)
            {
                int tongSoNgay = (ngayKetThuc.ToDateTime(TimeOnly.MinValue) - ngayBatDau.ToDateTime(TimeOnly.MinValue)).Days;
                var mocGiua = ngayBatDau.AddDays(tongSoNgay / 2);

                var ky1 = new KyHoc
                {
                    TenKyHoc = $"Học kỳ 1 ({nh.NamBatDau} - {nh.NamKetThuc})",
                    NgayBatDau = ngayBatDau,
                    NgayKetThuc = mocGiua,
                    IdNh = idNh,
                    IdDn = nh.IdDn,
                    Xoa = false
                };

                var ky2 = new KyHoc
                {
                    TenKyHoc = $"Học kỳ 2 ({nh.NamBatDau} - {nh.NamKetThuc})",
                    NgayBatDau = mocGiua.AddDays(1),
                    NgayKetThuc = ngayKetThuc,
                    IdNh = idNh,
                    IdDn = nh.IdDn,
                    Xoa = false
                };

                _context.KyHocs.Add(ky1);
                _context.KyHocs.Add(ky2);
                await _context.SaveChangesAsync();

                kyList.Add(ky1);
                kyList.Add(ky2);
            }

            // 2. Tra cứu các tuần học hiện có của các kỳ học thuộc năm học này (để tránh tạo trùng lặp số tuần)
            var kyIds = kyList.Select(k => k.IdKh).ToList();
            var dsTuanHienTai = await _context.TuanHocs
                .Where(t => kyIds.Contains(t.IdKh) && !t.Xoa)
                .OrderBy(t => t.SoTuan)
                .ToListAsync();

            var soTuanDaCo = dsTuanHienTai.Select(t => t.SoTuan).ToHashSet();

            // 3. Tính toán danh sách tuần học từ ngayBatDau đến ngayKetThuc (7 ngày / tuần, tăng liên tục)
            var result = new List<TuanHocDto>();
            var currStart = ngayBatDau;
            int soTuan = 1;

            while (currStart <= ngayKetThuc)
            {
                var currEnd = currStart.AddDays(6);
                if (currEnd > ngayKetThuc) currEnd = ngayKetThuc;

                if (!soTuanDaCo.Contains(soTuan))
                {
                    // Xác định kỳ học cho tuần này căn cứ vào ngày bắt đầu của tuần
                    var targetWeekStart = currStart;
                    var kyHocPhuHop = kyList.FirstOrDefault(k =>
                        k.NgayBatDau.HasValue && k.NgayKetThuc.HasValue &&
                        targetWeekStart >= k.NgayBatDau.Value && targetWeekStart <= k.NgayKetThuc.Value)
                        ?? kyList.Last();

                    var th = new TuanHoc
                    {
                        IdKh = kyHocPhuHop.IdKh,
                        IdDn = nh.IdDn,
                        SoTuan = soTuan,
                        MoTa = $"Tuần {soTuan} ({currStart:dd/MM} - {currEnd:dd/MM})",
                        NgayBatDau = currStart,
                        NgayKetThuc = currEnd,
                        Xoa = false
                    };

                    _context.TuanHocs.Add(th);
                    result.Add(new TuanHocDto
                    {
                        TenTuan = th.MoTa,
                        SoThuTuTuan = soTuan,
                        NgayBatDau = currStart,
                        NgayKetThuc = currEnd,
                        IdKh = kyHocPhuHop.IdKh
                    });
                }

                currStart = currStart.AddDays(7);
                soTuan++;
            }

            if (result.Any())
            {
                await _context.SaveChangesAsync();
            }

            // Trả về toàn bộ danh sách tuần học của năm học đã sắp xếp theo thứ tự tuần
            var allWeeks = await _context.TuanHocs
                .Where(t => kyIds.Contains(t.IdKh) && !t.Xoa)
                .OrderBy(t => t.SoTuan)
                .Select(t => new TuanHocDto
                {
                    IdTh = t.IdTh,
                    TenTuan = t.MoTa ?? $"Tuần {t.SoTuan}",
                    SoThuTuTuan = t.SoTuan,
                    NgayBatDau = t.NgayBatDau ?? DateOnly.MinValue,
                    NgayKetThuc = t.NgayKetThuc ?? DateOnly.MinValue,
                    IdKh = t.IdKh
                })
                .ToListAsync();

            return ApiResponse<List<TuanHocDto>>.Ok(allWeeks, "Tạo tuần học hàng loạt thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<TuanHocDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<BoMonDto>>> TimBoMonTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.BoMons
                .Where(b => b.IdDn == idDn && !b.Xoa)
                .AsNoTracking()
                .Select(b => new BoMonDto
                {
                    IdBoMon = b.IdBoMon,
                    TenBoMon = b.TenBoMon,
                    MoTa = null
                })
                .ToListAsync();

            return ApiResponse<List<BoMonDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BoMonDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<BoMonDto>> LuuBoMonAsync(int idDn, string tenBoMon, string? moTa)
    {
        try
        {
            var bm = new BoMon
            {
                TenBoMon = tenBoMon.Trim(),
                IdDn = idDn > 0 ? idDn : 1,
                Xoa = false
            };
            _context.BoMons.Add(bm);
            await _context.SaveChangesAsync();

            return ApiResponse<BoMonDto>.Ok(new BoMonDto
            {
                IdBoMon = bm.IdBoMon,
                TenBoMon = bm.TenBoMon,
                MoTa = null
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<BoMonDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaBoMonAsync(int idBoMon)
    {
        try
        {
            var bm = await _context.BoMons.FirstOrDefaultAsync(b => b.IdBoMon == idBoMon && !b.Xoa);
            if (bm == null) return ApiResponse<bool>.Fail("Không tìm thấy bộ môn", 404);

            bm.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa bộ môn thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<ChuyenMonDto>>> TimChuyenMonTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.ChuyenMons
                .Where(c => c.IdDn == idDn && !c.Xoa)
                .AsNoTracking()
                .Select(c => new ChuyenMonDto
                {
                    IdCm = c.IdCm,
                    TenChuyenMon = c.TenCm,
                    MoTa = c.MoTa
                })
                .ToListAsync();

            return ApiResponse<List<ChuyenMonDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ChuyenMonDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ChuyenMonDto>> LuuChuyenMonAsync(int idDn, string tenChuyenMon, string? moTa)
    {
        try
        {
            var cm = new ChuyenMon
            {
                TenCm = tenChuyenMon.Trim(),
                MoTa = moTa?.Trim(),
                IdDn = idDn > 0 ? idDn : 1,
                Xoa = false
            };
            _context.ChuyenMons.Add(cm);
            await _context.SaveChangesAsync();

            return ApiResponse<ChuyenMonDto>.Ok(new ChuyenMonDto
            {
                IdCm = cm.IdCm,
                TenChuyenMon = cm.TenCm,
                MoTa = cm.MoTa
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<ChuyenMonDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaChuyenMonAsync(int idCm)
    {
        try
        {
            var cm = await _context.ChuyenMons.FirstOrDefaultAsync(c => c.IdCm == idCm && !c.Xoa);
            if (cm == null) return ApiResponse<bool>.Fail("Không tìm thấy chuyên môn", 404);

            cm.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa chuyên môn thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<MonHocDto>>> TimMonHocTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.MonHocs
                .Include(m => m.BoMon)
                .Include(m => m.ChuyenMon)
                .Where(m => m.IdDn == idDn && !m.Xoa)
                .AsNoTracking()
                .Select(m => new MonHocDto
                {
                    IdMh = m.IdMh,
                    TenMon = m.TenMon,
                    MoTa = m.MoTa,
                    IdBoMon = m.IdBoMon,
                    TenBoMon = m.BoMon != null ? m.BoMon.TenBoMon : null,
                    IdChuyenMon = m.IdChuyenMon,
                    TenChuyenMon = m.ChuyenMon != null ? m.ChuyenMon.TenCm : null
                })
                .ToListAsync();

            return ApiResponse<List<MonHocDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<MonHocDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<MonHocDto>> LuuMonHocAsync(int idDn, int idBoMon, int idCm, string tenMon, string? moTa)
    {
        try
        {
            var mh = new MonHoc
            {
                TenMon = tenMon.Trim(),
                MoTa = moTa?.Trim(),
                IdBoMon = idBoMon,
                IdChuyenMon = idCm,
                IdDn = idDn > 0 ? idDn : 1,
                Xoa = false
            };
            _context.MonHocs.Add(mh);
            await _context.SaveChangesAsync();

            return ApiResponse<MonHocDto>.Ok(new MonHocDto
            {
                IdMh = mh.IdMh,
                TenMon = mh.TenMon,
                MoTa = mh.MoTa,
                IdBoMon = mh.IdBoMon,
                IdChuyenMon = mh.IdChuyenMon
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<MonHocDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaMonHocAsync(int idMh)
    {
        try
        {
            var mh = await _context.MonHocs.FirstOrDefaultAsync(m => m.IdMh == idMh && !m.Xoa);
            if (mh == null) return ApiResponse<bool>.Fail("Không tìm thấy môn học", 404);

            mh.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa môn học thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Đổi trạng thái hoàn thành của một năm học
    /// </summary>
    public async Task<ApiResponse<bool>> DoiTrangThaiHoanThanhNamHocAsync(int idNamHoc)
    {
        try
        {
            var nh = await _context.NamHocs.FirstOrDefaultAsync(n => n.IdNh == idNamHoc && !n.Xoa);
            if (nh == null)
            {
                return ApiResponse<bool>.Fail("Không tìm thấy năm học", 404);
            }

            if (nh.NgayKetThuc == null)
            {
                return ApiResponse<bool>.Fail("Năm học chưa có thông tin ngày kết thúc để xác định điều kiện hoàn thành", 400);
            }

            var homNay = DateOnly.FromDateTime(DateTime.Today);
            var ngayKetThuc = nh.NgayKetThuc.Value;
            var mocTruoc = ngayKetThuc.AddMonths(-1);
            var mocSau = ngayKetThuc.AddMonths(1);

            if (homNay < mocTruoc)
            {
                return ApiResponse<bool>.Fail(
                    $"Chưa thể thay đổi trạng thái hoàn thành: Chỉ được phép sửa đổi trong khoảng 1 tháng trước hoặc sau ngày kết thúc năm học (Từ {mocTruoc:dd/MM/yyyy} đến {mocSau:dd/MM/yyyy})", 400);
            }

            if (homNay > mocSau)
            {
                return ApiResponse<bool>.Fail(
                    $"Đã quá thời hạn thay đổi trạng thái hoàn thành: Chỉ được phép sửa đổi trong khoảng 1 tháng trước hoặc sau ngày kết thúc năm học (Từ {mocTruoc:dd/MM/yyyy} đến {mocSau:dd/MM/yyyy})", 400);
            }

            nh.DaHoanThanh = !nh.DaHoanThanh;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, $"Đã cập nhật trạng thái năm học thành: {(nh.DaHoanThanh ? "Hoàn thành" : "Đang diễn ra")}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đổi trạng thái năm học #{IdNamHoc}", idNamHoc);
            return ApiResponse<bool>.Fail("Lỗi cập nhật: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tìm tuần học bao hàm một ngày cụ thể trong doanh nghiệp
    /// </summary>
    public async Task<ApiResponse<TuanHocDto>> TimTuanHocTheoNgayAsync(DateOnly ngay, int idDn)
    {
        try
        {
            var tuan = await _context.TuanHocs
                .Where(t => t.IdDn == idDn && !t.Xoa && t.NgayBatDau <= ngay && t.NgayKetThuc >= ngay)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (tuan == null)
            {
                return ApiResponse<TuanHocDto>.Fail($"Không tìm thấy tuần học nào chứa ngày {ngay:yyyy-MM-dd}", 404);
            }

            var dto = new TuanHocDto
            {
                IdTh = tuan.IdTh,
                TenTuan = tuan.MoTa ?? $"Tuần {tuan.SoTuan}",
                SoThuTuTuan = tuan.SoTuan,
                NgayBatDau = tuan.NgayBatDau ?? DateOnly.MinValue,
                NgayKetThuc = tuan.NgayKetThuc ?? DateOnly.MinValue,
                IdKh = tuan.IdKh
            };

            return ApiResponse<TuanHocDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tìm tuần học theo ngày {Ngay}", ngay);
            return ApiResponse<TuanHocDto>.Fail("Lỗi tra cứu: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tìm kiếm nhanh đa năng người dùng (Giáo viên, Quản lý, Học sinh) theo số điện thoại
    /// </summary>
    public async Task<ApiResponse<List<NguoiDungNganGonDto>>> TimKiemNhanhTheoSoDienThoaiAsync(string sdt, int? idDn)
    {
        try
        {
            var cleanSdt = sdt?.Trim() ?? string.Empty;
            var results = new List<NguoiDungNganGonDto>();

            var gvList = await _context.GiaoViens
                .Include(g => g.DoanhNghiep)
                .Where(g => !g.Xoa && g.Sdt != null && g.Sdt.Contains(cleanSdt) && (!idDn.HasValue || g.IdDn == idDn.Value))
                .AsNoTracking()
                .Select(g => new NguoiDungNganGonDto
                {
                    Id = g.IdGv,
                    HoTen = g.HoTen,
                    Sdt = g.Sdt,
                    Email = g.Email,
                    LoaiNguoiDung = "GIAO_VIEN",
                    IdDoanhNghiep = g.IdDn,
                    TenDoanhNghiep = g.DoanhNghiep != null ? g.DoanhNghiep.TenDn : null
                })
                .ToListAsync();
            results.AddRange(gvList);

            var qlList = await _context.QuanLys
                .Include(q => q.ChiNhanh)
                .Where(q => !q.Xoa && q.Sdt != null && q.Sdt.Contains(cleanSdt) && (!idDn.HasValue || q.IdDn == idDn.Value))
                .AsNoTracking()
                .Select(q => new NguoiDungNganGonDto
                {
                    Id = q.IdQly,
                    HoTen = q.HoTen,
                    Sdt = q.Sdt,
                    Cccd = q.Cccd,
                    Email = q.Email,
                    LoaiNguoiDung = "QUAN_LY",
                    IdChiNhanh = q.IdCn,
                    TenChiNhanh = q.ChiNhanh != null ? q.ChiNhanh.TenCn : null
                })
                .ToListAsync();
            results.AddRange(qlList);

            var hsList = await _context.HocSinhs
                .Where(h => !h.Xoa && h.SoDienThoai != null && h.SoDienThoai.Contains(cleanSdt) && (!idDn.HasValue || h.IdDn == idDn.Value))
                .AsNoTracking()
                .Select(h => new NguoiDungNganGonDto
                {
                    Id = h.IdHs,
                    HoTen = h.HoTen,
                    Sdt = h.SoDienThoai,
                    Cccd = h.Cccd,
                    LoaiNguoiDung = "HOC_SINH",
                    IdDoanhNghiep = h.IdDn
                })
                .ToListAsync();
            results.AddRange(hsList);

            return ApiResponse<List<NguoiDungNganGonDto>>.Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tìm kiếm nhanh theo SĐT: {Sdt}", sdt);
            return ApiResponse<List<NguoiDungNganGonDto>>.Fail("Lỗi tìm kiếm: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tìm kiếm nhanh đa năng người dùng (Giáo viên, Quản lý, Học sinh) theo số CCCD/CMND
    /// </summary>
    public async Task<ApiResponse<List<NguoiDungNganGonDto>>> TimKiemNhanhTheoCccdAsync(string cccd, int? idDn)
    {
        try
        {
            var cleanCccd = cccd?.Trim() ?? string.Empty;
            var results = new List<NguoiDungNganGonDto>();

            var gvIds = await _context.ChiTietGvs
                .Where(c => !c.Xoa && c.Cccd != null && c.Cccd.ToString()!.Contains(cleanCccd))
                .Select(c => c.IdGv)
                .ToListAsync();

            var gvList = await _context.GiaoViens
                .Include(g => g.DoanhNghiep)
                .Where(g => !g.Xoa && gvIds.Contains(g.IdGv) && (!idDn.HasValue || g.IdDn == idDn.Value))
                .AsNoTracking()
                .Select(g => new NguoiDungNganGonDto
                {
                    Id = g.IdGv,
                    HoTen = g.HoTen,
                    Sdt = g.Sdt,
                    Cccd = cleanCccd,
                    Email = g.Email,
                    LoaiNguoiDung = "GIAO_VIEN",
                    IdDoanhNghiep = g.IdDn,
                    TenDoanhNghiep = g.DoanhNghiep != null ? g.DoanhNghiep.TenDn : null
                })
                .ToListAsync();
            results.AddRange(gvList);

            var qlList = await _context.QuanLys
                .Include(q => q.ChiNhanh)
                .Where(q => !q.Xoa && q.Cccd != null && q.Cccd.Contains(cleanCccd) && (!idDn.HasValue || q.IdDn == idDn.Value))
                .AsNoTracking()
                .Select(q => new NguoiDungNganGonDto
                {
                    Id = q.IdQly,
                    HoTen = q.HoTen,
                    Sdt = q.Sdt,
                    Cccd = q.Cccd,
                    Email = q.Email,
                    LoaiNguoiDung = "QUAN_LY",
                    IdChiNhanh = q.IdCn,
                    TenChiNhanh = q.ChiNhanh != null ? q.ChiNhanh.TenCn : null
                })
                .ToListAsync();
            results.AddRange(qlList);

            var hsList = await _context.HocSinhs
                .Where(h => !h.Xoa && h.Cccd != null && h.Cccd.Contains(cleanCccd) && (!idDn.HasValue || h.IdDn == idDn.Value))
                .AsNoTracking()
                .Select(h => new NguoiDungNganGonDto
                {
                    Id = h.IdHs,
                    HoTen = h.HoTen,
                    Sdt = h.SoDienThoai,
                    Cccd = h.Cccd,
                    LoaiNguoiDung = "HOC_SINH",
                    IdDoanhNghiep = h.IdDn
                })
                .ToListAsync();
            results.AddRange(hsList);

            return ApiResponse<List<NguoiDungNganGonDto>>.Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tìm kiếm nhanh theo CCCD: {Cccd}", cccd);
            return ApiResponse<List<NguoiDungNganGonDto>>.Fail("Lỗi tìm kiếm: " + ex.Message, 500);
        }
    }
}

