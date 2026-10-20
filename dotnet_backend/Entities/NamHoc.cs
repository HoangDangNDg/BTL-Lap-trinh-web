using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("nam_hoc")]
public class NamHoc
{
    [Key]
    [Column("id_nh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdNh { get; set; }

    [Column("ngay_bat_dau")]
    public DateOnly? NgayBatDau { get; set; }

    [Column("ngay_ket_thuc")]
    public DateOnly? NgayKetThuc { get; set; }

    [Column("da_hoan_thanh")]
    public bool DaHoanThanh { get; set; } = false;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("nam_bat_dau")]
    public int? NamBatDau { get; set; }

    [Column("nam_ket_thuc")]
    public int? NamKetThuc { get; set; }

}
