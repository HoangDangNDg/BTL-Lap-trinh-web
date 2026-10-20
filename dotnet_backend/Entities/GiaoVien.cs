using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("giao_vien")]
public class GiaoVien
{
    [Key]
    [Column("id_gv")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdGv { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("ho_ten")]
    [Required]
    [MaxLength(255)]
    public string HoTen { get; set; } = string.Empty;

    [Column("gioi_tinh")]
    [MaxLength(1)]
    public string? GioiTinh { get; set; }

    [Column("ngay_sinh")]
    public DateOnly? NgaySinh { get; set; }

    [Column("sdt")]
    [MaxLength(20)]
    public string? Sdt { get; set; }

    [Column("email")]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Column("con_hoat_dong")]
    public bool ConHoatDong { get; set; } = true;

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
