using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("dang_ky_hoc")]
public class DangKyHoc
{
    [Key]
    [Column("id_dang_ky")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdDangKy { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("id_lop")]
    public int IdLop { get; set; }

    [ForeignKey("IdLop")]
    public virtual LopHoc? LopHoc { get; set; }

    [Column("id_ph")]
    public int? IdPh { get; set; }

    [ForeignKey("IdPh")]
    public virtual PhuHuynh? PhuHuynh { get; set; }

    [Column("ngay_dang_ky")]
    public DateOnly? NgayDangKy { get; set; }

    [Column("trang_thai_thanh_toan")]
    public bool TrangThaiThanhToan { get; set; }

    [Column("hoc_phi")]
    public decimal HocPhi { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
