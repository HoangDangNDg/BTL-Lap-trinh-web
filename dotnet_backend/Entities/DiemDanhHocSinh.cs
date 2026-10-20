using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("diem_danh_hoc_sinh")]
public class DiemDanhHocSinh
{
    [Key]
    [Column("id_diem_danh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdDiemDanh { get; set; }

    [Column("id_buoi_hoc")]
    public int IdBuoiHoc { get; set; }

    [ForeignKey("IdBuoiHoc")]
    public virtual BuoiHoc? BuoiHoc { get; set; }

    [Column("id_khoa_hoc")]
    public int IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("trang_thai")]
    public bool TrangThai { get; set; } = true;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
