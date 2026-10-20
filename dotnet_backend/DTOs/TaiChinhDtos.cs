namespace dotnet_backend.DTOs;

public class TaoPhieuThuRequest
{
    public int IdHs { get; set; }
    public int? IdDangKy { get; set; }
    public int? IdKhoaHoc { get; set; }
    public decimal SoTien { get; set; }
    public decimal? PhanTramGiam { get; set; } = 0;
    public string HinhThucThanhToan { get; set; } = "TIEN_MAT";
    public string? GhiChu { get; set; }
    public int IdDn { get; set; }
}

public class BaoCaoThuChiSummaryDto
{
    public decimal TongThu { get; set; }
    public decimal TongChi { get; set; }
    public decimal TonQuy => TongThu - TongChi;
    public int SoPhieuThu { get; set; }
    public int SoPhieuChi { get; set; }
}

public class BaoLuuKhoaHocDto
{
    public int IdBaoLuu { get; set; }
    public int IdHs { get; set; }
    public string? TenHocSinh { get; set; }
    public int IdLop { get; set; }
    public string? TenLop { get; set; }
    public int IdDangKy { get; set; }
    public int IdDn { get; set; }
    public DateOnly? NgayBatDau { get; set; }
    public DateOnly? NgayKetThuc { get; set; }
    public int SoBuoiDaHoc { get; set; }
    public bool TrangThaiBaoLuu { get; set; }
    public DateOnly? NgayHoanTra { get; set; }
}

public class TaoBaoLuuRequest
{
    public int IdHs { get; set; }
    public int IdLop { get; set; }
    public int IdDangKy { get; set; }
    public int IdDn { get; set; }
    public DateOnly? NgayBatDau { get; set; }
    public DateOnly? NgayKetThuc { get; set; }
    public int? SoBuoiDaHoc { get; set; }
}

public class DuyetBaoLuuRequest
{
    public bool TrangThaiBaoLuu { get; set; } = true;
    public DateOnly? NgayKetThuc { get; set; }
}

public class ThanhToanLuongGvRequest
{
    public int IdGv { get; set; }
    public int IdDn { get; set; }
    public int? IdKhoaHoc { get; set; }
    public int? IdThangHoc { get; set; }
    public int? IdTuanHoc { get; set; }
    public decimal SoTien { get; set; }
    public string? GhiChu { get; set; }
}

public class ThuChiBaoCaoDto
{
    public int Id { get; set; }
    public string TenKyThoiGian { get; set; } = "";
    public int IdCn { get; set; }
    public string TenChiNhanh { get; set; } = "";
    public decimal TongTienThu { get; set; }
    public decimal TongChi { get; set; }
    public decimal TonQuy { get; set; }
    public string? GhiChu { get; set; }
}
