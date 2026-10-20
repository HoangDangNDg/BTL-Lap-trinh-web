using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("quan_ly")]
public class QuanLy
{
    [Key]
    [Column("id_qly")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdQly { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("ho_ten")]
    [Required]
    [MaxLength(255)]
    public string HoTen { get; set; } = string.Empty;

    [Column("sdt")]
    [MaxLength(20)]
    public string? Sdt { get; set; }

    [Column("cccd")]
    [MaxLength(20)]
    public string? Cccd { get; set; }

    [Column("email")]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Column("muc_luong")]
    public decimal? MucLuong { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
