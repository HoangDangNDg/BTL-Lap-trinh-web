using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("tai_khoan_ccd")]
public class TaiKhoanCcd
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("id_ccd")]
    public int? IdCcd { get; set; }

    [ForeignKey("IdCcd")]
    public virtual ChuCoDong? ChuCoDong { get; set; }

    [Column("id_tk")]
    public int? IdTk { get; set; }

    [ForeignKey("IdTk")]
    public virtual TaiKhoan? TaiKhoan { get; set; }

}
