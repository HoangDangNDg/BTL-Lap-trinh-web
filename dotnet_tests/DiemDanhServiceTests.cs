using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace dotnet_tests;

public class DiemDanhServiceTests
{
    [Fact]
    public async Task LuuDiemDanhHocSinhBatch_ShouldInsertAndUpsertCorrectly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("DiemDanhDb_Test1");
        var logger = NullLogger<DiemDanhService>.Instance;
        var service = new DiemDanhService(context, logger);

        // Seed Session
        context.BuoiHocs.Add(new BuoiHoc { IdBuoiHoc = 1, IdKhoaHoc = 5, IdDn = 1, Xoa = false });
        // Student 1 already attended earlier as absent (false)
        context.DiemDanhHocSinhs.Add(new DiemDanhHocSinh
        {
            IdBuoiHoc = 1,
            IdHs = 1,
            IdKhoaHoc = 5,
            IdDn = 1,
            TrangThai = false,
            Xoa = false
        });
        await context.SaveChangesAsync();

        // Act - Submit batch attendance where Student 1 is now Present, and Student 2 is new
        var request = new LuuDiemDanhBuoiHocRequest
        {
            IdBuoiHoc = 1,
            IdKhoaHoc = 5,
            DanhSach = new List<DiemDanhHocSinhItemDto>
            {
                new DiemDanhHocSinhItemDto { IdHs = 1, TrangThai = "CO_MAT" },
                new DiemDanhHocSinhItemDto { IdHs = 2, TrangThai = "VANG" }
            }
        };

        var response = await service.LuuDiemDanhHocSinhBatchAsync(request);

        // Assert
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(2, response.Data.Count);

        // Verify Student 1 updated to Present (true)
        var s1 = response.Data.First(x => x.IdHs == 1);
        Assert.True(s1.TrangThai);

        // Verify Student 2 inserted as Absent (false)
        var s2 = response.Data.First(x => x.IdHs == 2);
        Assert.False(s2.TrangThai);
    }
}
