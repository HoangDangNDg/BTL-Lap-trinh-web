using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("hoc_sinh_khoa_hoc")]
public class HocSinhKhoaHoc
{
    [Key]
    [Column("id_hs_kh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdHsKh { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("id_khoa_hoc")]
    public int IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("ho_ten")]
    [MaxLength(255)]
    public string? HoTen { get; set; }

    [Column("so_buoi_da_hoc")]
    public int SoBuoiDaHoc { get; set; }

    [Column("ngay_dang_ky")]
    public DateOnly? NgayDangKy { get; set; }

    [Column("trang_thai")]
    public bool TrangThai { get; set; } = true;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
