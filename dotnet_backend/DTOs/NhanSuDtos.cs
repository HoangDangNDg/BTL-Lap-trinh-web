namespace dotnet_backend.DTOs;

public class GiaoVienDto
{
    public int IdGv { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? GioiTinh { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public bool ConHoatDong { get; set; }
    public int IdDn { get; set; }
    public string? TenDoanhNghiep { get; set; }
    public List<string>? DanhSachChuyenMon { get; set; }
    public List<string>? DanhSachChiNhanh { get; set; }
}

public class TaoGiaoVienRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string? GioiTinh { get; set; } = "Nam";
    public DateOnly? NgaySinh { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public int? IdDn { get; set; } = 1;
    public List<int>? DanhSachIdChuyenMon { get; set; }
    public List<int>? DanhSachIdChiNhanh { get; set; }
}

public class CapNhatGiaoVienRequest
{
    public string? HoTen { get; set; }
    public string? GioiTinh { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public bool? ConHoatDong { get; set; }
}

public class GanChuyenMonRequest
{
    public int IdGv { get; set; }
    public int IdCm { get; set; }
}

public class GanChiNhanhRequest
{
    public int IdGv { get; set; }
    public int IdCn { get; set; }
}

public class NhanCongKhacDto
{
    public int IdNhanCongKhac { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? ChucVu { get; set; }
    public decimal? MucLuong { get; set; }
    public int IdCn { get; set; }
    public string? TenChiNhanh { get; set; }
    public int IdDn { get; set; }
}

public class TaoNhanCongRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? ChucVu { get; set; }
    public decimal? MucLuong { get; set; }
    public int IdCn { get; set; }
    public int? IdDn { get; set; }
}

public class ChiTietGiaoVienDto
{
    public int IdChiTietGv { get; set; }
    public int IdGv { get; set; }
    public long? Cccd { get; set; }
    public string? UrlAnh { get; set; }
    public string? SdtNguoiThan { get; set; }
    public string? TenNguoiThan { get; set; }
    public string? DiaChi { get; set; }
    public string? TrinhDo { get; set; }
    public DateOnly? NgayVaoLam { get; set; }
    public bool TrangThaiHoatDong { get; set; } = true;
}

public class HoSoGiaoVienDto
{
    public int IdGv { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? GioiTinh { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? Cccd { get; set; }
    public string? DiaChi { get; set; }
    public string? TenDangNhap { get; set; }
    public ChiTietGiaoVienDto? ChiTiet { get; set; }
    public List<ChungChiGiaoVienDto> ChungChis { get; set; } = new();
    public List<string> ChuyenMons { get; set; } = new();
    public List<string> ChiNhanhs { get; set; } = new();
}

public class CapNhatHoSoGiaoVienDto
{
    public string? HoTen { get; set; }
    public string? GioiTinh { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? Cccd { get; set; }
    public string? DiaChi { get; set; }
    public string? TrinhDo { get; set; }
    public string? SdtNguoiThan { get; set; }
    public string? TenNguoiThan { get; set; }
    public string? UrlAnh { get; set; }
}

public class ChungChiGiaoVienDto
{
    public int IdChungChi { get; set; }
    public int IdGv { get; set; }
    public string TenChungChi { get; set; } = string.Empty;
    public DateOnly? NgayCap { get; set; }
    public string? UrlAnh { get; set; }
}

public class ChungChiRequestDto
{
    public string TenChungChi { get; set; } = string.Empty;
    public DateOnly? NgayCap { get; set; }
    public string? UrlAnh { get; set; }
}

public class TaoTaiKhoanGvRequest
{
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
}

public class TaiKhoanGvDto
{
    public int Id { get; set; }
    public int IdGv { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public int IdTk { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "HoatDong";
}

public class DoiMatKhauDto
{
    public string MatKhauCu { get; set; } = string.Empty;
    public string MatKhauMoi { get; set; } = string.Empty;
}

public class CapNhatTaiKhoanDto
{
    public string? Email { get; set; }
    public string? Sdt { get; set; }
    public string? HoTen { get; set; }
    public string? TenDangNhap { get; set; }
    public string? MatKhauCu { get; set; }
    public string? MatKhauMoi { get; set; }
}

public class GiaoVienBulkDto
{
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? GioiTinh { get; set; } = "Nam";
    public DateOnly? NgaySinh { get; set; }
    public string? TrinhDo { get; set; }
    public long? Cccd { get; set; }
    public string? DiaChi { get; set; }
    public int? IdCn { get; set; }
    public bool? TaoTaiKhoan { get; set; }
    public string? MatKhau { get; set; }
}

public class BulkResultDto
{
    public int TongSo { get; set; }
    public int ThanhCong { get; set; }
    public int ThatBai { get; set; }
    public List<string> DanhSachLoi { get; set; } = new();
}
