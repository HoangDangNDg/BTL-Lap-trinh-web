namespace dotnet_backend.DTOs;

public class HocSinhFilterDto
{
    public string? Keyword { get; set; }
    public int? IdDn { get; set; }
    public int? IdCn { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;

    public PagedResult() { }

    public PagedResult(List<T> items, int totalCount, int pageIndex, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageIndex = pageIndex;
        PageSize = pageSize;
    }
}

public class HocSinhResponseDto
{
    public int IdHs { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public DateOnly? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Cccd { get; set; }
    public string? DiaChi { get; set; }
    public int? IdPh { get; set; }
    public string? TenPhuHuynh { get; set; }
    public string? SdtPhuHuynh { get; set; }
    public int IdDn { get; set; }
}

public class GanHocSinhKhoaHocDto
{
    public int IdHs { get; set; }
    public int IdKhoaHoc { get; set; }
    public DateOnly? NgayDangKy { get; set; }
    public string TrangThai { get; set; } = "DANG_HOC";
    public int IdDn { get; set; } = 1;
    public int SoBuoiDaHoc { get; set; } = 0;
}

public class PhuHuynhDto
{
    public int IdPh { get; set; }
    public int IdDn { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Cccd { get; set; }
    public string? Email { get; set; }
}

public class PhuHuynhHocSinhDto
{
    public int IdPhHs { get; set; }
    public int IdHs { get; set; }
    public string? TenHocSinh { get; set; }
    public int IdPh { get; set; }
    public string? TenPhuHuynh { get; set; }
    public string? SdtPhuHuynh { get; set; }
    public bool? LaNguoiDaiDien { get; set; }
    public string? QuanHe { get; set; }
}

public class GanPhuHuynhRequest
{
    public int IdHs { get; set; }
    public int IdPh { get; set; }
    public bool? LaNguoiDaiDien { get; set; } = false;
    public string? QuanHe { get; set; } = "Phụ huynh";
}

public class TaoPhuHuynhChoHocSinhRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Cccd { get; set; }
    public string? Email { get; set; }
    public bool? LaNguoiDaiDien { get; set; } = true;
    public string? QuanHe { get; set; } = "Bố/Mẹ";
    public int? IdDn { get; set; }
}

public class HocSinhKhoaHocDto
{
    public int IdHsKh { get; set; }
    public int IdHs { get; set; }
    public string? TenHocSinh { get; set; }
    public string? HoTen { get => TenHocSinh; set => TenHocSinh = value; }
    public string? SoDienThoai { get; set; }
    public string? GioiTinh { get; set; }
    public int IdKhoaHoc { get; set; }
    public string? TenKhoaHoc { get; set; }
    public int SoBuoiDaHoc { get; set; }
    public bool TrangThai { get; set; }
    public DateOnly? NgayDangKy { get; set; }
}
