using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("buoi_hoc")]
public class BuoiHoc
{
    [Key]
    [Column("id_buoi_hoc")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdBuoiHoc { get; set; }

    [Column("id_tkb_tuan")]
    public int? IdTkbTuan { get; set; }

    [ForeignKey("IdTkbTuan")]
    public virtual ThoiKhoaBieuTuan? ThoiKhoaBieuTuan { get; set; }

    [Column("id_khoa_hoc")]
    public int IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("id_lop")]
    public int IdLop { get; set; }

    [ForeignKey("IdLop")]
    public virtual LopHoc? LopHoc { get; set; }

    [Column("id_phong")]
    public int IdPhong { get; set; }

    [ForeignKey("IdPhong")]
    public virtual PhongHoc? PhongHoc { get; set; }

    [Column("ngay_hoc")]
    public DateOnly? NgayHoc { get; set; }

    [Column("ca_hoc")]
    public int? CaHoc { get; set; }

    [Column("gio_bat_dau")]
    public TimeOnly? GioBatDau { get; set; }

    [Column("gio_ket_thuc")]
    public TimeOnly? GioKetThuc { get; set; }

    [Column("noi_dung")]
    [MaxLength(500)]
    public string? NoiDung { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [NotMapped]
    public int? IdTh { get; set; }

    [NotMapped]
    public int? IdTuan { get; set; }

    [NotMapped]
    public TuanHoc? TuanHoc { get; set; }

}
