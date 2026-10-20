using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("thang_hoc")]
public class ThangHoc
{
    [Key]
    [Column("id_thang_hoc")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdThangHoc { get; set; }

    [Column("id_kh")]
    public int IdKh { get; set; }

    [ForeignKey("IdKh")]
    public virtual KyHoc? KyHoc { get; set; }

    [Column("id_nh")]
    public int IdNh { get; set; }

    [ForeignKey("IdNh")]
    public virtual NamHoc? NamHoc { get; set; }

    [Column("thang")]
    public int Thang { get; set; }

    [Column("nam")]
    public int Nam { get; set; }

    [Column("ten_thang")]
    [Required]
    [MaxLength(50)]
    public string TenThang { get; set; } = string.Empty;

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
