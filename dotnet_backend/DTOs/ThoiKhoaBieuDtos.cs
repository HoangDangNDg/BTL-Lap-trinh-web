namespace dotnet_backend.DTOs;

public class BuoiHocDto
{
    public int IdBuoiHoc { get; set; }
    public int IdLop { get; set; }
    public string? TenLop { get; set; }
    public int? IdGv { get; set; }
    public string? TenGiaoVien { get; set; }
    public int? IdPhong { get; set; }
    public string? TenPhong { get; set; }
    public DateOnly NgayHoc { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public string? TrangThai { get; set; }
    public string? NoiDungBaiHoc { get; set; }
    public string? NoiDungBuoiHoc { get => NoiDungBaiHoc; set => NoiDungBaiHoc = value; }
    public string? GhiChu { get; set; }
}

public class TaoBuoiHocRequest
{
    public int IdLop { get; set; }
    public int? IdGv { get; set; }
    public int? IdPhong { get; set; }
    public DateOnly NgayHoc { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public string? NoiDungBaiHoc { get; set; }
}

public class KhungLichHocCoDinhDto
{
    public int IdLich { get; set; }
    public int IdLop { get; set; }
    public string? TenLop { get; set; }
    public int? IdPhong { get; set; }
    public string? TenPhong { get; set; }
    public int ThuTrongTuan { get; set; } // 2 -> 8 (Chủ nhật)
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
}

public class ThoiKhoaBieuTuanDto
{
    public int IdTkb { get; set; }
    public int IdTkbTuan { get => IdTkb; set => IdTkb = value; }
    public int IdTh { get; set; }
    public int? IdBuoiHoc { get; set; }
    public string? TenTuan { get; set; }
    public int ThuTrongTuan { get; set; }
    public int? CaHoc { get; set; }
    public DateOnly? NgayHoc { get; set; }
    public TimeOnly? GioBatDau { get; set; }
    public TimeOnly? GioKetThuc { get; set; }
    public int IdLop { get; set; }
    public string? TenLop { get; set; }
    public int? IdGv { get; set; }
    public string? TenGv { get; set; }
    public int? IdPhong { get; set; }
    public string? TenPhong { get; set; }
    public int? IdChiNhanh { get; set; }
    public List<BuoiHocDto> DanhSachBuoiHoc { get; set; } = new();
}

public class DangKyHocDto
{
    public int IdDangKy { get; set; }
    public int IdHs { get; set; }
    public string? TenHs { get; set; }
    public string? TenHocSinh { get; set; }
    public int IdLop { get; set; }
    public string? TenLop { get; set; }
    public DateOnly? NgayDangKy { get; set; }
    public bool? TrangThaiThanhToan { get; set; }
    public string? TrangThai { get; set; }
}

public class TaoDangKyHocRequest
{
    public int IdHs { get; set; }
    public int IdLop { get; set; }
    public int? IdPh { get; set; }
    public string? TrangThai { get; set; }
    public string? GhiChu { get; set; }
}
