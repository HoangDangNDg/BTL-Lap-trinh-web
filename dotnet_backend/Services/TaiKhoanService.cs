using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Security;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class TaiKhoanService : ITaiKhoanService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly IJwtProvider _jwtProvider;
    private readonly ILogger<TaiKhoanService> _logger;
    private readonly ILocalizationService _localizer;

    public TaiKhoanService(
        QuanLyTrungTamDbContext context,
        IJwtProvider jwtProvider,
        ILogger<TaiKhoanService> logger,
        ILocalizationService? localizer = null)
    {
        _context = context;
        _jwtProvider = jwtProvider;
        _logger = logger;
        _localizer = localizer ?? new LocalizationService();
    }

    public async Task<ApiResponse<LoginResponseDto>> DangNhapAsync(LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.TenDangNhap) || string.IsNullOrWhiteSpace(request.MatKhau))
        {
            return ApiResponse<LoginResponseDto>.Fail(_localizer["Auth_RequiredUsernamePassword"], 400);
        }

        try
        {
            // 1. Tìm tài khoản theo tên đăng nhập
            var tk = await _context.TaiKhoans
                .FirstOrDefaultAsync(t => t.TenDangNhap.ToLower() == request.TenDangNhap.Trim().ToLower() && !t.Xoa);

            if (tk == null)
            {
                return ApiResponse<LoginResponseDto>.Fail(_localizer["Auth_InvalidCredentials"], 401);
            }

            // 2. Kiểm tra mật khẩu (hỗ trợ cả BCrypt và so sánh text thô cho dev)
            bool isPasswordMatch = false;
            try
            {
                isPasswordMatch = BCrypt.Net.BCrypt.Verify(request.MatKhau, tk.MatKhau);
            }
            catch
            {
                // Fallback nếu tài khoản dev chưa được hash BCrypt
                isPasswordMatch = tk.MatKhau == request.MatKhau;
            }

            if (!isPasswordMatch)
            {
                return ApiResponse<LoginResponseDto>.Fail(_localizer["Auth_InvalidCredentials"], 401);
            }

            // 3. Phân giải vai trò (Role Resolution) giống 100% logic Java
            return await ProcessLoginSuccessAsync(tk);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi đăng nhập hệ thống cho user {Username}", request.TenDangNhap);
            return ApiResponse<LoginResponseDto>.Fail("Lỗi hệ thống khi đăng nhập: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<LoginResponseDto>> LamMoiTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return ApiResponse<LoginResponseDto>.Fail("Token làm mới không được để trống", 400);
        }

        try
        {
            var rt = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (rt == null)
            {
                return ApiResponse<LoginResponseDto>.Fail("Token làm mới không tồn tại", 401);
            }

            if (rt.Xoa)
            {
                _logger.LogWarning("Phát hiện Token đã bị thu hồi được tái sử dụng! UserId: {UserId}", rt.UserId);
                // Thu hồi tất cả token của user này để chống tấn công replay
                var userTokens = await _context.RefreshTokens.Where(r => r.UserId == rt.UserId).ToListAsync();
                foreach (var t in userTokens) { t.Xoa = true; }
                await _context.SaveChangesAsync();

                return ApiResponse<LoginResponseDto>.Fail("Phát hiện gian lận, toàn bộ phiên đăng nhập đã bị hủy", 401);
            }

            if (rt.ExpiresAt.HasValue && rt.ExpiresAt.Value < DateTime.UtcNow)
            {
                rt.Xoa = true;
                await _context.SaveChangesAsync();
                return ApiResponse<LoginResponseDto>.Fail("Token làm mới đã hết hạn, vui lòng đăng nhập lại", 401);
            }

            var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.IdTk == rt.UserId && !t.Xoa);
            if (tk == null)
            {
                return ApiResponse<LoginResponseDto>.Fail("Tài khoản không tồn tại trên hệ thống", 404);
            }

            // Hủy token cũ
            rt.Xoa = true;
            await _context.SaveChangesAsync();

            return await ProcessLoginSuccessAsync(tk);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi làm mới token");
            return ApiResponse<LoginResponseDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    public async Task<ApiResponse<TaiKhoan>> DangKyAsync(TaiKhoan taiKhoan)
    {
        if (string.IsNullOrWhiteSpace(taiKhoan.TenDangNhap) || string.IsNullOrWhiteSpace(taiKhoan.MatKhau))
        {
            return ApiResponse<TaiKhoan>.Fail("Thông tin đăng ký không đầy đủ", 400);
        }

        var exists = await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == taiKhoan.TenDangNhap.Trim().ToLower());
        if (exists)
        {
            return ApiResponse<TaiKhoan>.Fail("Tên đăng nhập đã tồn tại trên hệ thống", 409);
        }

        taiKhoan.MatKhau = BCrypt.Net.BCrypt.HashPassword(taiKhoan.MatKhau);
        taiKhoan.Xoa = false;

        _context.TaiKhoans.Add(taiKhoan);
        await _context.SaveChangesAsync();

        return ApiResponse<TaiKhoan>.Created(taiKhoan, "Đăng ký tài khoản thành công");
    }

    public async Task<ApiResponse<string>> DoiMatKhauAsync(int userId, string oldPassword, string newPassword)
    {
        var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.IdTk == userId && !t.Xoa);
        if (tk == null)
        {
            return ApiResponse<string>.Fail("Tài khoản không tồn tại", 404);
        }

        bool match = false;
        try { match = BCrypt.Net.BCrypt.Verify(oldPassword, tk.MatKhau); } catch { match = tk.MatKhau == oldPassword; }

        if (!match)
        {
            return ApiResponse<string>.Fail("Mật khẩu cũ không chính xác", 400);
        }

        tk.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync();

        return ApiResponse<string>.Ok("Đổi mật khẩu thành công");
    }

    private async Task<ApiResponse<LoginResponseDto>> ProcessLoginSuccessAsync(TaiKhoan tk)
    {
        string role = "ADMIN";
        int? roleId = null;
        int? idDoanhNghiep = null;
        int? idChiNhanh = null;
        string hoTen = "Administrator";
        var quyenHan = new List<string> { "ALL_PERMISSIONS" };

        // 1. Kiểm tra Giáo viên
        var gvRel = await _context.TaiKhoanGvs
            .Include(x => x.GiaoVien)
            .FirstOrDefaultAsync(x => x.IdTk == tk.IdTk);

        if (gvRel?.GiaoVien != null)
        {
            role = "GIAO_VIEN";
            roleId = gvRel.GiaoVien.IdGv;
            idDoanhNghiep = gvRel.GiaoVien.IdDn;
            hoTen = gvRel.GiaoVien.HoTen;
            quyenHan = new List<string> { "VIEW_CLASS", "TAKE_ATTENDANCE" };
        }
        else
        {
            // 2. Kiểm tra Quản lý chi nhánh
            var qlRel = await _context.TaiKhoanQls
                .Include(x => x.QuanLy)
                .FirstOrDefaultAsync(x => x.IdTk == tk.IdTk);

            if (qlRel?.QuanLy != null)
            {
                role = "QUAN_LY";
                roleId = qlRel.QuanLy.IdQly;
                idDoanhNghiep = qlRel.QuanLy.IdDn;
                idChiNhanh = qlRel.QuanLy.IdCn;
                hoTen = qlRel.QuanLy.HoTen;
                quyenHan = new List<string> { "MANAGE_USERS", "VIEW_DASHBOARD", "MANAGE_COURSES" };
            }
            else
            {
                // 3. Kiểm tra Chủ doanh nghiệp / Cổ đông
                var ccdRel = await _context.TaiKhoanCcds
                    .Include(x => x.ChuCoDong)
                    .FirstOrDefaultAsync(x => x.IdTk == tk.IdTk);

                if (ccdRel?.ChuCoDong != null)
                {
                    role = "CHU_DOANH_NGHIEP";
                    roleId = ccdRel.ChuCoDong.IdCd;
                    idDoanhNghiep = ccdRel.ChuCoDong.IdDn;
                    hoTen = ccdRel.ChuCoDong.HoTen;
                    quyenHan = new List<string> { "VIEW_REPORTS", "MANAGE_MANAGERS" };
                }
                else
                {
                    // 4. Kiểm tra Admin
                    var adminRel = await _context.TaiKhoanAdmins
                        .Include(x => x.Admin)
                        .FirstOrDefaultAsync(x => x.IdTk == tk.IdTk);

                    if (adminRel?.Admin != null)
                    {
                        role = "ADMIN";
                        roleId = adminRel.Admin.IdAdmin;
                        hoTen = adminRel.Admin.HoTen;
                        quyenHan = new List<string> { "ALL_PERMISSIONS", "ROLE_ADMIN" };
                    }
                }
            }
        }

        // Sinh JWT Payload và Token
        var payload = new JwtPayloadDto
        {
            UserId = tk.IdTk,
            Role = role,
            RoleId = roleId,
            IdDoanhNghiep = idDoanhNghiep,
            IdChiNhanh = idChiNhanh,
            QuyenHan = quyenHan
        };

        var accessToken = _jwtProvider.GenerateToken(payload);
        var refreshToken = _jwtProvider.GenerateRefreshToken(tk.IdTk);

        // Lưu RefreshToken vào CSDL
        var rtEntity = new RefreshToken
        {
            UserId = tk.IdTk,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Xoa = false
        };
        _context.RefreshTokens.Add(rtEntity);
        await _context.SaveChangesAsync();

        var responseDto = new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            IdTk = tk.IdTk,
            TenDangNhap = tk.TenDangNhap,
            VaiTro = role,
            IdDoiTuong = roleId,
            IdDoanhNghiep = idDoanhNghiep,
            IdChiNhanh = idChiNhanh,
            HoTen = hoTen,
            QuyenHan = quyenHan
        };

        return ApiResponse<LoginResponseDto>.Ok(responseDto, _localizer["Auth_LoginSuccess"]);
    }
}
