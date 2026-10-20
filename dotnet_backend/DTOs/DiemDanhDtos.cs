namespace dotnet_backend.DTOs;

public class DiemDanhHocSinhItemDto
{
    public int IdHs { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "CO_MAT"; // CO_MAT, CO_PHEP, VANG
    public string? GhiChu { get; set; }
}

public class LuuDiemDanhBuoiHocRequest
{
    public int IdBuoiHoc { get; set; }
    public int? IdKhoaHoc { get; set; }
    public List<DiemDanhHocSinhItemDto> DanhSach { get; set; } = new();
}

public class DiemDanhGiaoVienRequest
{
    public int IdBuoiHoc { get; set; }
    public int IdGv { get; set; }
    public string TrangThai { get; set; } = "CO_MAT";
    public string? GhiChu { get; set; }
}
