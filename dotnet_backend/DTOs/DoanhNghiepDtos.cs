namespace dotnet_backend.DTOs;

public class DoanhNghiepDto
{
    public int IdDn { get; set; }
    public string TenDn { get; set; } = string.Empty;
    public string? MaSoThue { get; set; }
    public string? DiaChi { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public int SoLuongChiNhanh { get; set; }
}

public class TaoChiNhanhRequest
{
    public string TenCn { get; set; } = string.Empty;
    public string? DiaChi { get; set; }
    public string? Sdt { get; set; }
    public int IdDn { get; set; } = 1;
}

public class ChiNhanhDto
{
    public int IdCn { get; set; }
    public string TenCn { get; set; } = string.Empty;
    public string? DiaChi { get; set; }
    public string? Sdt { get; set; }
    public int IdDn { get; set; }
    public int SoLuongLopHoc { get; set; }
    public int SoLuongPhongHoc { get; set; }
}

public class ChuCoDongDto
{
    public int IdCd { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public decimal? TyLeSoHuu { get; set; }
    public int IdDn { get; set; }
}

public class GopVonRequest
{
    public int IdCd { get; set; }
    public decimal SoTienGop { get; set; }
    public DateOnly? NgayGop { get; set; }
    public string? GhiChu { get; set; }
}

public class TaoQuanLyRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public int IdCn { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
}
