using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace dotnet_backend.Security;

public interface IJwtProvider
{
    string GenerateToken(JwtPayloadDto payload);
    string GenerateRefreshToken(int userId);
    JwtPayloadDto? ExtractPayload(string token);
    bool IsTokenValid(string token);
}

public class JwtProvider : IJwtProvider
{
    private readonly IConfiguration _configuration;
    private readonly byte[] _keyBytes;
    private readonly string _issuer;
    private readonly int _accessExpirationMinutes;
    private readonly int _refreshExpirationDays;

    public JwtProvider(IConfiguration configuration)
    {
        _configuration = configuration;
        var secretKeyBase64 = _configuration["Jwt:SecretKey"] 
            ?? "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLXdpdGgtc3VmZmljaWVudC1sZW5ndGgtMjU2LWJpdHM=";
        _keyBytes = Convert.FromBase64String(secretKeyBase64);
        _issuer = _configuration["Jwt:Issuer"] ?? "quanlytrungtam-auth-service";
        _accessExpirationMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpirationMinutes"], out var acc) ? acc : 15;
        _refreshExpirationDays = int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out var refExp) ? refExp : 7;
    }

    public string GenerateToken(JwtPayloadDto payload)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var securityKey = new SymmetricSecurityKey(_keyBytes);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, payload.UserId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, "ROLE_" + payload.Role),
            new(ClaimTypes.Role, payload.Role),
            new("roles", "ROLE_" + payload.Role),
            new("roleId", payload.RoleId?.ToString() ?? "0"),
            new("idDoanhNghiep", payload.IdDoanhNghiep?.ToString() ?? "0"),
            new("idChiNhanh", payload.IdChiNhanh?.ToString() ?? "0")
        };

        if (payload.QuyenHan != null && payload.QuyenHan.Count > 0)
        {
            claims.Add(new Claim("quyenHan", JsonSerializer.Serialize(payload.QuyenHan)));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_accessExpirationMinutes),
            Issuer = _issuer,
            SigningCredentials = credentials
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken(int userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var securityKey = new SymmetricSecurityKey(_keyBytes);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(_refreshExpirationDays),
            Issuer = _issuer,
            SigningCredentials = credentials
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public JwtPayloadDto? ExtractPayload(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var securityKey = new SymmetricSecurityKey(_keyBytes);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = securityKey,
            ValidateIssuer = true,
            ValidIssuer = _issuer,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            var subClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                           ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (int.TryParse(subClaim, out var userId))
            {
                var roleClaim = principal.FindFirst("roles")?.Value 
                                ?? principal.FindFirst(ClaimTypes.Role)?.Value ?? "";
                var role = roleClaim.Replace("ROLE_", "");

                int.TryParse(principal.FindFirst("roleId")?.Value, out var roleId);
                int.TryParse(principal.FindFirst("idDoanhNghiep")?.Value, out var idDn);
                int.TryParse(principal.FindFirst("idChiNhanh")?.Value, out var idCn);

                var quyenHanJson = principal.FindFirst("quyenHan")?.Value;
                var quyenHan = string.IsNullOrEmpty(quyenHanJson) 
                    ? new List<string>() 
                    : JsonSerializer.Deserialize<List<string>>(quyenHanJson) ?? new List<string>();

                return new JwtPayloadDto
                {
                    UserId = userId,
                    Role = role,
                    RoleId = roleId,
                    IdDoanhNghiep = idDn,
                    IdChiNhanh = idCn,
                    QuyenHan = quyenHan
                };
            }
        }
        catch
        {
            return null;
        }

        return null;
    }

    public bool IsTokenValid(string token)
    {
        return ExtractPayload(token) != null;
    }
}
