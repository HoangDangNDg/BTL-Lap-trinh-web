using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("giao_vien_chuyen_mon")]
public class GiaoVienChuyenMon
{
    [Key]
    [Column("id_gv_chuyen_mon")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdGvChuyenMon { get; set; }

    [Column("id_gv")]
    public int IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("id_chuyen_mon")]
    public int IdChuyenMon { get; set; }

    [ForeignKey("IdChuyenMon")]
    public virtual ChuyenMon? ChuyenMon { get; set; }

    [Column("trang_thai")]
    [MaxLength(50)]
    public string? TrangThai { get; set; }

    [Column("ngay_cap_nhat")]
    public DateTime? NgayCapNhat { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
