namespace dotnet_backend.DTOs;

public class LopHocDto
{
    public int IdLop { get; set; }
    public string TenLop { get; set; } = string.Empty;
    public int? SiSoToiDa { get; set; }
    public string? TrangThai { get; set; }
    public int IdChiNhanh { get; set; }
    public int IdCn { get => IdChiNhanh; set => IdChiNhanh = value; }
    public string? TenChiNhanh { get; set; }
    public int? IdGiaoVien { get; set; }
    public int? IdGv { get => IdGiaoVien; set => IdGiaoVien = value; }
    public string? TenGiaoVien { get; set; }
    public int? IdMonHoc { get; set; }
    public int? IdMh { get => IdMonHoc; set => IdMonHoc = value; }
    public string? TenMonHoc { get; set; }
    public int? IdBoMon { get; set; }
    public int? IdBm { get => IdBoMon; set => IdBoMon = value; }
    public string? TenBoMon { get; set; }
    public int IdKyHoc { get; set; }
    public int IdKh { get => IdKyHoc; set => IdKyHoc = value; }
    public string? TenKyHoc { get; set; }
    public int? IdNamHoc { get; set; }
    public int? IdNh { get => IdNamHoc; set => IdNamHoc = value; }
    public string? TenNamHoc { get; set; }
    public int IdDn { get; set; }
}

public class TaoLopHocRequest
{
    public string TenLop { get; set; } = string.Empty;
    public int IdCn { get; set; }
    public int IdKh { get; set; } // IdKyHoc
    public int? IdMh { get; set; }
    public int? IdGv { get; set; }
    public int? SiSoToiDa { get; set; } = 30;
    public string? TrangThai { get; set; } = "DangMo";
    public int? IdDn { get; set; } = 1;
}

public class CapNhatLopHocRequest
{
    public string? TenLop { get; set; }
    public int? IdCn { get; set; }
    public int? IdKh { get; set; }
    public int? IdMh { get; set; }
    public int? IdGv { get; set; }
    public int? SiSoToiDa { get; set; }
    public string? TrangThai { get; set; }
}

public class PhanCongGiaoVienRequest
{
    public int IdGv { get; set; }
    public string? GhiChu { get; set; }
}

public class KhoaHocDto
{
    public int IdKhoaHoc { get; set; }
    public int IdKh { get => IdKhoaHoc; set => IdKhoaHoc = value; }
    public string TenKhoaHoc { get; set; } = string.Empty;
    public int? SoTiet { get; set; }
    public int SoBuoiDaDay { get; set; }
    public bool TrangThaiHoanThanh { get; set; }
    public int? IdBoMon { get; set; }
    public int? IdMh { get; set; }
    public string? TenMonHoc { get; set; }
    public int? IdLop { get; set; }
    public string? TenLop { get; set; }
    public decimal? GiaTien { get; set; }
    public int IdDn { get; set; }
}

public class TaoKhoaHocRequest
{
    public string TenKhoaHoc { get; set; } = string.Empty;
    public int IdBoMon { get; set; } = 1;
    public int? IdMh { get; set; }
    public int? IdLop { get; set; }
    public int? SoTiet { get; set; } = 30;
    public int IdDn { get; set; } = 1;
}

public class DropdownOptionDto
{
    public int Id { get; set; }
    public string Ten { get; set; } = string.Empty;
    public string? Extra { get; set; }
}

public class ThongKeBoMonDto
{
    public int IdBoMon { get; set; }
    public string TenBoMon { get; set; } = string.Empty;
    public int TongSoMonHoc { get; set; }
    public int TongSoGiaoVien { get; set; }
    public int TongSoLopHoc { get; set; }
    public int TongSoKhoaHoc { get; set; }
    public int TongSoHocSinhDangHoc { get; set; }
}
