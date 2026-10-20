using dotnet_backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace dotnet_backend.Data;

public class QuanLyTrungTamDbContext : DbContext
{
    public QuanLyTrungTamDbContext(DbContextOptions<QuanLyTrungTamDbContext> options) : base(options) { }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<BaoLuuKhoaHoc> BaoLuuKhoaHocs => Set<BaoLuuKhoaHoc>();
    public DbSet<BoMon> BoMons => Set<BoMon>();
    public DbSet<BuoiHoc> BuoiHocs => Set<BuoiHoc>();
    public DbSet<ChiNhanh> ChiNhanhs => Set<ChiNhanh>();
    public DbSet<ChiTietGv> ChiTietGvs => Set<ChiTietGv>();
    public DbSet<ChuCoDong> ChuCoDongs => Set<ChuCoDong>();
    public DbSet<ChungChiGiaoVien> ChungChiGiaoViens => Set<ChungChiGiaoVien>();
    public DbSet<ChuyenMon> ChuyenMons => Set<ChuyenMon>();
    public DbSet<DangKyHoc> DangKyHocs => Set<DangKyHoc>();
    public DbSet<DiemDanhGiaoVien> DiemDanhGiaoViens => Set<DiemDanhGiaoVien>();
    public DbSet<DiemDanhHocSinh> DiemDanhHocSinhs => Set<DiemDanhHocSinh>();
    public DbSet<DoanhNghiep> DoanhNghieps => Set<DoanhNghiep>();
    public DbSet<GiaoVien> GiaoViens => Set<GiaoVien>();
    public DbSet<GiaoVienChiNhanh> GiaoVienChiNhanhs => Set<GiaoVienChiNhanh>();
    public DbSet<GiaoVienChuyenMon> GiaoVienChuyenMons => Set<GiaoVienChuyenMon>();
    public DbSet<GopVonSoHuu> GopVonSoHuus => Set<GopVonSoHuu>();
    public DbSet<HocSinh> HocSinhs => Set<HocSinh>();
    public DbSet<HocSinhKhoaHoc> HocSinhKhoaHocs => Set<HocSinhKhoaHoc>();
    public DbSet<KhoaHoc> KhoaHocs => Set<KhoaHoc>();
    public DbSet<KhungLichHocCoDinh> KhungLichHocCoDinhs => Set<KhungLichHocCoDinh>();
    public DbSet<KyHoc> KyHocs => Set<KyHoc>();
    public DbSet<LopHoc> LopHocs => Set<LopHoc>();
    public DbSet<MonHoc> MonHocs => Set<MonHoc>();
    public DbSet<NamHoc> NamHocs => Set<NamHoc>();
    public DbSet<NhanCongKhac> NhanCongKhacs => Set<NhanCongKhac>();
    public DbSet<PhieuThuHocPhi> PhieuThuHocPhis => Set<PhieuThuHocPhi>();
    public DbSet<PhongHoc> PhongHocs => Set<PhongHoc>();
    public DbSet<PhuHuynh> PhuHuynhs => Set<PhuHuynh>();
    public DbSet<PhuHuynhHocSinh> PhuHuynhHocSinhs => Set<PhuHuynhHocSinh>();
    public DbSet<QuanLy> QuanLys => Set<QuanLy>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<SoQuyThuChi> SoQuyThuChis => Set<SoQuyThuChi>();
    public DbSet<TaiKhoan> TaiKhoans => Set<TaiKhoan>();
    public DbSet<TaiKhoanAdmin> TaiKhoanAdmins => Set<TaiKhoanAdmin>();
    public DbSet<TaiKhoanCcd> TaiKhoanCcds => Set<TaiKhoanCcd>();
    public DbSet<TaiKhoanGv> TaiKhoanGvs => Set<TaiKhoanGv>();
    public DbSet<TaiKhoanQl> TaiKhoanQls => Set<TaiKhoanQl>();
    public DbSet<ThangHoc> ThangHocs => Set<ThangHoc>();
    public DbSet<ThanhToanGiaoVien> ThanhToanGiaoViens => Set<ThanhToanGiaoVien>();
    public DbSet<ThanhToanGiaoVienKhoaHoc> ThanhToanGiaoVienKhoaHocs => Set<ThanhToanGiaoVienKhoaHoc>();
    public DbSet<ThanhToanHocPhiKhoaHocHocSinh> ThanhToanHocPhiKhoaHocHocSinhs => Set<ThanhToanHocPhiKhoaHocHocSinh>();
    public DbSet<ThoiKhoaBieuTuan> ThoiKhoaBieuTuans => Set<ThoiKhoaBieuTuan>();
    public DbSet<ThuChiKyHoc> ThuChiKyHocs => Set<ThuChiKyHoc>();
    public DbSet<ThuChiNamHoc> ThuChiNamHocs => Set<ThuChiNamHoc>();
    public DbSet<ThuChiThangHoc> ThuChiThangHocs => Set<ThuChiThangHoc>();
    public DbSet<ThuChiTuanHoc> ThuChiTuanHocs => Set<ThuChiTuanHoc>();
    public DbSet<TuanHoc> TuanHocs => Set<TuanHoc>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Properties<DateOnly>()
            .HaveConversion<DateOnlyConverter>();

        configurationBuilder.Properties<DateOnly?>()
            .HaveConversion<NullableDateOnlyConverter>();

        configurationBuilder.Properties<TimeOnly>()
            .HaveConversion<TimeOnlyConverter>();

        configurationBuilder.Properties<TimeOnly?>()
            .HaveConversion<NullableTimeOnlyConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động áp dụng Global Query Filter Xoa = false cho các Entity hỗ trợ Soft Delete (tương đương @SQLRestriction("xoa = false") trong Hibernate)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var xoaProperty = entityType.FindProperty("Xoa");
            if (xoaProperty != null && xoaProperty.ClrType == typeof(bool))
            {
                var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                var body = System.Linq.Expressions.Expression.Equal(
                    System.Linq.Expressions.Expression.Property(parameter, xoaProperty.PropertyInfo!),
                    System.Linq.Expressions.Expression.Constant(false));
                var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }
}

public class DateOnlyConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateOnly, DateTime>
{
    public DateOnlyConverter() : base(
        d => d.ToDateTime(TimeOnly.MinValue),
        dt => DateOnly.FromDateTime(dt))
    { }
}

public class NullableDateOnlyConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateOnly?, DateTime?>
{
    public NullableDateOnlyConverter() : base(
        d => d.HasValue ? d.Value.ToDateTime(TimeOnly.MinValue) : null,
        dt => dt.HasValue ? DateOnly.FromDateTime(dt.Value) : null)
    { }
}

public class TimeOnlyConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<TimeOnly, TimeSpan>
{
    public TimeOnlyConverter() : base(
        t => t.ToTimeSpan(),
        ts => TimeOnly.FromTimeSpan(ts))
    { }
}

public class NullableTimeOnlyConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<TimeOnly?, TimeSpan?>
{
    public NullableTimeOnlyConverter() : base(
        t => t.HasValue ? t.Value.ToTimeSpan() : null,
        ts => ts.HasValue ? TimeOnly.FromTimeSpan(ts.Value) : null)
    { }
}
