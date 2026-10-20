using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class DoanhNghiepService : IDoanhNghiepService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<DoanhNghiepService> _logger;

    public DoanhNghiepService(QuanLyTrungTamDbContext context, ILogger<DoanhNghiepService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách tất cả doanh nghiệp đào tạo trong hệ thống
    /// </summary>
    public async Task<ApiResponse<List<DoanhNghiepDto>>> LayTatCaDoanhNghiepAsync()
    {
        try
        {
            var list = await _context.DoanhNghieps
                .Where(d => !d.Xoa)
                .AsNoTracking()
                .Select(d => new DoanhNghiepDto
                {
                    IdDn = d.IdDn,
                    TenDn = d.TenDn,
                    MaSoThue = d.MaSoThue,
                    DiaChi = null,
                    Sdt = null,
                    Email = null,
                    SoLuongChiNhanh = _context.ChiNhanhs.Count(c => c.IdDn == d.IdDn)
                })
                .ToListAsync();

            return ApiResponse<List<DoanhNghiepDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách doanh nghiệp");
            return ApiResponse<List<DoanhNghiepDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tìm thông tin doanh nghiệp theo ID
    /// </summary>
    public async Task<ApiResponse<DoanhNghiepDto>> TimDoanhNghiepTheoIdAsync(int idDn)
    {
        try
        {
            var d = await _context.DoanhNghieps
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdDn == idDn && !x.Xoa);

            if (d == null) return ApiResponse<DoanhNghiepDto>.Fail("Không tìm thấy doanh nghiệp", 404);

            var countCn = await _context.ChiNhanhs.CountAsync(c => c.IdDn == idDn);

            return ApiResponse<DoanhNghiepDto>.Ok(new DoanhNghiepDto
            {
                IdDn = d.IdDn,
                TenDn = d.TenDn,
                MaSoThue = d.MaSoThue,
                DiaChi = null,
                Sdt = null,
                Email = null,
                SoLuongChiNhanh = countCn
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<DoanhNghiepDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo mới doanh nghiệp
    /// </summary>
    public async Task<ApiResponse<DoanhNghiepDto>> LuuDoanhNghiepAsync(DoanhNghiep dn)
    {
        try
        {
            dn.Xoa = false;
            _context.DoanhNghieps.Add(dn);
            await _context.SaveChangesAsync();
            return await TimDoanhNghiepTheoIdAsync(dn.IdDn);
        }
        catch (Exception ex)
        {
            return ApiResponse<DoanhNghiepDto>.Fail("Lỗi tạo doanh nghiệp: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm doanh nghiệp, cascade khóa tài khoản nhân sự và hủy phiên đăng nhập
    /// </summary>
    public async Task<ApiResponse<bool>> XoaDoanhNghiepAsync(int idDn)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var d = await _context.DoanhNghieps.FirstOrDefaultAsync(x => x.IdDn == idDn && !x.Xoa);
            if (d == null) return ApiResponse<bool>.Fail("Không tìm thấy doanh nghiệp", 404);

            d.Xoa = true;

            // 1. Tìm tất cả tài khoản thuộc doanh nghiệp này (GV, Quản lý, Chủ cổ đông)
            var gvIds = await _context.GiaoViens.Where(g => g.IdDn == idDn).Select(g => g.IdGv).ToListAsync();
            var tkGvIds = await _context.TaiKhoanGvs
                .Where(tg => tg.IdGv.HasValue && gvIds.Contains(tg.IdGv.Value))
                .Select(tg => tg.IdTk)
                .ToListAsync();

            var qlIds = await _context.QuanLys.Where(q => q.IdDn == idDn).Select(q => q.IdQly).ToListAsync();
            var tkQlIds = await _context.TaiKhoanQls
                .Where(tq => tq.IdQly.HasValue && qlIds.Contains(tq.IdQly.Value))
                .Select(tq => tq.IdTk)
                .ToListAsync();

            var cdIds = await _context.ChuCoDongs.Where(c => c.IdDn == idDn).Select(c => c.IdCd).ToListAsync();
            var tkCdIds = await _context.TaiKhoanCcds
                .Where(tc => tc.IdCcd.HasValue && cdIds.Contains(tc.IdCcd.Value))
                .Select(tc => tc.IdTk)
                .ToListAsync();

            var allTkIds = tkGvIds.Concat(tkQlIds).Concat(tkCdIds).Distinct().ToList();

            if (allTkIds.Any())
            {
                var tkList = await _context.TaiKhoans.Where(t => allTkIds.Contains(t.IdTk)).ToListAsync();
                foreach (var tk in tkList)
                {
                    tk.Xoa = true;
                }

                // 2. Thu hồi toàn bộ RefreshToken của các tài khoản này
                var tokens = await _context.RefreshTokens.Where(r => allTkIds.Contains(r.UserId)).ToListAsync();
                foreach (var r in tokens)
                {
                    r.Xoa = true;
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            _logger.LogInformation("Đã xóa mềm doanh nghiệp #{IdDn} và cascade khóa {Count} tài khoản", idDn, allTkIds.Count);
            return ApiResponse<bool>.Ok(true, "Xóa doanh nghiệp thành công");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            _logger.LogError(ex, "Lỗi xóa doanh nghiệp #{IdDn}", idDn);
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách chi nhánh trực thuộc một doanh nghiệp
    /// </summary>
    public async Task<ApiResponse<List<ChiNhanhDto>>> LayChiNhanhTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.ChiNhanhs
                .Where(c => c.IdDn == idDn)
                .AsNoTracking()
                .Select(c => new ChiNhanhDto
                {
                    IdCn = c.IdCn,
                    TenCn = c.TenCn,
                    DiaChi = c.DiaChi,
                    Sdt = c.Sdt,
                    IdDn = c.IdDn,
                    SoLuongLopHoc = _context.LopHocs.Count(l => l.IdCn == c.IdCn && !l.Xoa),
                    SoLuongPhongHoc = _context.PhongHocs.Count(p => p.IdCn == c.IdCn && !p.Xoa)
                })
                .ToListAsync();

            return ApiResponse<List<ChiNhanhDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ChiNhanhDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ChiNhanhDto>> TimChiNhanhTheoIdAsync(int idCn)
    {
        try
        {
            var c = await _context.ChiNhanhs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdCn == idCn);

            if (c == null) return ApiResponse<ChiNhanhDto>.Fail("Không tìm thấy chi nhánh", 404);

            var countLop = await _context.LopHocs.CountAsync(l => l.IdCn == idCn && !l.Xoa);
            var countPhong = await _context.PhongHocs.CountAsync(p => p.IdCn == idCn && !p.Xoa);

            return ApiResponse<ChiNhanhDto>.Ok(new ChiNhanhDto
            {
                IdCn = c.IdCn,
                TenCn = c.TenCn,
                DiaChi = c.DiaChi,
                Sdt = c.Sdt,
                IdDn = c.IdDn,
                SoLuongLopHoc = countLop,
                SoLuongPhongHoc = countPhong
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<ChiNhanhDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ChiNhanhDto>> LuuChiNhanhAsync(TaoChiNhanhRequest request)
    {
        try
        {
            var cn = new ChiNhanh
            {
                TenCn = request.TenCn.Trim(),
                DiaChi = request.DiaChi?.Trim(),
                Sdt = request.Sdt?.Trim(),
                IdDn = request.IdDn > 0 ? request.IdDn : 1
            };

            _context.ChiNhanhs.Add(cn);
            await _context.SaveChangesAsync();

            return await TimChiNhanhTheoIdAsync(cn.IdCn);
        }
        catch (Exception ex)
        {
            return ApiResponse<ChiNhanhDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ChiNhanhDto>> CapNhatChiNhanhAsync(int idCn, TaoChiNhanhRequest request)
    {
        try
        {
            var cn = await _context.ChiNhanhs.FirstOrDefaultAsync(c => c.IdCn == idCn);
            if (cn == null) return ApiResponse<ChiNhanhDto>.Fail("Không tìm thấy chi nhánh", 404);

            if (!string.IsNullOrWhiteSpace(request.TenCn)) cn.TenCn = request.TenCn.Trim();
            if (request.DiaChi != null) cn.DiaChi = request.DiaChi.Trim();
            if (request.Sdt != null) cn.Sdt = request.Sdt.Trim();

            await _context.SaveChangesAsync();
            return await TimChiNhanhTheoIdAsync(idCn);
        }
        catch (Exception ex)
        {
            return ApiResponse<ChiNhanhDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaChiNhanhAsync(int idCn)
    {
        try
        {
            var cn = await _context.ChiNhanhs.FirstOrDefaultAsync(c => c.IdCn == idCn);
            if (cn == null) return ApiResponse<bool>.Fail("Không tìm thấy chi nhánh", 404);

            _context.ChiNhanhs.Remove(cn);
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa chi nhánh thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<ChuCoDongDto>>> LayChuCoDongTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var list = await _context.ChuCoDongs
                .Where(c => c.IdDn == idDn && !c.Xoa)
                .AsNoTracking()
                .Select(c => new ChuCoDongDto
                {
                    IdCd = c.IdCd,
                    HoTen = c.HoTen,
                    Sdt = c.Sdt,
                    Email = c.Email,
                    TyLeSoHuu = 100,
                    IdDn = c.IdDn
                })
                .ToListAsync();

            return ApiResponse<List<ChuCoDongDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ChuCoDongDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ChuCoDongDto>> LuuChuCoDongAsync(int idDn, ChuCoDong cd)
    {
        try
        {
            cd.IdDn = idDn > 0 ? idDn : 1;
            cd.Xoa = false;
            _context.ChuCoDongs.Add(cd);
            await _context.SaveChangesAsync();

            return ApiResponse<ChuCoDongDto>.Ok(new ChuCoDongDto
            {
                IdCd = cd.IdCd,
                HoTen = cd.HoTen,
                Sdt = cd.Sdt,
                Email = cd.Email,
                TyLeSoHuu = 100,
                IdDn = cd.IdDn
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<ChuCoDongDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaChuCoDongAsync(int idCd)
    {
        try
        {
            var cd = await _context.ChuCoDongs.FirstOrDefaultAsync(c => c.IdCd == idCd && !c.Xoa);
            if (cd == null) return ApiResponse<bool>.Fail("Không tìm thấy chủ cổ đông", 404);

            cd.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa cổ đông thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> GhiNhanGopVonAsync(GopVonRequest request)
    {
        try
        {
            var gv = new GopVonSoHuu
            {
                IdCd = request.IdCd,
                IdDn = 1,
                SoTienGop = request.SoTienGop,
                NgayGop = request.NgayGop ?? DateOnly.FromDateTime(DateTime.Now),
                Xoa = false
            };

            var cd = await _context.ChuCoDongs.FindAsync(request.IdCd);
            if (cd != null) gv.IdDn = cd.IdDn;

            _context.GopVonSoHuus.Add(gv);
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Ghi nhận góp vốn thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<QuanLy>>> LayQuanLyTheoChiNhanhAsync(int idCn)
    {
        try
        {
            var list = await _context.QuanLys
                .Where(q => q.IdCn == idCn && !q.Xoa)
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<QuanLy>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<QuanLy>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<QuanLy>> TaoQuanLyChiNhanhAsync(TaoQuanLyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.HoTen))
        {
            return ApiResponse<QuanLy>.Fail("Họ tên quản lý là bắt buộc", 400);
        }

        var cn = await _context.ChiNhanhs.FirstOrDefaultAsync(c => c.IdCn == request.IdCn);
        if (cn == null)
        {
            return ApiResponse<QuanLy>.Fail($"Không tìm thấy chi nhánh với ID {request.IdCn}", 404);
        }

        if (!string.IsNullOrWhiteSpace(request.TenDangNhap))
        {
            var username = request.TenDangNhap.Trim();
            bool exists = await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == username.ToLower() && !t.Xoa);
            if (exists)
            {
                return ApiResponse<QuanLy>.Fail("Tên đăng nhập đã tồn tại trên hệ thống", 409);
            }
        }

        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var ql = new QuanLy
            {
                HoTen = request.HoTen.Trim(),
                Sdt = request.Sdt?.Trim(),
                Email = request.Email?.Trim(),
                IdCn = request.IdCn,
                IdDn = cn.IdDn,
                Xoa = false
            };

            _context.QuanLys.Add(ql);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(request.TenDangNhap) && !string.IsNullOrWhiteSpace(request.MatKhau))
            {
                var tk = new TaiKhoan
                {
                    TenDangNhap = request.TenDangNhap.Trim(),
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau.Trim()),
                    TrangThai = "HoatDong",
                    Xoa = false
                };
                _context.TaiKhoans.Add(tk);
                await _context.SaveChangesAsync();

                _context.TaiKhoanQls.Add(new TaiKhoanQl
                {
                    IdTk = tk.IdTk,
                    IdQly = ql.IdQly
                });
                await _context.SaveChangesAsync();
            }

            await tx.CommitAsync();

            return ApiResponse<QuanLy>.Ok(ql, "Tạo quản lý thành công");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return ApiResponse<QuanLy>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaQuanLyAsync(int idQly)
    {
        try
        {
            var ql = await _context.QuanLys.FirstOrDefaultAsync(q => q.IdQly == idQly && !q.Xoa);
            if (ql == null) return ApiResponse<bool>.Fail("Không tìm thấy quản lý", 404);

            ql.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa quản lý thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }
}
