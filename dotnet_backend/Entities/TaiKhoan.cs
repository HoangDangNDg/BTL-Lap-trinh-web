using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("tai_khoan")]
public class TaiKhoan
{
    [Key]
    [Column("id_tk")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdTk { get; set; }

    [Column("ten_dang_nhap")]
    [Required]
    [MaxLength(100)]
    public string TenDangNhap { get; set; } = string.Empty;

    [Column("mat_khau")]
    [Required]
    [MaxLength(255)]
    public string MatKhau { get; set; } = string.Empty;

    [Column("trang_thai")]
    [MaxLength(50)]
    public string? TrangThai { get; set; } = "HoatDong";

    [Column("id_tai_khoan_vai_tro")]
    public int? IdTaiKhoanVaiTro { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
