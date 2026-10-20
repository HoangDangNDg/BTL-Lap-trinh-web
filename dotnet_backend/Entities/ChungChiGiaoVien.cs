using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("chung_chi_giao_vien")]
public class ChungChiGiaoVien
{
    [Key]
    [Column("id_chung_chi")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdChungChi { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("ten_chung_chi")]
    [Required]
    [MaxLength(255)]
    public string TenChungChi { get; set; } = string.Empty;

    [Column("ngay_cap")]
    public DateOnly? NgayCap { get; set; }

    [Column("url_anh")]
    [MaxLength(500)]
    public string? UrlAnh { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
