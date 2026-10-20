using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("phieu_thu_hoc_phi")]
public class PhieuThuHocPhi
{
    [Key]
    [Column("id_phieu_thu")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdPhieuThu { get; set; }

    [Column("id_dang_ky")]
    public int? IdDangKy { get; set; }

    [ForeignKey("IdDangKy")]
    public virtual DangKyHoc? DangKyHoc { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("id_khoa_hoc")]
    public int? IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("id_thanh_toan_kh")]
    public int? IdThanhToanKh { get; set; }

    [ForeignKey("IdThanhToanKh")]
    public virtual ThanhToanHocPhiKhoaHocHocSinh? ThanhToanHocPhiKhoaHocHocSinh { get; set; }

    [Column("id_thang_hoc")]
    public int? IdThangHoc { get; set; }

    [ForeignKey("IdThangHoc")]
    public virtual ThangHoc? ThangHoc { get; set; }

    [Column("id_tuan_hoc")]
    public int? IdTuanHoc { get; set; }

    [ForeignKey("IdTuanHoc")]
    public virtual TuanHoc? TuanHoc { get; set; }

    [Column("id_tc_thang")]
    public int? IdTcThang { get; set; }

    [ForeignKey("IdTcThang")]
    public virtual ThuChiThangHoc? ThuChiThangHoc { get; set; }

    [Column("id_tc_tuan")]
    public int? IdTcTuan { get; set; }

    [ForeignKey("IdTcTuan")]
    public virtual ThuChiTuanHoc? ThuChiTuanHoc { get; set; }

    [Column("so_tien_thu")]
    public decimal SoTienThu { get; set; }

    [Column("ngay_thu")]
    public DateOnly? NgayThu { get; set; }

    [Column("phuong_thuc")]
    [MaxLength(100)]
    public string? PhuongThuc { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
