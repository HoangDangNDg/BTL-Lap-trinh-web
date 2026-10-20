using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_backend.Entities;

[Table("refresh_token")]
public class RefreshToken
{
    [Key]
    [Column("id_refresh")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdRefresh { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("refresh_token")]
    [Required]
    public string Token { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    [Column("xoa")]
    public bool Xoa { get; set; } = false;

}
