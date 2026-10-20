using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("hoc_sinh")]
public class HocSinh
{
    [Key]
    [Column("id_hs")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdHs { get; set; }

    [Column("id_ph")]
    public int? IdPh { get; set; }

    [ForeignKey("IdPh")]
    public virtual PhuHuynh? PhuHuynh { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("ho_ten")]
    [Required]
    [MaxLength(255)]
    public string HoTen { get; set; } = string.Empty;

    [Column("ngay_sinh")]
    public DateOnly? NgaySinh { get; set; }

    [Column("gioi_tinh")]
    [MaxLength(1)]
    public string? GioiTinh { get; set; }

    [Column("so_dien_thoai")]
    [MaxLength(20)]
    public string? SoDienThoai { get; set; }

    [Column("cccd")]
    [MaxLength(20)]
    public string? Cccd { get; set; }

    [Column("dia_chi")]
    public string? DiaChi { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
