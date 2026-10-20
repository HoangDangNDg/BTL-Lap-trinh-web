using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("khung_lich_hoc_co_dinh")]
public class KhungLichHocCoDinh
{
    [Key]
    [Column("id_khung_lich")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdKhungLich { get; set; }

    [Column("id_lop")]
    public int IdLop { get; set; }

    [ForeignKey("IdLop")]
    public virtual LopHoc? LopHoc { get; set; }

    [Column("id_phong")]
    public int IdPhong { get; set; }

    [ForeignKey("IdPhong")]
    public virtual PhongHoc? PhongHoc { get; set; }

    [Column("thu")]
    public int Thu { get; set; }

    [Column("ca_hoc")]
    public int CaHoc { get; set; }

    [Column("gio_bat_dau")]
    public TimeOnly? GioBatDau { get; set; }

    [Column("gio_ket_thuc")]
    public TimeOnly? GioKetThuc { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
