using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("phong_hoc")]
public class PhongHoc
{
    [Key]
    [Column("id_phong")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdPhong { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("ten_phong")]
    [Required]
    [MaxLength(100)]
    public string TenPhong { get; set; } = string.Empty;

    [Column("suc_chua")]
    public int? SucChua { get; set; }

    [Column("loai_phong")]
    [MaxLength(50)]
    public string? LoaiPhong { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
