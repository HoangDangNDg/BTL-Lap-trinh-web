using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Services;

public class NhanSuService : INhanSuService
{
    private readonly QuanLyTrungTamDbContext _context;
    private readonly ILogger<NhanSuService> _logger;

    public NhanSuService(QuanLyTrungTamDbContext context, ILogger<NhanSuService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách giáo viên có phân trang, tìm kiếm và lọc chuyên môn/chi nhánh.
    /// </summary>
    public async Task<ApiResponse<PagedResult<GiaoVienDto>>> LayDanhSachGiaoVienAsync(
        int? idDn, int? idCn, int? idCm, string? keyword, int page, int pageSize)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.GiaoViens
                .Include(g => g.DoanhNghiep)
                .Where(g => !g.Xoa)
                .AsNoTracking();

            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(g => g.IdDn == idDn.Value);
            }

            if (idCn.HasValue && idCn.Value > 0)
            {
                var gvIdsInBranch = _context.GiaoVienChiNhanhs
                    .Where(c => c.IdCn == idCn.Value && !c.Xoa)
                    .Select(c => c.IdGv);
                query = query.Where(g => gvIdsInBranch.Contains(g.IdGv));
            }

            if (idCm.HasValue && idCm.Value > 0)
            {
                var gvIdsInSpecialization = _context.GiaoVienChuyenMons
                    .Where(m => m.IdChuyenMon == idCm.Value && !m.Xoa)
                    .Select(m => m.IdGv);
                query = query.Where(g => gvIdsInSpecialization.Contains(g.IdGv));
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                string kw = keyword.Trim().ToLower();
                query = query.Where(g => g.HoTen.ToLower().Contains(kw) ||
                                         (g.Sdt != null && g.Sdt.Contains(kw)) ||
                                         (g.Email != null && g.Email.ToLower().Contains(kw)));
            }

            int totalCount = await query.CountAsync();
            var gvList = await query
                .OrderByDescending(g => g.IdGv)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var gvIds = gvList.Select(g => g.IdGv).ToList();

            var chuyenMons = await _context.GiaoVienChuyenMons
                .Include(m => m.ChuyenMon)
                .Where(m => gvIds.Contains(m.IdGv) && !m.Xoa && m.ChuyenMon != null)
                .AsNoTracking()
                .ToListAsync();

            var chiNhanhs = await _context.GiaoVienChiNhanhs
                .Include(c => c.ChiNhanh)
                .Where(c => gvIds.Contains(c.IdGv) && !c.Xoa && c.ChiNhanh != null)
                .AsNoTracking()
                .ToListAsync();

            var items = gvList.Select(g => new GiaoVienDto
            {
                IdGv = g.IdGv,
                HoTen = g.HoTen,
                GioiTinh = g.GioiTinh,
                NgaySinh = g.NgaySinh,
                Sdt = g.Sdt,
                Email = g.Email,
                ConHoatDong = g.ConHoatDong,
                IdDn = g.IdDn,
                TenDoanhNghiep = g.DoanhNghiep?.TenDn,
                DanhSachChuyenMon = chuyenMons
                    .Where(m => m.IdGv == g.IdGv)
                    .Select(m => m.ChuyenMon!.TenCm)
                    .ToList(),
                DanhSachChiNhanh = chiNhanhs
                    .Where(c => c.IdGv == g.IdGv)
                    .Select(c => c.ChiNhanh!.TenCn)
                    .ToList()
            }).ToList();

            var paged = new PagedResult<GiaoVienDto>(items, totalCount, page, pageSize);
            return ApiResponse<PagedResult<GiaoVienDto>>.Ok(paged);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy danh sách giáo viên");
            return ApiResponse<PagedResult<GiaoVienDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu thông tin chi tiết một giáo viên theo mã định danh.
    /// </summary>
    public async Task<ApiResponse<GiaoVienDto>> TimGiaoVienTheoIdAsync(int idGv)
    {
        try
        {
            var g = await _context.GiaoViens
                .Include(x => x.DoanhNghiep)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);

            if (g == null)
            {
                return ApiResponse<GiaoVienDto>.Fail("Không tìm thấy giáo viên", 404);
            }

            var cms = await _context.GiaoVienChuyenMons
                .Include(m => m.ChuyenMon)
                .Where(m => m.IdGv == idGv && !m.Xoa && m.ChuyenMon != null)
                .Select(m => m.ChuyenMon!.TenCm)
                .ToListAsync();

            var cns = await _context.GiaoVienChiNhanhs
                .Include(c => c.ChiNhanh)
                .Where(c => c.IdGv == idGv && !c.Xoa && c.ChiNhanh != null)
                .Select(c => c.ChiNhanh!.TenCn)
                .ToListAsync();

            var dto = new GiaoVienDto
            {
                IdGv = g.IdGv,
                HoTen = g.HoTen,
                GioiTinh = g.GioiTinh,
                NgaySinh = g.NgaySinh,
                Sdt = g.Sdt,
                Email = g.Email,
                ConHoatDong = g.ConHoatDong,
                IdDn = g.IdDn,
                TenDoanhNghiep = g.DoanhNghiep?.TenDn,
                DanhSachChuyenMon = cms,
                DanhSachChiNhanh = cns
            };

            return ApiResponse<GiaoVienDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm giáo viên #{IdGv}", idGv);
            return ApiResponse<GiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tạo mới một giáo viên và đồng bộ các chuyên môn / chi nhánh giảng dạy.
    /// </summary>
    public async Task<ApiResponse<GiaoVienDto>> LuuGiaoVienAsync(int idDn, TaoGiaoVienRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.HoTen))
            {
                return ApiResponse<GiaoVienDto>.Fail("Họ tên giáo viên không được để trống", 400);
            }

            int targetDn = idDn > 0 ? idDn : (request.IdDn ?? 1);

