using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("ky_hoc")]
public class KyHoc
{
    [Key]
    [Column("id_kh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdKh { get; set; }

    [Column("id_nh")]
    public int IdNh { get; set; }

    [ForeignKey("IdNh")]
    public virtual NamHoc? NamHoc { get; set; }

    [Column("ten_ky_hoc")]
    [Required]
    [MaxLength(100)]
    public string TenKyHoc { get; set; } = string.Empty;

    [Column("ngay_bat_dau")]
    public DateOnly? NgayBatDau { get; set; }

    [Column("ngay_ket_thuc")]
    public DateOnly? NgayKetThuc { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
