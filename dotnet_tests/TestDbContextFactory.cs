using dotnet_backend.Data;
using Microsoft.EntityFrameworkCore;

namespace dotnet_tests;

public static class TestDbContextFactory
{
    public static QuanLyTrungTamDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<QuanLyTrungTamDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        return new QuanLyTrungTamDbContext(options);
    }
}
