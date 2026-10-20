namespace dotnet_backend.DTOs;

public class AdminDto
{
    public int IdAdmin { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Sdt { get; set; }
    public string? ChucVu { get; set; }
    public string? GhiChu { get; set; }
    public int? IdTk { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string? MatKhau { get; set; }
    public DateTime? NgayTao { get; set; }
}

public class TaoChuDoanhNghiepDto
{
    public int? IdDn { get; set; }
    public string TenDoanhNghiep { get; set; } = string.Empty;
    public string HoTenChu { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public decimal? SoTienGop { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
}

public class TokenInfoResponseDto
{
    public int IdRefresh { get; set; }
    public int IdTk { get; set; }
    public string? TenDangNhap { get; set; }
    public string? VaiTro { get; set; }
    public DateTime? HanSuDung { get; set; }
    public bool DaThuHoi { get; set; }
}

public class ThongKeTongQuanDto
{
    public int TongHocSinh { get; set; }
    public int TongLopHoc { get; set; }
    public int TongGiaoVien { get; set; }
    public int TongChiNhanh { get; set; }
    public decimal TongDoanhThu { get; set; }
    public decimal TongChiPhi { get; set; }
    public decimal TonQuy { get; set; }
}
