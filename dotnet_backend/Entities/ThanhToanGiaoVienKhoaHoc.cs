using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("thanh_toan_giao_vien_khoa_hoc")]
public class ThanhToanGiaoVienKhoaHoc
{
    [Key]
    [Column("id_thanh_toan")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdThanhToan { get; set; }

    [Column("id_thanh_toan_gv")]
    public int? IdThanhToanGv { get; set; }

    [ForeignKey("IdThanhToanGv")]
    public virtual ThanhToanGiaoVien? PhieuThanhToanGiaoVien { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("id_khoa_hoc")]
    public int IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("tong_tien_phai_nap")]
    public decimal TongTienPhaiNap { get; set; }

    [Column("so_tien_da_nap")]
    public decimal SoTienDaNap { get; set; }

    [Column("ngay_thanh_toan")]
    public DateOnly? NgayThanhToan { get; set; }

    [Column("ghi_chu")]
    [MaxLength(255)]
    public string? GhiChu { get; set; }

    [Column("trang_thai")]
    public bool TrangThai { get; set; } = false;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
