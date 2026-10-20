using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("admin")]
public class Admin
{
    [Key]
    [Column("id_admin")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdAdmin { get; set; }

    [Column("ho_ten")]
    [Required]
    [MaxLength(100)]
    public string HoTen { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Column("sdt")]
    [MaxLength(20)]
    public string? Sdt { get; set; }

    [Column("chuc_vu")]
    [MaxLength(100)]
    public string? ChucVu { get; set; } = "Quản trị viên hệ thống";

    [Column("ghi_chu")]
    public string? GhiChu { get; set; }

    [Column("ngay_tao")]
    public DateTime? NgayTao { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
