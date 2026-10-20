using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("phu_huynh_hoc_sinh")]
public class PhuHuynhHocSinh
{
    [Key]
    [Column("id_ph_hs")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdPhHs { get; set; }

    [Column("id_ph")]
    public int IdPh { get; set; }

    [ForeignKey("IdPh")]
    public virtual PhuHuynh? PhuHuynh { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("la_nguoi_dai_dien")]
    public bool? LaNguoiDaiDien { get; set; }

    [Column("quan_he")]
    [MaxLength(100)]
    public string? QuanHe { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
