using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("chi_nhanh")]
public class ChiNhanh
{
    [Key]
    [Column("id_cn")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdCn { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("ten_cn")]
    [Required]
    [MaxLength(255)]
    public string TenCn { get; set; } = string.Empty;

    [Column("dia_chi")]
    public string? DiaChi { get; set; }

    [Column("sdt")]
    [MaxLength(20)]
    public string? Sdt { get; set; }

}
