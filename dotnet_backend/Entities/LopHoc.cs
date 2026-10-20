using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("lop_hoc")]
public class LopHoc
{
    [Key]
    [Column("id_lop")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdLop { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("id_kh")]
    public int IdKh { get; set; }

    [ForeignKey("IdKh")]
    public virtual KyHoc? KyHoc { get; set; }

    [Column("id_gv")]
    public int? IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("id_mh")]
    public int? IdMh { get; set; }

    [ForeignKey("IdMh")]
    public virtual MonHoc? MonHoc { get; set; }

    [Column("ten_lop")]
    [Required]
    [MaxLength(100)]
    public string TenLop { get; set; } = string.Empty;

    [Column("trang_thai")]
    [MaxLength(50)]
    public string? TrangThai { get; set; } = "DangMo";

    [Column("si_so_toi_da")]
    public int? SiSoToiDa { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [NotMapped]
    public int? IdKyHoc { get; set; }

}
