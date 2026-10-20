using System.Text.Json.Serialization;

namespace dotnet_backend.DTOs;

public class LoginRequestDto
{
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;

    [JsonIgnore]
    public string? RefreshToken { get; set; }

    public int IdTk { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public int? IdDoiTuong { get; set; }
    public int? IdDoanhNghiep { get; set; }
    public int? IdChiNhanh { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public List<string> QuyenHan { get; set; } = new();
}
