using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("tai_khoan_ql")]
public class TaiKhoanQl
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("id_qly")]
    public int? IdQly { get; set; }

    [ForeignKey("IdQly")]
    public virtual QuanLy? QuanLy { get; set; }

    [Column("id_tk")]
    public int? IdTk { get; set; }

    [ForeignKey("IdTk")]
    public virtual TaiKhoan? TaiKhoan { get; set; }

}