            if (!string.IsNullOrWhiteSpace(request.Sdt))
            {
                var sdt = request.Sdt.Trim();
                bool exists = await _context.GiaoViens.AnyAsync(g => g.IdDn == targetDn && g.Sdt == sdt && !g.Xoa);
                if (exists)
                {
                    return ApiResponse<GiaoVienDto>.Fail($"Giáo viên với số điện thoại {sdt} đã tồn tại trong doanh nghiệp rồi", 409);
                }
            }

            var gv = new GiaoVien
            {
                HoTen = request.HoTen.Trim(),
                GioiTinh = request.GioiTinh ?? "Nam",
                NgaySinh = request.NgaySinh,
                Sdt = request.Sdt?.Trim(),
                Email = request.Email?.Trim(),
                ConHoatDong = true,
                IdDn = targetDn,
                Xoa = false
            };

            _context.GiaoViens.Add(gv);
            await _context.SaveChangesAsync();

            if (request.DanhSachIdChuyenMon != null && request.DanhSachIdChuyenMon.Count > 0)
            {
                foreach (var cmId in request.DanhSachIdChuyenMon)
                {
                    _context.GiaoVienChuyenMons.Add(new GiaoVienChuyenMon
                    {
                        IdGv = gv.IdGv,
                        IdChuyenMon = cmId,
                        TrangThai = "HoatDong",
                        Xoa = false
                    });
                }
            }

            if (request.DanhSachIdChiNhanh != null && request.DanhSachIdChiNhanh.Count > 0)
            {
                foreach (var cnId in request.DanhSachIdChiNhanh)
                {
                    _context.GiaoVienChiNhanhs.Add(new GiaoVienChiNhanh
                    {
                        IdGv = gv.IdGv,
                        IdCn = cnId,
                        Xoa = false
                    });
                }
            }

