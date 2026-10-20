using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class AdminService : IAdminService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<AdminService> _logger;

    public AdminService(QuanLyTrungTamDbContext context, ILogger<AdminService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<List<AdminDto>>> LayDanhSachAdminAsync()
    {
        try
        {
            var list = await _context.Admins
                .Where(a => !a.Xoa)
                .AsNoTracking()
                .Select(a => new AdminDto
                {
                    IdAdmin = a.IdAdmin,
                    HoTen = a.HoTen,
                    Email = a.Email,
                    Sdt = a.Sdt,
                    ChucVu = a.ChucVu,
                    GhiChu = a.GhiChu,
                    NgayTao = a.NgayTao,
                    IdTk = _context.TaiKhoanAdmins
                        .Where(ta => ta.IdAdmin == a.IdAdmin)
                        .Select(ta => (int?)ta.IdTk)
                        .FirstOrDefault(),
                    TenDangNhap = _context.TaiKhoanAdmins
                        .Where(ta => ta.IdAdmin == a.IdAdmin)
                        .Select(ta => ta.TaiKhoan != null ? ta.TaiKhoan.TenDangNhap : "")
                        .FirstOrDefault() ?? ""
                })
                .ToListAsync();

            return ApiResponse<List<AdminDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<AdminDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<AdminDto>> LayAdminTheoIdAsync(int idAdmin)
    {
        try
        {
            var a = await _context.Admins
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdAdmin == idAdmin && !x.Xoa);

            if (a == null) return ApiResponse<AdminDto>.Fail("Không tìm thấy admin", 404);

            var tkAdmin = await _context.TaiKhoanAdmins
                .Include(ta => ta.TaiKhoan)
                .FirstOrDefaultAsync(ta => ta.IdAdmin == a.IdAdmin);

            return ApiResponse<AdminDto>.Ok(new AdminDto
            {
                IdAdmin = a.IdAdmin,
                HoTen = a.HoTen,
                Email = a.Email,
                Sdt = a.Sdt,
                ChucVu = a.ChucVu,
                GhiChu = a.GhiChu,
                NgayTao = a.NgayTao,
                IdTk = tkAdmin?.IdTk,
                TenDangNhap = tkAdmin?.TaiKhoan?.TenDangNhap ?? ""
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<AdminDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<AdminDto>> TaoMoiAdminAsync(AdminDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.HoTen))
        {
            return ApiResponse<AdminDto>.Fail("Họ tên Quản trị viên là bắt buộc", 400);
        }

        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var admin = new Admin
            {
                HoTen = dto.HoTen.Trim(),
                Email = dto.Email?.Trim(),
                Sdt = dto.Sdt?.Trim(),
                ChucVu = !string.IsNullOrWhiteSpace(dto.ChucVu) ? dto.ChucVu.Trim() : "Quản trị viên hệ thống",
                GhiChu = dto.GhiChu?.Trim(),
                NgayTao = DateTime.UtcNow,
                Xoa = false
            };
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.TenDangNhap))
            {
                var username = dto.TenDangNhap.Trim();
                bool exists = await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == username.ToLower() && !t.Xoa);
                if (exists)
                {
                    await tx.RollbackAsync();
                    return ApiResponse<AdminDto>.Fail("Tên đăng nhập đã tồn tại trên hệ thống", 409);
                }

                var tk = new TaiKhoan
                {
                    TenDangNhap = username,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau ?? "123456"),
                    TrangThai = "HoatDong",
                    Xoa = false
                };
                _context.TaiKhoans.Add(tk);
                await _context.SaveChangesAsync();

                var taiKhoanAdmin = new TaiKhoanAdmin
                {
                    IdAdmin = admin.IdAdmin,
                    IdTk = tk.IdTk
                };
                _context.TaiKhoanAdmins.Add(taiKhoanAdmin);
                await _context.SaveChangesAsync();

                dto.IdTk = tk.IdTk;
            }

            await tx.CommitAsync();

            dto.IdAdmin = admin.IdAdmin;
            dto.NgayTao = admin.NgayTao;
            dto.MatKhau = null;
            return ApiResponse<AdminDto>.Ok(dto, "Tạo tài khoản quản trị thành công");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return ApiResponse<AdminDto>.Fail("Lỗi tạo admin: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<AdminDto>> CapNhatAdminAsync(int idAdmin, AdminDto dto)
    {
        try
        {
            var a = await _context.Admins.FirstOrDefaultAsync(x => x.IdAdmin == idAdmin && !x.Xoa);
            if (a == null) return ApiResponse<AdminDto>.Fail("Không tìm thấy admin", 404);

            if (!string.IsNullOrWhiteSpace(dto.HoTen)) a.HoTen = dto.HoTen.Trim();
            if (dto.Email != null) a.Email = dto.Email.Trim();
            if (dto.Sdt != null) a.Sdt = dto.Sdt.Trim();
            if (dto.ChucVu != null) a.ChucVu = dto.ChucVu.Trim();
            if (dto.GhiChu != null) a.GhiChu = dto.GhiChu.Trim();

            await _context.SaveChangesAsync();
            return await LayAdminTheoIdAsync(idAdmin);
        }
        catch (Exception ex)
        {
            return ApiResponse<AdminDto>.Fail("Lỗi cập nhật: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> XoaAdminAsync(int idAdmin)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var a = await _context.Admins.FirstOrDefaultAsync(x => x.IdAdmin == idAdmin && !x.Xoa);
            if (a == null) return ApiResponse<bool>.Fail("Không tìm thấy admin", 404);

            a.Xoa = true;

            // Cascade xóa mềm tài khoản quản trị viên tương ứng (giống Java)
            var tkAdmins = await _context.TaiKhoanAdmins
                .Include(ta => ta.TaiKhoan)
                .Where(ta => ta.IdAdmin == idAdmin)
                .ToListAsync();

            foreach (var ta in tkAdmins)
            {
                if (ta.TaiKhoan != null)
                {
                    ta.TaiKhoan.Xoa = true;
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return ApiResponse<bool>.Ok(true, "Xóa admin thành công");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return ApiResponse<bool>.Fail("Lỗi xóa: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ChuCoDong>> TaoTaiKhoanChuDoanhNghiepAsync(TaoChuDoanhNghiepDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.HoTenChu))
        {
            return ApiResponse<ChuCoDong>.Fail("Họ tên chủ doanh nghiệp không được để trống", 400);
        }
        if (string.IsNullOrWhiteSpace(dto.TenDangNhap))
        {
            return ApiResponse<ChuCoDong>.Fail("Tên đăng nhập không được để trống", 400);
        }

        string username = dto.TenDangNhap.Trim();
        bool usernameExists = await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == username.ToLower() && !t.Xoa);
        if (usernameExists)
        {
            return ApiResponse<ChuCoDong>.Fail("Tên đăng nhập đã tồn tại trên hệ thống", 409);
        }

        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            DoanhNghiep? dn = null;
            if (dto.IdDn.HasValue && dto.IdDn.Value > 0)
            {
                dn = await _context.DoanhNghieps.FirstOrDefaultAsync(d => d.IdDn == dto.IdDn.Value && !d.Xoa);
                if (dn == null)
                {
                    return ApiResponse<ChuCoDong>.Fail($"Không tìm thấy doanh nghiệp với ID: {dto.IdDn.Value}", 404);
                }
            }
            else
            {
                dn = new DoanhNghiep
                {
                    TenDn = !string.IsNullOrWhiteSpace(dto.TenDoanhNghiep) ? dto.TenDoanhNghiep.Trim() : "Doanh nghiệp mới",
                    NgayDangKy = DateOnly.FromDateTime(DateTime.UtcNow),
                    Xoa = false
                };
                _context.DoanhNghieps.Add(dn);
                await _context.SaveChangesAsync();
            }

            var cd = new ChuCoDong
            {
                IdDn = dn.IdDn,
                HoTen = dto.HoTenChu.Trim(),
                Email = dto.Email?.Trim() ?? "",
                Sdt = dto.Sdt?.Trim() ?? "",
                Xoa = false
            };
            _context.ChuCoDongs.Add(cd);
            await _context.SaveChangesAsync();

            if (dto.SoTienGop.HasValue && dto.SoTienGop.Value > 0)
            {
                _context.GopVonSoHuus.Add(new GopVonSoHuu
                {
                    IdDn = dn.IdDn,
                    IdCd = cd.IdCd,
                    NgayGop = DateOnly.FromDateTime(DateTime.UtcNow),
                    SoTienGop = dto.SoTienGop.Value,
                    Xoa = false
                });
            }

            var rawPassword = !string.IsNullOrWhiteSpace(dto.MatKhau) ? dto.MatKhau.Trim() : "123456";
            var tk = new TaiKhoan
            {
                TenDangNhap = username,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(rawPassword),
                TrangThai = "HoatDong",
                Xoa = false
            };
            _context.TaiKhoans.Add(tk);
            await _context.SaveChangesAsync();

            _context.TaiKhoanCcds.Add(new TaiKhoanCcd
            {
                IdTk = tk.IdTk,
                IdCcd = cd.IdCd
            });
            await _context.SaveChangesAsync();

            await tx.CommitAsync();

            return ApiResponse<ChuCoDong>.Ok(cd, "Khởi tạo tổ chức & tài khoản chủ doanh nghiệp thành công");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return ApiResponse<ChuCoDong>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<List<TokenInfoResponseDto>>> LayDanhSachTokensAsync()
    {
        try
        {
            var list = await (from r in _context.RefreshTokens
                              join tk in _context.TaiKhoans on r.UserId equals tk.IdTk into tkJoin
                              from tk in tkJoin.DefaultIfEmpty()
                              orderby r.IdRefresh descending
                              select new TokenInfoResponseDto
                              {
                                  IdRefresh = r.IdRefresh,
                                  IdTk = r.UserId,
                                  TenDangNhap = tk != null ? tk.TenDangNhap : null,
                                  VaiTro = null,
                                  HanSuDung = r.ExpiresAt,
                                  DaThuHoi = r.Xoa
                              })
                              .Take(50)
                              .AsNoTracking()
                              .ToListAsync();

            return ApiResponse<List<TokenInfoResponseDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<TokenInfoResponseDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<bool>> ThuHoiTokenAsync(int idRefresh)
    {
        try
        {
            var r = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.IdRefresh == idRefresh);
            if (r == null) return ApiResponse<bool>.Fail("Không tìm thấy token", 404);

            r.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Thu hồi phiên đăng nhập thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<ThongKeTongQuanDto>> LayThongKeServerAsync()
    {
        try
        {
            var tongHs = await _context.HocSinhs.CountAsync(h => !h.Xoa);
            var tongLop = await _context.LopHocs.CountAsync(l => !l.Xoa);
            var tongGv = await _context.GiaoViens.CountAsync(g => !g.Xoa && g.ConHoatDong);
            var tongCn = await _context.ChiNhanhs.CountAsync();

            var tongThu = await _context.SoQuyThuChis
                .Where(s => s.LoaiGiaoDich == "THU")
                .SumAsync(s => (decimal?)s.SoTien) ?? 0;

            var tongChi = await _context.SoQuyThuChis
                .Where(s => s.LoaiGiaoDich == "CHI")
                .SumAsync(s => (decimal?)s.SoTien) ?? 0;

            return ApiResponse<ThongKeTongQuanDto>.Ok(new ThongKeTongQuanDto
            {
                TongHocSinh = tongHs,
                TongLopHoc = tongLop,
                TongGiaoVien = tongGv,
                TongChiNhanh = tongCn,
                TongDoanhThu = tongThu,
                TongChiPhi = tongChi,
                TonQuy = tongThu - tongChi
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<ThongKeTongQuanDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }
}
