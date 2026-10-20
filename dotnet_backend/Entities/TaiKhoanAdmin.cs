using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("tai_khoan_admin")]
public class TaiKhoanAdmin
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("id_admin")]
    public int IdAdmin { get; set; }

    [ForeignKey("IdAdmin")]
    public virtual Admin? Admin { get; set; }

    [Column("id_tk")]
    public int IdTk { get; set; }

    [ForeignKey("IdTk")]
    public virtual TaiKhoan? TaiKhoan { get; set; }

}