            await _context.SaveChangesAsync();
            return await TimGiaoVienTheoIdAsync(gv.IdGv);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tạo giáo viên");
            return ApiResponse<GiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Nhập danh sách giáo viên hàng loạt (tối đa 50 bản ghi) kèm chi nhánh, chi tiết hồ sơ và tài khoản.
    /// </summary>
    public async Task<ApiResponse<BulkResultDto>> LuuGiaoVienHangLoatAsync(int idDn, List<GiaoVienBulkDto> danhSach)
    {
        try
        {
            if (idDn <= 0)
            {
                return ApiResponse<BulkResultDto>.Fail("ID doanh nghiệp không được để trống", 400);
            }
            if (danhSach == null || danhSach.Count == 0)
            {
                return ApiResponse<BulkResultDto>.Fail("Danh sách giáo viên không được để trống", 400);
            }
            if (danhSach.Count > 50)
            {
                return ApiResponse<BulkResultDto>.Fail($"Mỗi lần cập nhật chỉ được tối đa 50 bản ghi. Số lượng gửi lên: {danhSach.Count}", 400);
            }

            var dn = await _context.DoanhNghieps.FirstOrDefaultAsync(d => d.IdDn == idDn && !d.Xoa);
            if (dn == null)
            {
                return ApiResponse<BulkResultDto>.Fail($"Không tìm thấy doanh nghiệp với ID: {idDn}", 404);
            }

            // Xác thực các chi nhánh gửi lên
            var branchIds = danhSach.Where(x => x.IdCn.HasValue).Select(x => x.IdCn!.Value).Distinct().ToList();
            var branchMap = new Dictionary<int, ChiNhanh>();
            if (branchIds.Count > 0)
            {
                var validBranches = await _context.ChiNhanhs
                    .Where(c => c.IdDn == idDn && branchIds.Contains(c.IdCn))
                    .ToListAsync();
                branchMap = validBranches.ToDictionary(c => c.IdCn, c => c);

                var invalidBranchIds = branchIds.Where(id => !branchMap.ContainsKey(id)).ToList();
                if (invalidBranchIds.Count > 0)
                {
                    return ApiResponse<BulkResultDto>.Fail($"Sai cấu trúc truyền vào: Chi nhánh [{string.Join(", ", invalidBranchIds)}] không thuộc doanh nghiệp ID {idDn}", 400);
                }
            }

            // Lấy danh sách SĐT hợp lệ trong payload
            var incomingSdts = danhSach
                .Where(x => !string.IsNullOrWhiteSpace(x.Sdt))
                .Select(x => x.Sdt!.Trim())
                .Distinct()
                .ToList();

            var existingGvPhoneMap = new Dictionary<string, List<GiaoVien>>();
            var existingUsernamesInDb = new HashSet<string>();

            if (incomingSdts.Count > 0)
            {
                var existingGvs = await _context.GiaoViens
                    .Where(g => g.IdDn == idDn && !g.Xoa && g.Sdt != null && incomingSdts.Contains(g.Sdt))
                    .ToListAsync();

                existingGvPhoneMap = existingGvs
                    .GroupBy(g => g.Sdt!)
                    .ToDictionary(g => g.Key, g => g.ToList());

                var existingAccounts = await _context.TaiKhoans
                    .Where(t => !t.Xoa && incomingSdts.Contains(t.TenDangNhap))
                    .Select(t => t.TenDangNhap)
                    .ToListAsync();

                existingUsernamesInDb = existingAccounts.ToHashSet();
            }

            var result = new BulkResultDto
            {
                TongSo = danhSach.Count
            };

            var validGvs = new List<GiaoVien>();
            var validDtos = new List<GiaoVienBulkDto>();
            var batchProcessedSdts = new HashSet<string>();

            for (int i = 0; i < danhSach.Count; i++)
            {
                var dto = danhSach[i];
                int rowNumber = i + 1;

                string hoTen = dto.HoTen?.Trim() ?? "";
                string sdt = dto.Sdt?.Trim() ?? "";
                string? email = !string.IsNullOrWhiteSpace(dto.Email) ? dto.Email.Trim() : null;
                string gioiTinh = !string.IsNullOrWhiteSpace(dto.GioiTinh) ? dto.GioiTinh.Trim() : "Nam";

                if (string.IsNullOrEmpty(hoTen))
                {
                    result.ThatBai++;
                    result.DanhSachLoi.Add($"Dòng {rowNumber}: Họ tên giáo viên không được để trống");
                    continue;
                }

                if (!string.IsNullOrEmpty(sdt))
                {
                    if (!System.Text.RegularExpressions.Regex.IsMatch(sdt, @"^[0-9]{10,11}$"))
                    {
                        result.ThatBai++;
                        result.DanhSachLoi.Add($"Dòng {rowNumber} ({hoTen}): Số điện thoại '{sdt}' không hợp lệ (yêu cầu 10 - 11 chữ số)");
                        continue;
                    }

                    if (batchProcessedSdts.Contains(sdt))
                    {
                        result.ThatBai++;
                        result.DanhSachLoi.Add($"Dòng {rowNumber} ({hoTen}): Số điện thoại '{sdt}' bị trùng lặp trong danh sách gửi lên");
                        continue;
                    }

                    if (existingGvPhoneMap.ContainsKey(sdt))
                    {
                        result.ThatBai++;
                        result.DanhSachLoi.Add($"Dòng {rowNumber} ({hoTen}): Giáo viên có SĐT '{sdt}' đã có trong doanh nghiệp (Mã GV: #{existingGvPhoneMap[sdt][0].IdGv})");
                        continue;
                    }
                }

                if (dto.Cccd.HasValue)
                {
                    string cccdStr = dto.Cccd.Value.ToString("D12");
                    if (!System.Text.RegularExpressions.Regex.IsMatch(cccdStr, @"^[0-9]{12}$"))
                    {
                        result.ThatBai++;
                        result.DanhSachLoi.Add($"Dòng {rowNumber} ({hoTen}): Số CCCD '{cccdStr}' không hợp lệ (yêu cầu đúng 12 chữ số)");
                        continue;
                    }
                }

                var gv = new GiaoVien
                {
                    HoTen = hoTen,
                    Sdt = !string.IsNullOrEmpty(sdt) ? sdt : null,
                    Email = email,
                    GioiTinh = gioiTinh,
                    NgaySinh = dto.NgaySinh,
                    ConHoatDong = true,
                    IdDn = idDn,
                    Xoa = false
                };

                validGvs.Add(gv);
                validDtos.Add(dto);
                if (!string.IsNullOrEmpty(sdt))
                {
                    batchProcessedSdts.Add(sdt);
                }
            }

            if (validGvs.Count > 0)
            {
                using var tx = await _context.Database.BeginTransactionAsync();

                _context.GiaoViens.AddRange(validGvs);
                await _context.SaveChangesAsync();

                var chiTietsToSave = new List<ChiTietGv>();
                var chiNhanhsToSave = new List<GiaoVienChiNhanh>();
                var taiKhoansToSave = new List<TaiKhoan>();
                var accountToGvMap = new Dictionary<int, GiaoVien>();

                for (int i = 0; i < validGvs.Count; i++)
                {
                    var savedGv = validGvs[i];
                    var dto = validDtos[i];

                    // Chi tiết giáo viên
                    if (!string.IsNullOrWhiteSpace(dto.TrinhDo) || dto.Cccd.HasValue || !string.IsNullOrWhiteSpace(dto.DiaChi))
                    {
                        chiTietsToSave.Add(new ChiTietGv
                        {
                            IdGv = savedGv.IdGv,
                            TrinhDo = !string.IsNullOrWhiteSpace(dto.TrinhDo) ? dto.TrinhDo.Trim() : "Cử nhân Sư phạm",
                            Cccd = dto.Cccd,
                            DiaChi = dto.DiaChi?.Trim(),
                            NgayVaoLam = DateOnly.FromDateTime(DateTime.Today),
                            TrangThaiHoatDong = true,
                            Xoa = false
                        });
                    }

                    // Gán chi nhánh
                    if (dto.IdCn.HasValue && branchMap.ContainsKey(dto.IdCn.Value))
                    {
                        chiNhanhsToSave.Add(new GiaoVienChiNhanh
                        {
                            IdGv = savedGv.IdGv,
                            IdCn = dto.IdCn.Value,
                            NgayBatDau = DateOnly.FromDateTime(DateTime.Today),
                            Xoa = false
                        });
                    }

                    // Cấp tài khoản đăng nhập
                    string? sdt = savedGv.Sdt;
                    bool shouldCreateAccount = dto.TaoTaiKhoan == true || (dto.TaoTaiKhoan == null && !string.IsNullOrWhiteSpace(sdt));
                    if (shouldCreateAccount && !string.IsNullOrWhiteSpace(sdt) && !existingUsernamesInDb.Contains(sdt))
                    {
                        string rawPass = (!string.IsNullOrWhiteSpace(dto.MatKhau) && dto.MatKhau.Trim().Length >= 6)
                            ? dto.MatKhau.Trim() : "123456";

                        var tk = new TaiKhoan
                        {
                            TenDangNhap = sdt,
                            MatKhau = BCrypt.Net.BCrypt.HashPassword(rawPass),
                            TrangThai = "HoatDong",
                            Xoa = false
                        };
                        taiKhoansToSave.Add(tk);
                        accountToGvMap[taiKhoansToSave.Count - 1] = savedGv;
                        existingUsernamesInDb.Add(sdt);
                    }
                }

                if (chiTietsToSave.Count > 0)
                {
                    _context.ChiTietGvs.AddRange(chiTietsToSave);
                }
                if (chiNhanhsToSave.Count > 0)
                {
                    _context.GiaoVienChiNhanhs.AddRange(chiNhanhsToSave);
                }
                if (taiKhoansToSave.Count > 0)
                {
                    _context.TaiKhoans.AddRange(taiKhoansToSave);
                    await _context.SaveChangesAsync();

                    var linksToSave = new List<TaiKhoanGv>();
                    for (int i = 0; i < taiKhoansToSave.Count; i++)
                    {
                        linksToSave.Add(new TaiKhoanGv
                        {
                            IdGv = accountToGvMap[i].IdGv,
                            IdTk = taiKhoansToSave[i].IdTk
                        });
                    }
                    _context.TaiKhoanGvs.AddRange(linksToSave);
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                result.ThanhCong = validGvs.Count;
            }

            return ApiResponse<BulkResultDto>.Ok(result, $"Đã xử lý {result.TongSo} giáo viên: thành công {result.ThanhCong}, thất bại {result.ThatBai}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi nhập giáo viên hàng loạt");
            return ApiResponse<BulkResultDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật thông tin cơ bản của giáo viên.
    /// </summary>
    public async Task<ApiResponse<GiaoVienDto>> CapNhatGiaoVienAsync(int idGv, CapNhatGiaoVienRequest request)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<GiaoVienDto>.Fail("Không tìm thấy giáo viên", 404);

            if (!string.IsNullOrWhiteSpace(request.HoTen)) gv.HoTen = request.HoTen.Trim();
            if (request.GioiTinh != null) gv.GioiTinh = request.GioiTinh;
            if (request.NgaySinh.HasValue) gv.NgaySinh = request.NgaySinh.Value;
            if (request.Sdt != null) gv.Sdt = request.Sdt.Trim();
            if (request.Email != null) gv.Email = request.Email.Trim();
            if (request.ConHoatDong.HasValue) gv.ConHoatDong = request.ConHoatDong.Value;

            await _context.SaveChangesAsync();
            return await TimGiaoVienTheoIdAsync(idGv);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi cập nhật giáo viên #{IdGv}", idGv);
            return ApiResponse<GiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm hồ sơ giáo viên.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaGiaoVienAsync(int idGv)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<bool>.Fail("Không tìm thấy giáo viên", 404);

            gv.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Đã xóa giáo viên thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa giáo viên #{IdGv}", idGv);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu nhanh giáo viên theo số điện thoại.
    /// </summary>
    public async Task<ApiResponse<List<GiaoVienDto>>> TimGiaoVienTheoSdtAsync(string sdt, int? idDn)
    {
        try
        {
            var query = _context.GiaoViens.Where(g => !g.Xoa && g.Sdt != null && g.Sdt.Contains(sdt.Trim()));
            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(g => g.IdDn == idDn.Value);
            }

            var list = await query
                .Include(g => g.DoanhNghiep)
                .AsNoTracking()
                .Select(g => new GiaoVienDto
                {
                    IdGv = g.IdGv,
                    HoTen = g.HoTen,
                    GioiTinh = g.GioiTinh,
                    NgaySinh = g.NgaySinh,
                    Sdt = g.Sdt,
                    Email = g.Email,
                    ConHoatDong = g.ConHoatDong,
                    IdDn = g.IdDn,
                    TenDoanhNghiep = g.DoanhNghiep != null ? g.DoanhNghiep.TenDn : ""
                })
                .ToListAsync();

            return ApiResponse<List<GiaoVienDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm giáo viên theo SĐT {Sdt}", sdt);
            return ApiResponse<List<GiaoVienDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tra cứu giáo viên theo căn cước công dân (CCCD).
    /// </summary>
    public async Task<ApiResponse<List<GiaoVienDto>>> TimGiaoVienTheoCccdAsync(string cccd, int? idDn)
    {
        try
        {
            if (!long.TryParse(cccd.Trim(), out long cccdNum))
            {
                return ApiResponse<List<GiaoVienDto>>.Fail("Số CCCD không hợp lệ", 400);
            }

            var gvIds = await _context.ChiTietGvs
                .Where(c => c.Cccd == cccdNum && !c.Xoa)
                .Select(c => c.IdGv)
                .ToListAsync();

            var query = _context.GiaoViens.Where(g => gvIds.Contains(g.IdGv) && !g.Xoa);
            if (idDn.HasValue && idDn.Value > 0)
            {
                query = query.Where(g => g.IdDn == idDn.Value);
            }

            var list = await query
                .Include(g => g.DoanhNghiep)
                .AsNoTracking()
                .Select(g => new GiaoVienDto
                {
                    IdGv = g.IdGv,
                    HoTen = g.HoTen,
                    GioiTinh = g.GioiTinh,
                    NgaySinh = g.NgaySinh,
                    Sdt = g.Sdt,
                    Email = g.Email,
                    ConHoatDong = g.ConHoatDong,
                    IdDn = g.IdDn,
                    TenDoanhNghiep = g.DoanhNghiep != null ? g.DoanhNghiep.TenDn : ""
                })
                .ToListAsync();

            return ApiResponse<List<GiaoVienDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm giáo viên theo CCCD {Cccd}", cccd);
            return ApiResponse<List<GiaoVienDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Gán chuyên môn cho giáo viên.
    /// </summary>
    public async Task<ApiResponse<bool>> GanChuyenMonAsync(int idGv, int idCm)
    {
        try
        {
            var exist = await _context.GiaoVienChuyenMons
                .FirstOrDefaultAsync(x => x.IdGv == idGv && x.IdChuyenMon == idCm);

            if (exist != null)
            {
                exist.Xoa = false;
                exist.TrangThai = "HoatDong";
            }
            else
            {
                _context.GiaoVienChuyenMons.Add(new GiaoVienChuyenMon
                {
                    IdGv = idGv,
                    IdChuyenMon = idCm,
                    TrangThai = "HoatDong",
                    Xoa = false
                });
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Gán chuyên môn thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Rút chuyên môn khỏi giáo viên.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaChuyenMonAsync(int idGv, int idCm)
    {
        try
        {
            var exist = await _context.GiaoVienChuyenMons
                .FirstOrDefaultAsync(x => x.IdGv == idGv && x.IdChuyenMon == idCm && !x.Xoa);

            if (exist != null)
            {
                exist.Xoa = true;
                await _context.SaveChangesAsync();
            }

            return ApiResponse<bool>.Ok(true, "Rút chuyên môn thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Phân công giáo viên về chi nhánh công tác.
    /// </summary>
    public async Task<ApiResponse<bool>> GanChiNhanhAsync(int idGv, int idCn)
    {
        try
        {
            var exist = await _context.GiaoVienChiNhanhs
                .FirstOrDefaultAsync(x => x.IdGv == idGv && x.IdCn == idCn);

            if (exist != null)
            {
                exist.Xoa = false;
            }
            else
            {
                _context.GiaoVienChiNhanhs.Add(new GiaoVienChiNhanh
                {
                    IdGv = idGv,
                    IdCn = idCn,
                    Xoa = false
                });
            }

            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Phân công chi nhánh thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Rút giáo viên khỏi chi nhánh công tác.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaChiNhanhAsync(int idGv, int idCn)
    {
        try
        {
            var exist = await _context.GiaoVienChiNhanhs
                .FirstOrDefaultAsync(x => x.IdGv == idGv && x.IdCn == idCn && !x.Xoa);

            if (exist != null)
            {
                exist.Xoa = true;
                await _context.SaveChangesAsync();
            }

            return ApiResponse<bool>.Ok(true, "Rút khỏi chi nhánh thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy chi tiết hồ sơ mở rộng của giáo viên (CCCD, trình độ, người thân).
    /// </summary>
    public async Task<ApiResponse<ChiTietGiaoVienDto>> TimChiTietGvAsync(int idGv)
    {
        try
        {
            var ct = await _context.ChiTietGvs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);

            if (ct == null)
            {
                return ApiResponse<ChiTietGiaoVienDto>.Fail("Chưa có thông tin chi tiết giáo viên", 404);
            }

            var dto = new ChiTietGiaoVienDto
            {
                IdChiTietGv = ct.IdChiTietGv,
                IdGv = ct.IdGv,
                Cccd = ct.Cccd,
                UrlAnh = ct.UrlAnh,
                SdtNguoiThan = ct.SdtNguoiThan,
                TenNguoiThan = ct.TenNguoiThan,
                DiaChi = ct.DiaChi,
                TrinhDo = ct.TrinhDo,
                NgayVaoLam = ct.NgayVaoLam,
                TrangThaiHoatDong = ct.TrangThaiHoatDong
            };

            return ApiResponse<ChiTietGiaoVienDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy chi tiết giáo viên #{IdGv}", idGv);
            return ApiResponse<ChiTietGiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật hoặc lưu mới thông tin chi tiết hồ sơ giáo viên.
    /// </summary>
    public async Task<ApiResponse<ChiTietGiaoVienDto>> LuuChiTietGvAsync(int idGv, ChiTietGiaoVienDto request)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<ChiTietGiaoVienDto>.Fail("Không tìm thấy giáo viên", 404);

            var ct = await _context.ChiTietGvs.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (ct == null)
            {
                ct = new ChiTietGv
                {
                    IdGv = idGv,
                    Cccd = request.Cccd,
                    UrlAnh = request.UrlAnh,
                    SdtNguoiThan = request.SdtNguoiThan,
                    TenNguoiThan = request.TenNguoiThan,
                    DiaChi = request.DiaChi,
                    TrinhDo = request.TrinhDo,
                    NgayVaoLam = request.NgayVaoLam ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    TrangThaiHoatDong = request.TrangThaiHoatDong,
                    Xoa = false
                };
                _context.ChiTietGvs.Add(ct);
            }
            else
            {
                if (request.Cccd.HasValue) ct.Cccd = request.Cccd.Value;
                if (request.UrlAnh != null) ct.UrlAnh = request.UrlAnh;
                if (request.SdtNguoiThan != null) ct.SdtNguoiThan = request.SdtNguoiThan;
                if (request.TenNguoiThan != null) ct.TenNguoiThan = request.TenNguoiThan;
                if (request.DiaChi != null) ct.DiaChi = request.DiaChi;
                if (request.TrinhDo != null) ct.TrinhDo = request.TrinhDo;
                if (request.NgayVaoLam.HasValue) ct.NgayVaoLam = request.NgayVaoLam.Value;
                ct.TrangThaiHoatDong = request.TrangThaiHoatDong;
            }

            await _context.SaveChangesAsync();
            return await TimChiTietGvAsync(idGv);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lưu chi tiết giáo viên #{IdGv}", idGv);
            return ApiResponse<ChiTietGiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy toàn bộ hồ sơ cá nhân 360 độ của giáo viên bao gồm thông tin chi tiết và chứng chỉ.
    /// </summary>
    public async Task<ApiResponse<HoSoGiaoVienDto>> LayHoSoCaNhanGiaoVienAsync(int idGv)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<HoSoGiaoVienDto>.Fail("Không tìm thấy giáo viên", 404);

            var ct = await _context.ChiTietGvs.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            var ccs = await _context.ChungChiGiaoViens
                .Where(x => x.IdGv == idGv && !x.Xoa)
                .Select(x => new ChungChiGiaoVienDto
                {
                    IdChungChi = x.IdChungChi,
                    IdGv = x.IdGv,
                    TenChungChi = x.TenChungChi,
                    NgayCap = x.NgayCap,
                    UrlAnh = x.UrlAnh
                })
                .ToListAsync();

            var cms = await _context.GiaoVienChuyenMons
                .Include(x => x.ChuyenMon)
                .Where(x => x.IdGv == idGv && !x.Xoa && x.ChuyenMon != null)
                .Select(x => x.ChuyenMon!.TenCm)
                .ToListAsync();

            var cns = await _context.GiaoVienChiNhanhs
                .Include(x => x.ChiNhanh)
                .Where(x => x.IdGv == idGv && !x.Xoa && x.ChiNhanh != null)
                .Select(x => x.ChiNhanh!.TenCn)
                .ToListAsync();

            var tenDangNhap = await _context.TaiKhoanGvs
                .Where(t => t.IdGv == idGv && t.TaiKhoan != null && !t.TaiKhoan.Xoa)
                .Select(t => t.TaiKhoan!.TenDangNhap)
                .FirstOrDefaultAsync();

            var dto = new HoSoGiaoVienDto
            {
                IdGv = gv.IdGv,
                HoTen = gv.HoTen,
                GioiTinh = gv.GioiTinh,
                NgaySinh = gv.NgaySinh,
                Sdt = gv.Sdt,
                Email = gv.Email,
                Cccd = ct?.Cccd?.ToString(),
                DiaChi = ct?.DiaChi,
                TenDangNhap = tenDangNhap,
                ChiTiet = ct != null ? new ChiTietGiaoVienDto
                {
                    IdChiTietGv = ct.IdChiTietGv,
                    IdGv = ct.IdGv,
                    Cccd = ct.Cccd,
                    UrlAnh = ct.UrlAnh,
                    SdtNguoiThan = ct.SdtNguoiThan,
                    TenNguoiThan = ct.TenNguoiThan,
                    DiaChi = ct.DiaChi,
                    TrinhDo = ct.TrinhDo,
                    NgayVaoLam = ct.NgayVaoLam,
                    TrangThaiHoatDong = ct.TrangThaiHoatDong
                } : null,
                ChungChis = ccs,
                ChuyenMons = cms,
                ChiNhanhs = cns
            };

            return ApiResponse<HoSoGiaoVienDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy hồ sơ giáo viên #{IdGv}", idGv);
            return ApiResponse<HoSoGiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Giáo viên tự cập nhật hồ sơ cá nhân và thông tin chi tiết.
    /// </summary>
    public async Task<ApiResponse<HoSoGiaoVienDto>> CapNhatHoSoCaNhanGiaoVienAsync(int idGv, CapNhatHoSoGiaoVienDto request)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<HoSoGiaoVienDto>.Fail("Không tìm thấy giáo viên", 404);

            if (!string.IsNullOrWhiteSpace(request.HoTen)) gv.HoTen = request.HoTen.Trim();
            if (request.GioiTinh != null) gv.GioiTinh = request.GioiTinh;
            if (request.NgaySinh.HasValue) gv.NgaySinh = request.NgaySinh.Value;
            if (request.Sdt != null) gv.Sdt = request.Sdt.Trim();
            if (request.Email != null) gv.Email = request.Email.Trim();

            var ct = await _context.ChiTietGvs.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (ct == null)
            {
                ct = new ChiTietGv
                {
                    IdGv = idGv,
                    UrlAnh = request.UrlAnh,
                    SdtNguoiThan = request.SdtNguoiThan,
                    TenNguoiThan = request.TenNguoiThan,
                    DiaChi = request.DiaChi,
                    TrinhDo = request.TrinhDo,
                    NgayVaoLam = DateOnly.FromDateTime(DateTime.UtcNow),
                    TrangThaiHoatDong = true,
                    Xoa = false
                };
                if (!string.IsNullOrWhiteSpace(request.Cccd) && long.TryParse(request.Cccd, out long cccdNum))
                {
                    ct.Cccd = cccdNum;
                }
                _context.ChiTietGvs.Add(ct);
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(request.Cccd) && long.TryParse(request.Cccd, out long cccdNum))
                {
                    ct.Cccd = cccdNum;
                }
                if (request.UrlAnh != null) ct.UrlAnh = request.UrlAnh;
                if (request.SdtNguoiThan != null) ct.SdtNguoiThan = request.SdtNguoiThan;
                if (request.TenNguoiThan != null) ct.TenNguoiThan = request.TenNguoiThan;
                if (request.DiaChi != null) ct.DiaChi = request.DiaChi;
                if (request.TrinhDo != null) ct.TrinhDo = request.TrinhDo;
            }

            await _context.SaveChangesAsync();
            return await LayHoSoCaNhanGiaoVienAsync(idGv);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi cập nhật hồ sơ cá nhân GV #{IdGv}", idGv);
            return ApiResponse<HoSoGiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách chứng chỉ nghiệp vụ của giáo viên.
    /// </summary>
    public async Task<ApiResponse<List<ChungChiGiaoVienDto>>> TimChungChiTheoGiaoVienAsync(int idGv)
    {
        try
        {
            var list = await _context.ChungChiGiaoViens
                .Where(c => c.IdGv == idGv && !c.Xoa)
                .AsNoTracking()
                .Select(c => new ChungChiGiaoVienDto
                {
                    IdChungChi = c.IdChungChi,
                    IdGv = c.IdGv,
                    TenChungChi = c.TenChungChi,
                    NgayCap = c.NgayCap,
                    UrlAnh = c.UrlAnh
                })
                .ToListAsync();

            return ApiResponse<List<ChungChiGiaoVienDto>>.Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy chứng chỉ giáo viên #{IdGv}", idGv);
            return ApiResponse<List<ChungChiGiaoVienDto>>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Thêm chứng chỉ nghiệp vụ cho giáo viên.
    /// </summary>
    public async Task<ApiResponse<ChungChiGiaoVienDto>> ThemChungChiGiaoVienAsync(int idGv, ChungChiRequestDto request)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<ChungChiGiaoVienDto>.Fail("Không tìm thấy giáo viên", 404);

            if (string.IsNullOrWhiteSpace(request.TenChungChi))
            {
                return ApiResponse<ChungChiGiaoVienDto>.Fail("Tên chứng chỉ không được để trống", 400);
            }

            var cc = new ChungChiGiaoVien
            {
                IdGv = idGv,
                IdDn = gv.IdDn,
                TenChungChi = request.TenChungChi.Trim(),
                NgayCap = request.NgayCap ?? DateOnly.FromDateTime(DateTime.UtcNow),
                UrlAnh = request.UrlAnh,
                Xoa = false
            };

            _context.ChungChiGiaoViens.Add(cc);
            await _context.SaveChangesAsync();

            var dto = new ChungChiGiaoVienDto
            {
                IdChungChi = cc.IdChungChi,
                IdGv = cc.IdGv,
                TenChungChi = cc.TenChungChi,
                NgayCap = cc.NgayCap,
                UrlAnh = cc.UrlAnh
            };

            return ApiResponse<ChungChiGiaoVienDto>.Created(dto, "Thêm chứng chỉ thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi thêm chứng chỉ cho giáo viên #{IdGv}", idGv);
            return ApiResponse<ChungChiGiaoVienDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa chứng chỉ giáo viên.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaChungChiGiaoVienAsync(int idChungChi)
    {
        try
        {
            var cc = await _context.ChungChiGiaoViens.FirstOrDefaultAsync(x => x.IdChungChi == idChungChi && !x.Xoa);
            if (cc == null) return ApiResponse<bool>.Fail("Không tìm thấy chứng chỉ", 404);

            cc.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa chứng chỉ thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa chứng chỉ #{IdChungChi}", idChungChi);
            return ApiResponse<bool>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cấp tài khoản đăng nhập hệ thống cho giáo viên kèm mã hóa BCrypt.
    /// </summary>
    public async Task<ApiResponse<TaiKhoanGvDto>> TaoTaiKhoanChoGiaoVienAsync(int idGv, TaoTaiKhoanGvRequest request)
    {
        try
        {
            var gv = await _context.GiaoViens.FirstOrDefaultAsync(x => x.IdGv == idGv && !x.Xoa);
            if (gv == null) return ApiResponse<TaiKhoanGvDto>.Fail("Không tìm thấy giáo viên", 404);

            string username = request.TenDangNhap?.Trim() ?? "";
            string password = request.MatKhau?.Trim() ?? "";

            if (username.Length < 3)
            {
                return ApiResponse<TaiKhoanGvDto>.Fail("Tên đăng nhập phải có ít nhất 3 ký tự", 400);
            }

            if (password.Length < 6)
            {
                return ApiResponse<TaiKhoanGvDto>.Fail("Mật khẩu phải có ít nhất 6 ký tự", 400);
            }

            bool exists = await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == username.ToLower() && !t.Xoa);
            if (exists)
            {
                return ApiResponse<TaiKhoanGvDto>.Fail($"Tên đăng nhập '{username}' đã được sử dụng", 409);
            }

            bool hasAccount = await _context.TaiKhoanGvs.AnyAsync(t => t.IdGv == idGv);
            if (hasAccount)
            {
                return ApiResponse<TaiKhoanGvDto>.Fail("Giáo viên này đã được cấp tài khoản", 409);
            }

            using var tx = await _context.Database.BeginTransactionAsync();

            var tk = new TaiKhoan
            {
                TenDangNhap = username,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(password),
                TrangThai = "HoatDong",
                Xoa = false
            };

            _context.TaiKhoans.Add(tk);
            await _context.SaveChangesAsync();

            var tkgv = new TaiKhoanGv
            {
                IdGv = idGv,
                IdTk = tk.IdTk
            };
            _context.TaiKhoanGvs.Add(tkgv);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();

            var dto = new TaiKhoanGvDto
            {
                Id = tkgv.Id,
                IdGv = idGv,
                HoTen = gv.HoTen,
                IdTk = tk.IdTk,
                TenDangNhap = tk.TenDangNhap,
                TrangThai = tk.TrangThai
            };

            return ApiResponse<TaiKhoanGvDto>.Created(dto, "Cấp tài khoản giáo viên thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi cấp tài khoản cho GV #{IdGv}", idGv);
            return ApiResponse<TaiKhoanGvDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Tìm thông tin tài khoản đăng nhập của giáo viên.
    /// </summary>
    public async Task<ApiResponse<TaiKhoanGvDto>> TimTaiKhoanCuaGiaoVienAsync(int idGv)
    {
        try
        {
            var tkgv = await _context.TaiKhoanGvs
                .Include(t => t.GiaoVien)
                .Include(t => t.TaiKhoan)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.IdGv == idGv && t.TaiKhoan != null && !t.TaiKhoan.Xoa);

            if (tkgv == null)
            {
                return ApiResponse<TaiKhoanGvDto>.Fail("Giáo viên chưa có tài khoản", 404);
            }

            var dto = new TaiKhoanGvDto
            {
                Id = tkgv.Id,
                IdGv = idGv,
                HoTen = tkgv.GiaoVien?.HoTen ?? "",
                IdTk = tkgv.IdTk ?? 0,
                TenDangNhap = tkgv.TaiKhoan?.TenDangNhap ?? "",
                TrangThai = tkgv.TaiKhoan?.TrangThai ?? "HoatDong"
            };

            return ApiResponse<TaiKhoanGvDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tìm tài khoản GV #{IdGv}", idGv);
            return ApiResponse<TaiKhoanGvDto>.Fail("Lỗi hệ thống: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách nhân công khác theo chi nhánh.
    /// </summary>
    public async Task<ApiResponse<List<NhanCongKhacDto>>> TimNhanCongTheoChiNhanhAsync(int idCn)
    {
        try
        {
            var items = await _context.NhanCongKhacs
                .Include(n => n.ChiNhanh)
                .Where(n => n.IdCn == idCn && !n.Xoa)
                .AsNoTracking()
                .Select(n => new NhanCongKhacDto
                {
                    IdNhanCongKhac = n.IdNhanCongKhac,
                    HoTen = n.HoTen,
                    Sdt = n.Sdt,
                    ChucVu = n.ViTriCongViec,
                    MucLuong = n.MucLuong,
                    IdCn = n.IdCn,
                    IdDn = n.IdDn,
                    TenChiNhanh = n.ChiNhanh != null ? n.ChiNhanh.TenCn : null
                })
                .ToListAsync();

            return ApiResponse<List<NhanCongKhacDto>>.Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy nhân công theo chi nhánh #{IdCn}", idCn);
            return ApiResponse<List<NhanCongKhacDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lấy danh sách nhân công khác theo doanh nghiệp.
    /// </summary>
    public async Task<ApiResponse<List<NhanCongKhacDto>>> TimNhanCongTheoDoanhNghiepAsync(int idDn)
    {
        try
        {
            var items = await _context.NhanCongKhacs
                .Include(n => n.ChiNhanh)
                .Where(n => n.IdDn == idDn && !n.Xoa)
                .AsNoTracking()
                .Select(n => new NhanCongKhacDto
                {
                    IdNhanCongKhac = n.IdNhanCongKhac,
                    HoTen = n.HoTen,
                    Sdt = n.Sdt,
                    ChucVu = n.ViTriCongViec,
                    MucLuong = n.MucLuong,
                    IdCn = n.IdCn,
                    IdDn = n.IdDn,
                    TenChiNhanh = n.ChiNhanh != null ? n.ChiNhanh.TenCn : null
                })
                .ToListAsync();

            return ApiResponse<List<NhanCongKhacDto>>.Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy nhân công theo doanh nghiệp #{IdDn}", idDn);
            return ApiResponse<List<NhanCongKhacDto>>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Lưu mới thông tin nhân công khác.
    /// </summary>
    public async Task<ApiResponse<NhanCongKhacDto>> LuuNhanCongAsync(TaoNhanCongRequest request)
    {
        try
        {
            int resolvedDnId = request.IdDn ?? 1;
            if (request.IdDn == null || request.IdDn <= 0)
            {
                var cn = await _context.ChiNhanhs.AsNoTracking().FirstOrDefaultAsync(x => x.IdCn == request.IdCn);
                if (cn != null) resolvedDnId = cn.IdDn;
            }

            var nc = new NhanCongKhac
            {
                HoTen = request.HoTen.Trim(),
                Sdt = request.Sdt?.Trim(),
                ViTriCongViec = request.ChucVu?.Trim(),
                MucLuong = request.MucLuong,
                IdCn = request.IdCn,
                IdDn = resolvedDnId,
                Xoa = false
            };

            _context.NhanCongKhacs.Add(nc);
            await _context.SaveChangesAsync();

            var dto = new NhanCongKhacDto
            {
                IdNhanCongKhac = nc.IdNhanCongKhac,
                HoTen = nc.HoTen,
                Sdt = nc.Sdt,
                ChucVu = nc.ViTriCongViec,
                MucLuong = nc.MucLuong,
                IdCn = nc.IdCn,
                IdDn = nc.IdDn
            };

            return ApiResponse<NhanCongKhacDto>.Created(dto, "Thêm nhân công thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi thêm nhân công");
            return ApiResponse<NhanCongKhacDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Cập nhật thông tin nhân công khác.
    /// </summary>
    public async Task<ApiResponse<NhanCongKhacDto>> CapNhatNhanCongAsync(int idNc, TaoNhanCongRequest request)
    {
        try
        {
            var nc = await _context.NhanCongKhacs.FirstOrDefaultAsync(n => n.IdNhanCongKhac == idNc && !n.Xoa);
            if (nc == null) return ApiResponse<NhanCongKhacDto>.Fail("Không tìm thấy nhân công", 404);

            if (!string.IsNullOrWhiteSpace(request.HoTen)) nc.HoTen = request.HoTen.Trim();
            if (request.Sdt != null) nc.Sdt = request.Sdt.Trim();
            if (request.ChucVu != null) nc.ViTriCongViec = request.ChucVu.Trim();
            if (request.MucLuong.HasValue) nc.MucLuong = request.MucLuong.Value;
            if (request.IdCn > 0) nc.IdCn = request.IdCn;
            if (request.IdDn.HasValue && request.IdDn > 0) nc.IdDn = request.IdDn.Value;

            await _context.SaveChangesAsync();

            return ApiResponse<NhanCongKhacDto>.Ok(new NhanCongKhacDto
            {
                IdNhanCongKhac = nc.IdNhanCongKhac,
                HoTen = nc.HoTen,
                Sdt = nc.Sdt,
                ChucVu = nc.ViTriCongViec,
                MucLuong = nc.MucLuong,
                IdCn = nc.IdCn,
                IdDn = nc.IdDn
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi cập nhật nhân công #{IdNc}", idNc);
            return ApiResponse<NhanCongKhacDto>.Fail("Lỗi: " + ex.Message, 500);
        }
    }

    /// <summary>
    /// Xóa mềm thông tin nhân công khác.
    /// </summary>
    public async Task<ApiResponse<bool>> XoaNhanCongAsync(int idNc)
    {
        try
        {
            var nc = await _context.NhanCongKhacs.FirstOrDefaultAsync(n => n.IdNhanCongKhac == idNc && !n.Xoa);
            if (nc == null) return ApiResponse<bool>.Fail("Không tìm thấy nhân công", 404);

            nc.Xoa = true;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xóa nhân sự thành công");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xóa nhân công #{IdNc}", idNc);
            return ApiResponse<bool>.Fail("Lỗi: " + ex.Message, 500);
        }
    }
}
