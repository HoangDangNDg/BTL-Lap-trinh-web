using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("diem_danh_giao_vien")]
public class DiemDanhGiaoVien
{
    [Key]
    [Column("id_diem_danh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdDiemDanh { get; set; }

    [Column("id_buoi_hoc")]
    public int IdBuoiHoc { get; set; }

    [ForeignKey("IdBuoiHoc")]
    public virtual BuoiHoc? BuoiHoc { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("trang_thai")]
    [Required]
    [MaxLength(50)]
    public string TrangThai { get; set; } = string.Empty;

    [Column("xoa")]
    public bool Xoa { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
