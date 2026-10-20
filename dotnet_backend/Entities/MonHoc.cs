using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("mon_hoc")]
public class MonHoc
{
    [Key]
    [Column("id_mh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdMh { get; set; }

    [Column("id_chuyen_mon")]
    public int IdChuyenMon { get; set; }

    [ForeignKey("IdChuyenMon")]
    public virtual ChuyenMon? ChuyenMon { get; set; }

    [Column("id_bo_mon")]
    public int IdBoMon { get; set; }

    [ForeignKey("IdBoMon")]
    public virtual BoMon? BoMon { get; set; }

    [Column("ten_mon")]
    [Required]
    [MaxLength(255)]
    public string TenMon { get; set; } = string.Empty;

    [Column("mo_ta")]
    public string? MoTa { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
