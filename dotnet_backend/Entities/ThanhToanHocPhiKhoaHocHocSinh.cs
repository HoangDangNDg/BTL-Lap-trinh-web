using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("thanh_toan_hoc_phi_khoa_hoc_hoc_sinh")]
public class ThanhToanHocPhiKhoaHocHocSinh
{
    [Key]
    [Column("id_thanh_toan")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdThanhToan { get; set; }

    [Column("id_phieu_thu")]
    public int? IdPhieuThu { get; set; }

    [ForeignKey("IdPhieuThu")]
    public virtual PhieuThuHocPhi? PhieuThuHocPhi { get; set; }

    [Column("id_hs_kh")]
    public int IdHsKh { get; set; }

    [ForeignKey("IdHsKh")]
    public virtual HocSinhKhoaHoc? HocSinhKhoaHoc { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("id_khoa_hoc")]
    public int IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("tong_tien_phai_nap")]
    public decimal TongTienPhaiNap { get; set; }

    [Column("so_tien_da_nap")]
    public decimal SoTienDaNap { get; set; }

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
