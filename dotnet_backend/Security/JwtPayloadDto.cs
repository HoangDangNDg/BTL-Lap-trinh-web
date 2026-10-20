namespace dotnet_backend.Security;

public class JwtPayloadDto
{
    public int UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? RoleId { get; set; }
    public int? IdDoanhNghiep { get; set; }
    public int? IdChiNhanh { get; set; }
    public List<string> QuyenHan { get; set; } = new();
}
