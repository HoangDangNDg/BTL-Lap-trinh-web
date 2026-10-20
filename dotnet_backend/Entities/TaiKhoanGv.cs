using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("tai_khoan_gv")]
public class TaiKhoanGv
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("id_gv")]
    public int? IdGv { get; set; }

    [ForeignKey("IdGv")]
    public virtual GiaoVien? GiaoVien { get; set; }

    [Column("id_tk")]
    public int? IdTk { get; set; }

    [ForeignKey("IdTk")]
    public virtual TaiKhoan? TaiKhoan { get; set; }

}
