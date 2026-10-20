using dotnet_backend.Common;
using dotnet_backend.Data;
using dotnet_backend.Security;
using dotnet_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database Connection MySQL (đồng bộ với database.sql & Java backend)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=127.0.0.1;Port=3306;Database=trung_tam_giao_duc_dbv4;Uid=root;Pwd=;Charset=utf8mb4;";

builder.Services.AddDbContext<QuanLyTrungTamDbContext>(options =>
{
    options.UseMySQL(connectionString);
});

// 2. Cấu hình JWT Authentication đồng bộ 100% với Java JwtProvider
var secretKeyBase64 = builder.Configuration["Jwt:SecretKey"] 
    ?? "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLXdpdGgtc3VmZmljaWVudC1sZW5ndGgtMjU2LWJpdHM=";
var keyBytes = Convert.FromBase64String(secretKeyBase64);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "quanlytrungtam-auth-service";

builder.Services.AddSingleton<IJwtProvider, JwtProvider>();

// 3. Đăng ký Quốc tế hóa & Đa ngôn ngữ (i18n / Localization)
builder.Services.AddHttpContextAccessor();
builder.Services.AddLocalization();
builder.Services.AddSingleton<ILocalizationService, LocalizationService>();

// 4. Đăng ký các Business Services (tương đương @Service trong Spring)
builder.Services.AddScoped<ITaiKhoanService, TaiKhoanService>();
builder.Services.AddScoped<IHocSinhService, HocSinhService>();
builder.Services.AddScoped<IDiemDanhService, DiemDanhService>();
builder.Services.AddScoped<ITaiChinhService, TaiChinhService>();
builder.Services.AddScoped<IDaoTaoService, DaoTaoService>();
builder.Services.AddScoped<INhanSuService, NhanSuService>();
builder.Services.AddScoped<IDoanhNghiepService, DoanhNghiepService>();
builder.Services.AddScoped<ICoSoVatChatService, CoSoVatChatService>();
builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                success = false,
                code = "THIEU_XAC_THUC",
                statusCode = 401,
                message = "Yêu cầu đăng nhập hoặc Token xác thực không hợp lệ"
            });
            await context.Response.WriteAsync(result);
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                success = false,
                code = "TU_CHOI_TRUY_CAP",
                statusCode = 403,
                message = "Bạn không có quyền truy cập vào tính năng hoặc tài nguyên này"
            });
            await context.Response.WriteAsync(result);
        }
    };
});

builder.Services.AddAuthorization();

// 3. Cấu hình CORS đồng bộ với Java backend
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Cấu hình Controllers & OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var errMessage = feature?.Error?.Message ?? "Hệ thống đang bận, vui lòng thử lại sau";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            success = false,
            code = "LOI_HE_THONG",
            statusCode = 500,
            message = errMessage
        });
        await context.Response.WriteAsync(result);
    });
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Trung Tâm Giáo Dục .NET API Reference");
        options.WithTheme(ScalarTheme.Moon);
    });
}

// 5. Cấu hình Quốc tế hóa Middleware (i18n)
var supportedCultures = new[] { "vi-VN", "en-US" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture("vi-VN")
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

app.UseRequestLocalization(localizationOptions);

app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
