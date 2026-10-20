namespace dotnet_backend.DTOs;

public class NguoiDungNganGonDto
{
    public int Id { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Cccd { get; set; }
    public string? Email { get; set; }
    public string LoaiNguoiDung { get; set; } = string.Empty; // "GIAO_VIEN", "HOC_SINH", "QUAN_LY"
    public int? IdDoanhNghiep { get; set; }
    public string? TenDoanhNghiep { get; set; }
    public int? IdChiNhanh { get; set; }
    public string? TenChiNhanh { get; set; }
}

public class NodeCayDto
{
    public int Id { get; set; }
    public string Ten { get; set; } = string.Empty;
    public string Loai { get; set; } = string.Empty; // DOANH_NGHIEP, CHI_NHANH, NAM_HOC, KY_HOC, LOP_HOC, KHOA_HOC
    public int? ParentId { get; set; }
    public List<NodeCayDto>? Children { get; set; }
}

public class CayPhanCapDaoTaoDto
{
    public int IdDn { get; set; }
    public string TenDn { get; set; } = string.Empty;
    public List<ChiNhanhNodeDto> ChiNhanhs { get; set; } = new();
    public List<NamHocNodeDto> NamHocs { get; set; } = new();

    public class ChiNhanhNodeDto
    {
        public int IdCn { get; set; }
        public string TenCn { get; set; } = string.Empty;
        public string? DiaChi { get; set; }
        public string? Sdt { get; set; }
    }

    public class NamHocNodeDto
    {
        public int IdNh { get; set; }
        public int? NamBatDau { get; set; }
        public int? NamKetThuc { get; set; }
        public bool DaHoanThanh { get; set; }
        public List<KyHocNodeDto> KyHocs { get; set; } = new();
    }

    public class KyHocNodeDto
    {
        public int IdKh { get; set; }
        public string TenKyHoc { get; set; } = string.Empty;
        public List<LopHocNodeDto> LopHocs { get; set; } = new();
    }

    public class LopHocNodeDto
    {
        public int IdLop { get; set; }
        public string TenLop { get; set; } = string.Empty;
        public int? IdCn { get; set; }
        public string? TenCn { get; set; }
        public int? IdGv { get; set; }
        public string? TenGv { get; set; }
        public int? IdMh { get; set; }
        public string? TenMonHoc { get; set; }
        public List<KhoaHocNodeDto> KhoaHocs { get; set; } = new();
    }

    public class KhoaHocNodeDto
    {
        public int IdKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int? SoTiet { get; set; }
        public int? SoBuoiDaDay { get; set; }
        public bool? TrangThaiHoanThanh { get; set; }
    }
}

public class ThongKeChiNhanhDto
{
    public int IdCn { get; set; }
    public string TenChiNhanh { get; set; } = string.Empty;
    public long LopDangMo { get; set; }
    public long PhongHocHoatDong { get; set; }
    public long HocSinhCoSo { get; set; }
    public long GiaoVienDay { get; set; }
    public long CaHocHomNay { get; set; }
}

public class DuyetBaoLuuDto
{
    public string TrangThai { get; set; } = string.Empty; // "DA_DUYET", "TU_CHOI", "DANG_XU_LY"
    public string? GhiChu { get; set; }
}

public class PhanCongGiaoVienDto
{
    public int IdGv { get; set; }
    public string? GhiChu { get; set; }
}

