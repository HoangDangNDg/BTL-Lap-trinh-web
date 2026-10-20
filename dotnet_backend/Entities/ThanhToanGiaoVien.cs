using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("thanh_toan_giao_vien")]
public class ThanhToanGiaoVien
{
    [Key]
    [Column("id_thanh_toan")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdThanhToan { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("id_khoa_hoc")]
    public int? IdKhoaHoc { get; set; }

    [ForeignKey("IdKhoaHoc")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("id_thanh_toan_gv_kh")]
    public int? IdThanhToanGvKh { get; set; }

    [ForeignKey("IdThanhToanGvKh")]
    public virtual ThanhToanGiaoVienKhoaHoc? ThanhToanGiaoVienKhoaHoc { get; set; }

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

    [Column("so_tien")]
    public decimal SoTien { get; set; }

    [Column("ngay_thanh_toan")]
    public DateOnly? NgayThanhToan { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
