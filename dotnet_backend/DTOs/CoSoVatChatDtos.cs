namespace dotnet_backend.DTOs;

public class PhongHocDto
{
    public int IdPhong { get; set; }
    public string TenPhong { get; set; } = string.Empty;
    public int? SucChua { get; set; }
    public string? LoaiPhong { get; set; }
    public int IdCn { get; set; }
    public string? TenChiNhanh { get; set; }
}

public class TaoPhongHocRequest
{
    public string TenPhong { get; set; } = string.Empty;
    public int? SucChua { get; set; } = 30;
    public string? LoaiPhong { get; set; } = "LyThuyet";
    public int IdCn { get; set; }
    public int? IdDn { get; set; } = 1;
}

public class NamHocDto
{
    public int IdNh { get; set; }
    public string TenNamHoc { get; set; } = string.Empty;
    public int? NamBatDau { get; set; }
    public int? NamKetThuc { get; set; }
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
    public bool? DaHoanThanh { get; set; }
    public int IdDn { get; set; }
}

public class TaoNamHocRequest
{
    public string TenNamHoc { get; set; } = string.Empty;
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
    public int IdDn { get; set; } = 1;
}

public class KyHocDto
{
    public int IdKh { get; set; }
    public string TenKyHoc { get; set; } = string.Empty;
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
    public int IdNh { get; set; }
    public string? TenNamHoc { get; set; }
}

public class TuanHocDto
{
    public int IdTh { get; set; }
    public string TenTuan { get; set; } = string.Empty;
    public int SoThuTuTuan { get; set; }
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
    public int IdKh { get; set; }
}

public class BoMonDto
{
    public int IdBoMon { get; set; }
    public string TenBoMon { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public int? IdDn { get; set; }
}

public class ChuyenMonDto
{
    public int IdCm { get; set; }
    public string TenChuyenMon { get; set; } = string.Empty;
    public string? MoTa { get; set; }
}

public class MonHocDto
{
    public int IdMh { get; set; }
    public string TenMon { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public int IdBoMon { get; set; }
    public string? TenBoMon { get; set; }
    public int IdChuyenMon { get; set; }
    public string? TenChuyenMon { get; set; }
    public int? IdDn { get; set; }
}

public class TaoMonHocRequest
{
    public string TenMon { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public int IdBoMon { get; set; }
    public int IdChuyenMon { get; set; }
    public int IdDn { get; set; } = 1;
}
