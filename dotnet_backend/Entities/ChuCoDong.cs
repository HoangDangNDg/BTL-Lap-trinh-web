using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("chu_co_dong")]
public class ChuCoDong
{
    [Key]
    [Column("id_cd")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdCd { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("ho_ten")]
    [Required]
    [MaxLength(255)]
    public string HoTen { get; set; } = string.Empty;

    [Column("email")]
    [Required]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("sdt")]
    [Required]
    [MaxLength(20)]
    public string Sdt { get; set; } = string.Empty;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
