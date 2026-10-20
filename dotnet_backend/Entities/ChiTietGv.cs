using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("chi_tiet_gv")]
public class ChiTietGv
{
    [Key]
    [Column("id_chi_tiet_gv")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdChiTietGv { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("cccd")]
    public long? Cccd { get; set; }

    [Column("url_anh")]
    [MaxLength(500)]
    public string? UrlAnh { get; set; }

    [Column("sdt_nguoi_than")]
    [MaxLength(20)]
    public string? SdtNguoiThan { get; set; }

    [Column("ten_nguoi_than")]
    [MaxLength(255)]
    public string? TenNguoiThan { get; set; }

    [Column("dia_chi")]
    public string? DiaChi { get; set; }

    [Column("trinh_do")]
    [MaxLength(255)]
    public string? TrinhDo { get; set; }

    [Column("ngay_vao_lam")]
    public DateOnly? NgayVaoLam { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("trang_thai_hoat_dong")]
    public bool TrangThaiHoatDong { get; set; }

}
