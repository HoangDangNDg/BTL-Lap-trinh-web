using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("chuyen_mon")]
public class ChuyenMon
{
    [Key]
    [Column("id_cm")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdCm { get; set; }

    [Column("ten_cm")]
    [Required]
    [MaxLength(255)]
    public string TenCm { get; set; } = string.Empty;

    [Column("mo_ta")]
    public string? MoTa { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
