using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("tuan_hoc")]
public class TuanHoc
{
    [Key]
    [Column("id_th")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdTh { get; set; }

    [Column("id_kh")]
    public int IdKh { get; set; }

    [ForeignKey("IdKh")]
    public virtual KyHoc? KyHoc { get; set; }

    [Column("id_thang_hoc")]
    public int? IdThangHoc { get; set; }

    [ForeignKey("IdThangHoc")]
    public virtual ThangHoc? ThangHoc { get; set; }

    [Column("so_tuan")]
    public int SoTuan { get; set; }

    [Column("ngay_bat_dau")]
    public DateOnly? NgayBatDau { get; set; }

    [Column("ngay_ket_thuc")]
    public DateOnly? NgayKetThuc { get; set; }

    [Column("mo_ta")]
    [MaxLength(255)]
    public string? MoTa { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
