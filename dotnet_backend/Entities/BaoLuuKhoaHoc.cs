using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("bao_luu_khoa_hoc")]
public class BaoLuuKhoaHoc
{
    [Key]
    [Column("id_bao_luu")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdBaoLuu { get; set; }

    [Column("id_hs")]
    public int IdHs { get; set; }

    [ForeignKey("IdHs")]
    public virtual HocSinh? HocSinh { get; set; }

    [Column("id_lop")]
    public int IdLop { get; set; }

    [ForeignKey("IdLop")]
    public virtual LopHoc? LopHoc { get; set; }

    [Column("id_dang_ky")]
    public int IdDangKy { get; set; }

    [ForeignKey("IdDangKy")]
    public virtual DangKyHoc? DangKyHoc { get; set; }

    [Column("ngay_bat_dau")]
    public DateOnly? NgayBatDau { get; set; }

    [Column("ngay_ket_thuc")]
    public DateOnly? NgayKetThuc { get; set; }

    [Column("so_buoi_da_hoc")]
    public int SoBuoiDaHoc { get; set; }

    [Column("trang_thai_bao_luu")]
    public bool TrangThaiBaoLuu { get; set; } = false;

    [Column("ngay_hoan_tra")]
    public DateOnly? NgayHoanTra { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
