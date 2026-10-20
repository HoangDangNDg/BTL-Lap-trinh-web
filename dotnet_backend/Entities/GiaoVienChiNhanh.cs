using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("giao_vien_chi_nhanh")]
public class GiaoVienChiNhanh
{
    [Key]
    [Column("id_gv_chi_nhanh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdGvChiNhanh { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("ngay_bat_dau")]
    public DateOnly? NgayBatDau { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
