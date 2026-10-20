using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("doanh_nghiep")]
public class DoanhNghiep
{
    [Key]
    [Column("id_dn")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdDn { get; set; }

    [Column("ten_dn")]
    [Required]
    [MaxLength(255)]
    public string TenDn { get; set; } = string.Empty;

    [Column("ma_so_thue")]
    [MaxLength(50)]
    public string? MaSoThue { get; set; }

    [Column("ngay_dang_ky")]
    public DateOnly? NgayDangKy { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
