using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("khoa_hoc")]
public class KhoaHoc
{
    [Key]
    [Column("id_khoa_hoc")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdKhoaHoc { get; set; }

    [Column("id_bo_mon")]
    public int IdBoMon { get; set; }

    [ForeignKey("IdBoMon")]
    public virtual BoMon? BoMon { get; set; }

    [Column("id_lop")]
    public int? IdLop { get; set; }

    [ForeignKey("IdLop")]
    public virtual LopHoc? LopHoc { get; set; }

    [Column("id_mh")]
    public int? IdMh { get; set; }

    [ForeignKey("IdMh")]
    public virtual MonHoc? MonHoc { get; set; }

    [Column("ten_khoa_hoc")]
    [Required]
    [MaxLength(255)]
    public string TenKhoaHoc { get; set; } = string.Empty;

    [Column("so_tiet")]
    public int? SoTiet { get; set; }

    [Column("so_buoi_da_day")]
    public int SoBuoiDaDay { get; set; }

    [Column("trang_thai_hoan_thanh")]
    public bool TrangThaiHoanThanh { get; set; } = false;

    [Column("ngay_bat_dau")]
    public decimal? NgayBatDau { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
