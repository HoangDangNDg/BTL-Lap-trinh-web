using dotnet_backend.Controllers;
using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Security;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace dotnet_tests;

public class AuthControllerTests
{
    private readonly IJwtProvider _jwtProvider;

    public AuthControllerTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLXdpdGgtc3VmZmljaWVudC1sZW5ndGgtMjU2LWJpdHM="},
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
    public async Task DangNhap_ShouldReturn400_WhenCredentialsAreEmpty()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("AuthDb_Test1");
        var taiKhoanService = new TaiKhoanService(context, _jwtProvider, NullLogger<TaiKhoanService>.Instance);
        var controller = new AuthController(taiKhoanService);

        var request = new LoginRequestDto { TenDangNhap = "", MatKhau = "" };

        // Act
        var result = await controller.DangNhap(request) as ObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public async Task DangNhap_ShouldReturn200AndToken_WhenCredentialsAreValid()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("AuthDb_Test2");
        var taiKhoanService = new TaiKhoanService(context, _jwtProvider, NullLogger<TaiKhoanService>.Instance);
        var controller = new AuthController(taiKhoanService);

        // Mock HttpContext for Cookies
        var httpContext = new DefaultHttpContext();
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Seed account with BCrypt hash
        string plainPassword = "password123";
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);

        var account = new TaiKhoan
        {
            IdTk = 1,
            TenDangNhap = "admin",
            MatKhau = hashedPassword,
            Xoa = false
        };
        context.TaiKhoans.Add(account);
        context.Admins.Add(new Admin { IdAdmin = 1, HoTen = "System Administrator", Xoa = false });
        context.TaiKhoanAdmins.Add(new TaiKhoanAdmin { IdTk = 1, IdAdmin = 1 });
        await context.SaveChangesAsync();

        var request = new LoginRequestDto { TenDangNhap = "admin", MatKhau = plainPassword };

        // Act
        var result = await controller.DangNhap(request) as ObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200, result.StatusCode);

        // Check if Set-Cookie header contains refreshToken
        var setCookieHeader = httpContext.Response.Headers["Set-Cookie"].ToString();
        Assert.Contains("refreshToken", setCookieHeader);
    }
}
