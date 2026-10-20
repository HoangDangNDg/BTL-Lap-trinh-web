using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("so_quy_thu_chi")]
public class SoQuyThuChi
{
    [Key]
    [Column("id_giao_dich")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdGiaoDich { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("loai_giao_dich")]
    [Required]
    [MaxLength(50)]
    public string LoaiGiaoDich { get; set; } = string.Empty;

    [Column("so_tien")]
    public decimal SoTien { get; set; }

    [Column("ngay_giao_dich")]
    public DateOnly? NgayGiaoDich { get; set; }

    [Column("mo_ta")]
    public string? MoTa { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

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

}
