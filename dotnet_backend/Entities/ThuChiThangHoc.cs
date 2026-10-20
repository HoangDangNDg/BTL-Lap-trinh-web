using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("thu_chi_thang_hoc")]
public class ThuChiThangHoc
{
    [Key]
    [Column("id_tc_thang")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdTcThang { get; set; }

    [Column("id_thang_hoc")]
    public int IdThangHoc { get; set; }

    [ForeignKey("IdThangHoc")]
    public virtual ThangHoc? ThangHoc { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("tong_tien_thu")]
    public decimal TongTienThu { get; set; }

    [Column("tong_tien_chi")]
    public decimal TongTienChi { get; set; }

    [Column("ton_quy")]
    public decimal TonQuy { get; set; }

    [Column("ghi_chu")]
    [MaxLength(255)]
    public string? GhiChu { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
