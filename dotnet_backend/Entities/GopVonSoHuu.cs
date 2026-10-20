using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("gop_von_so_huu")]
public class GopVonSoHuu
{
    [Key]
    [Column("id_gop_von")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdGopVon { get; set; }

    [Column("id_dn")]
    public int IdDn { get; set; }

    [ForeignKey("IdDn")]
    public virtual DoanhNghiep? DoanhNghiep { get; set; }

    [Column("id_cd")]
    public int IdCd { get; set; }

    [ForeignKey("IdCd")]
    public virtual ChuCoDong? ChuCoDong { get; set; }

    [Column("ngay_gop")]
    public DateOnly? NgayGop { get; set; }

    [Column("so_tien_gop")]
    public decimal? SoTienGop { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
