using dotnet_backend.DTOs;
using dotnet_backend.Entities;
using dotnet_backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace dotnet_tests;

public class TaiChinhServiceTests
{
    [Fact]
    public async Task LapPhieuThuHocPhi_ShouldApplyDiscount_AndCreateCashbookEntry()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("TaiChinhDb_Test1");
        var logger = NullLogger<TaiChinhService>.Instance;
        var service = new TaiChinhService(context, logger);

        var request = new TaoPhieuThuRequest
        {
            IdHs = 10,
            IdDn = 1,
            SoTien = 1000000m,
            PhanTramGiam = 10m, // 10% discount -> actual: 900,000
            HinhThucThanhToan = "CHUYEN_KHOAN"
        };

        // Act
        var response = await service.LapPhieuThuHocPhiAsync(request);

        // Assert
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(900000m, response.Data.SoTienThu);

        // Check if SoQuyThuChi was created
        var soQuyList = await context.SoQuyThuChis.ToListAsync();
        Assert.Single(soQuyList);
        Assert.Equal("THU", soQuyList[0].LoaiGiaoDich);
        Assert.Equal(900000m, soQuyList[0].SoTien);
    }

    [Fact]
    public async Task LayBaoCaoTongHop_ShouldCalculateRevenueAndExpenseCorrectly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext("TaiChinhDb_Test2");
        var logger = NullLogger<TaiChinhService>.Instance;
        var service = new TaiChinhService(context, logger);

        context.SoQuyThuChis.AddRange(
            new SoQuyThuChi { IdDn = 1, LoaiGiaoDich = "THU", SoTien = 5000000m, Xoa = false },
            new SoQuyThuChi { IdDn = 1, LoaiGiaoDich = "THU", SoTien = 3000000m, Xoa = false },
            new SoQuyThuChi { IdDn = 1, LoaiGiaoDich = "CHI", SoTien = 2000000m, Xoa = false },
            new SoQuyThuChi { IdDn = 1, LoaiGiaoDich = "CHI", SoTien = 1000000m, Xoa = true } // Deleted entry
        );
        await context.SaveChangesAsync();

        // Act
        var response = await service.LayBaoCaoTongHopAsync(1, null, null);

        // Assert
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(8000000m, response.Data.TongThu);
        Assert.Equal(2000000m, response.Data.TongChi);
        Assert.Equal(6000000m, response.Data.TonQuy);
        Assert.Equal(2, response.Data.SoPhieuThu);
        Assert.Equal(1, response.Data.SoPhieuChi);
    }
}
