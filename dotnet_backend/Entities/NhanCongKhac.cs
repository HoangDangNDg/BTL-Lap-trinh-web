using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("nhan_cong_khac")]
public class NhanCongKhac
{
    [Key]
    [Column("id_nhan_cong_khac")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdNhanCongKhac { get; set; }

    [Column("id_cn")]
    public int IdCn { get; set; }

    [ForeignKey("IdCn")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    [Column("ho_ten")]
    [Required]
    [MaxLength(255)]
    public string HoTen { get; set; } = string.Empty;

    [Column("vi_tri_cong_viec")]
    [MaxLength(255)]
    public string? ViTriCongViec { get; set; }

    [Column("sdt")]
    [MaxLength(20)]
    public string? Sdt { get; set; }

    [Column("email")]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Column("muc_luong")]
    public decimal? MucLuong { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

}
