using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("bo_mon")]
public class BoMon
{
    [Key]
    [Column("id_bo_mon")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdBoMon { get; set; }

    [Column("ten_bo_mon")]
    [Required]
    [MaxLength(255)]
    public string TenBoMon { get; set; } = string.Empty;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
