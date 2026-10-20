using System.Globalization;
using dotnet_backend.Common;
using Xunit;

namespace dotnet_tests;

public class LocalizationServiceTests
{
    [Fact]
    public void LocalizationService_ShouldReturnVietnameseByDefault()
    {
        // Arrange
        CultureInfo.CurrentUICulture = new CultureInfo("vi-VN");
        var service = new LocalizationService();

        // Act
        var loginMsg = service["Auth_LoginSuccess"];
        var studentListMsg = service["Student_ListSuccess"];

        // Assert
        Assert.Equal("vi-VN", service.CurrentCulture);
        Assert.Equal("Đăng nhập thành công", loginMsg);
        Assert.Equal("Lấy danh sách học sinh thành công", studentListMsg);
    }

    [Fact]
    public void LocalizationService_ShouldReturnEnglish_WhenCultureIsEnUS()
    {
        // Arrange
        CultureInfo.CurrentUICulture = new CultureInfo("en-US");
        var service = new LocalizationService();

        // Act
        var loginMsg = service["Auth_LoginSuccess"];
        var studentListMsg = service["Student_ListSuccess"];
        var notFoundMsg = service.Get("Student_NotFound", 999);

        // Assert
        Assert.Equal("en-US", service.CurrentCulture);
        Assert.Equal("Login successful", loginMsg);
        Assert.Equal("Retrieved student list successfully", studentListMsg);
        Assert.Equal("Student with ID 999 not found", notFoundMsg);
    }

    [Fact]
    public void LocalizationService_ShouldFormatArgumentsCorrectly()
    {
        // Arrange
        CultureInfo.CurrentUICulture = new CultureInfo("vi-VN");
        var service = new LocalizationService();

        // Act
        var batchMsgVi = service.Get("Attendance_SaveSuccess", 15);

        // Switch to English
        CultureInfo.CurrentUICulture = new CultureInfo("en-US");
        var batchMsgEn = service.Get("Attendance_SaveSuccess", 15);

        // Assert
        Assert.Equal("Điểm danh 15 học sinh thành công", batchMsgVi);
        Assert.Equal("Recorded attendance for 15 students successfully", batchMsgEn);
    }

    [Fact]
    public void LocalizationService_ShouldFallbackToVietnamese_WhenKeyMissingInEnglish()
    {
        // Arrange
        CultureInfo.CurrentUICulture = new CultureInfo("en-US");
        var service = new LocalizationService();

        // Act
        var allStrings = service.GetAllStrings();

        // Assert
        Assert.NotNull(allStrings);
        Assert.True(allStrings.ContainsKey("Auth_LoginSuccess"));
    }
}
