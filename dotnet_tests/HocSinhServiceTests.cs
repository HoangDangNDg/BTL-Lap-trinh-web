using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace dotnet_tests;

public class HocSinhServiceTests
{
    [Fact]
    public async Task LayDanhSachHocSinh_ShouldReturnPagedResults_AndFilterByKeyword()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("HocSinhDb_Test1");
        var logger = NullLogger<HocSinhService>.Instance;
        var service = new HocSinhService(context, logger);

        // Seed 3 students
        context.HocSinhs.AddRange(
            new HocSinh { IdHs = 1, HoTen = "Nguyễn Văn A", SoDienThoai = "0901111111", IdDn = 1, Xoa = false },
            new HocSinh { IdHs = 2, HoTen = "Trần Thị B", SoDienThoai = "0902222222", IdDn = 1, Xoa = false },
            new HocSinh { IdHs = 3, HoTen = "Lê Văn C", SoDienThoai = "0903333333", IdDn = 1, Xoa = true } // Soft deleted
        );
        await context.SaveChangesAsync();

        // Act - Filter with keyword "văn"
        var filter = new HocSinhFilterDto { Keyword = "văn", PageIndex = 1, PageSize = 10 };
        var response = await service.LayDanhSachHocSinhAsync(filter);

        // Assert
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(1, response.Data.TotalCount); // Only Nguyễn Văn A (Lê Văn C is deleted)
        Assert.Equal("Nguyễn Văn A", response.Data.Items[0].HoTen);
    }

    [Fact]
    public async Task GanNhieuHocSinhVaoKhoaHoc_ShouldBatchAssign_WithoutNPlusOneDuplicates()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("HocSinhDb_Test2");
        var logger = NullLogger<HocSinhService>.Instance;
        var service = new HocSinhService(context, logger);

        // Seed Course and Students
        context.KhoaHocs.Add(new KhoaHoc { IdKhoaHoc = 10, TenKhoaHoc = "Toán 12 Cơ Bản", IdDn = 1, Xoa = false });
        context.HocSinhs.AddRange(
            new HocSinh { IdHs = 101, HoTen = "Học sinh 1", IdDn = 1, Xoa = false },
            new HocSinh { IdHs = 102, HoTen = "Học sinh 2", IdDn = 1, Xoa = false }
        );
        // Student 101 already registered
        context.HocSinhKhoaHocs.Add(new HocSinhKhoaHoc { IdHs = 101, IdKhoaHoc = 10, IdDn = 1, Xoa = false });
        await context.SaveChangesAsync();

        // Act - Attempt to batch assign [101, 102]
        var response = await service.GanNhieuHocSinhVaoKhoaHocAsync(10, new List<int> { 101, 102 });

        // Assert
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Single(response.Data); // Only student 102 was added
        Assert.Equal(102, response.Data[0].IdHs);
        Assert.Equal("Học sinh 2", response.Data[0].HoTen);
    }
}
