using dotnet_backend.Security;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace dotnet_tests;

public class JwtProviderTests
{
    private readonly IJwtProvider _jwtProvider;
    private readonly string _testSecret = "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLXdpdGgtc3VmZmljaWVudC1sZW5ndGgtMjU2LWJpdHM=";

    public JwtProviderTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", _testSecret},
            {"Jwt:Issuer", "quanlytrungtam-auth-service"},
            {"Jwt:AccessTokenExpirationMinutes", "15"},
            {"Jwt:RefreshTokenExpirationDays", "7"}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _jwtProvider = new JwtProvider(configuration);
    }

    [Fact]
    public void GenerateToken_ShouldReturnValidJwt_AndExtractCorrectClaims()
    {
        // Arrange
        var payload = new JwtPayloadDto
        {
            UserId = 100,
            Role = "QUAN_LY",
            RoleId = 5,
            IdDoanhNghiep = 1,
            IdChiNhanh = 2,
            QuyenHan = new List<string> { "VIEW_DASHBOARD", "MANAGE_USERS" }
        };

        // Act
        string token = _jwtProvider.GenerateToken(payload);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        bool isValid = _jwtProvider.IsTokenValid(token);
        Assert.True(isValid);

        var extracted = _jwtProvider.ExtractPayload(token);
        Assert.NotNull(extracted);
        Assert.Equal(payload.UserId, extracted.UserId);
        Assert.Equal("QUAN_LY", extracted.Role);
        Assert.Equal(payload.RoleId, extracted.RoleId);
        Assert.Equal(payload.IdDoanhNghiep, extracted.IdDoanhNghiep);
        Assert.Equal(payload.IdChiNhanh, extracted.IdChiNhanh);
        Assert.Contains("VIEW_DASHBOARD", extracted.QuyenHan);
        Assert.Contains("MANAGE_USERS", extracted.QuyenHan);
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnValidJwt()
    {
        // Act
        string refreshToken = _jwtProvider.GenerateRefreshToken(100);

        // Assert
        Assert.NotNull(refreshToken);
        Assert.NotEmpty(refreshToken);
        Assert.True(_jwtProvider.IsTokenValid(refreshToken));
    }

    [Fact]
    public void IsTokenValid_ShouldReturnFalse_ForTamperedToken()
    {
        // Arrange
        var payload = new JwtPayloadDto { UserId = 1, Role = "ADMIN" };
        string token = _jwtProvider.GenerateToken(payload);
        string tamperedToken = token + "corrupted";

        // Act & Assert
        Assert.False(_jwtProvider.IsTokenValid(tamperedToken));
    }
}
