using System.Globalization;

namespace dotnet_backend.Common;

public class LocalizationService : ILocalizationService
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public static readonly string DefaultCulture = "vi-VN";
    public static readonly string EnglishCulture = "en-US";

    public IReadOnlyList<string> SupportedCultures => new List<string> { DefaultCulture, EnglishCulture };

    public string CurrentCulture
    {
        get
        {
            var culture = CultureInfo.CurrentUICulture.Name;
            if (string.IsNullOrWhiteSpace(culture))
            {
                culture = CultureInfo.CurrentCulture.Name;
            }
            return culture.StartsWith("en", StringComparison.OrdinalIgnoreCase) ? EnglishCulture : DefaultCulture;
        }
    }

    private static readonly Dictionary<string, Dictionary<string, string>> Translations = new(StringComparer.OrdinalIgnoreCase)
    {
        ["vi-VN"] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // Chung & Hệ thống
            ["Common_Success"] = "Thành công",
            ["Common_Created"] = "Tạo mới thành công",
            ["Common_NotFound"] = "Không tìm thấy dữ liệu",
            ["Common_BadRequest"] = "Dữ liệu yêu cầu không hợp lệ",
            ["Common_Unauthorized"] = "Yêu cầu xác thực danh tính",
            ["Common_Forbidden"] = "Bạn không có quyền thực hiện chức năng này",
            ["Common_InternalError"] = "Đã xảy ra lỗi nội bộ hệ thống",

            // Xác thực (Auth)
            ["Auth_LoginSuccess"] = "Đăng nhập thành công",
            ["Auth_InvalidCredentials"] = "Tài khoản hoặc mật khẩu không chính xác",
            ["Auth_RequiredUsernamePassword"] = "Tên đăng nhập và mật khẩu là bắt buộc",
            ["Auth_AccountLocked"] = "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động",
            ["Auth_RefreshTokenNotFound"] = "Không tìm thấy refreshToken trong Cookie",
            ["Auth_RefreshTokenInvalid"] = "RefreshToken không hợp lệ hoặc đã hết hạn",
            ["Auth_TokenRefreshed"] = "Làm mới AccessToken thành công",
            ["Auth_LogoutSuccess"] = "Đăng xuất thành công",
            ["Auth_RegisterSuccess"] = "Đăng ký tài khoản thành công",
            ["Auth_UsernameExists"] = "Tên đăng nhập đã tồn tại trong hệ thống",

            // Học sinh (Student)
            ["Student_ListSuccess"] = "Lấy danh sách học sinh thành công",
            ["Student_DetailSuccess"] = "Lấy thông tin học sinh thành công",
            ["Student_NotFound"] = "Không tìm thấy học sinh với ID {0}",
            ["Student_CreateSuccess"] = "Thêm mới học sinh thành công",
            ["Student_UpdateSuccess"] = "Cập nhật học sinh thành công",
            ["Student_DeleteSuccess"] = "Xóa học sinh thành công",
            ["Student_AssignCourseSuccess"] = "Gán học sinh vào khóa học thành công",
            ["Student_AssignBatchSuccess"] = "Đã gán {0} học sinh vào khóa học thành công",
            ["Student_CourseNotFound"] = "Không tìm thấy khóa học với ID {0}",

            // Điểm danh (Attendance)
            ["Attendance_SaveSuccess"] = "Điểm danh {0} học sinh thành công",
            ["Attendance_GvSuccess"] = "Điểm danh giáo viên thành công",
            ["Attendance_SessionNotFound"] = "Không tìm thấy buổi học với ID {0}",
            ["Attendance_NoStudents"] = "Danh sách học sinh điểm danh trống",

            // Tài chính (Finance)
            ["Finance_ReceiptSuccess"] = "Lập phiếu thu học phí thành công",
            ["Finance_PaymentRecorded"] = "Ghi nhận thanh toán học phí thành công",
            ["Finance_TeacherPaymentSuccess"] = "Thanh toán lương giáo viên thành công",
            ["Finance_CashbookSuccess"] = "Lấy sổ quỹ thu chi thành công",
            ["Finance_ReceiptNotFound"] = "Không tìm thấy phiếu thu học phí với ID {0}",
            ["Finance_StudentNotFound"] = "Không tìm thấy học sinh để thu phí"
        },
        ["en-US"] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // Chung & Hệ thống
            ["Common_Success"] = "Success",
            ["Common_Created"] = "Created successfully",
            ["Common_NotFound"] = "Data not found",
            ["Common_BadRequest"] = "Invalid request payload",
            ["Common_Unauthorized"] = "Authentication is required",
            ["Common_Forbidden"] = "You do not have permission to perform this action",
            ["Common_InternalError"] = "An internal server error occurred",

            // Xác thực (Auth)
            ["Auth_LoginSuccess"] = "Login successful",
            ["Auth_InvalidCredentials"] = "Invalid username or password",
            ["Auth_RequiredUsernamePassword"] = "Username and password are required",
            ["Auth_AccountLocked"] = "Your account has been locked or deactivated",
            ["Auth_RefreshTokenNotFound"] = "Refresh token not found in Cookie",
            ["Auth_RefreshTokenInvalid"] = "Refresh token is invalid or expired",
            ["Auth_TokenRefreshed"] = "Access token refreshed successfully",
            ["Auth_LogoutSuccess"] = "Logged out successfully",
            ["Auth_RegisterSuccess"] = "Registered account successfully",
            ["Auth_UsernameExists"] = "Username already exists in the system",

            // Học sinh (Student)
            ["Student_ListSuccess"] = "Retrieved student list successfully",
            ["Student_DetailSuccess"] = "Retrieved student details successfully",
            ["Student_NotFound"] = "Student with ID {0} not found",
            ["Student_CreateSuccess"] = "Created new student successfully",
            ["Student_UpdateSuccess"] = "Updated student successfully",
            ["Student_DeleteSuccess"] = "Deleted student successfully",
            ["Student_AssignCourseSuccess"] = "Assigned student to course successfully",
            ["Student_AssignBatchSuccess"] = "Successfully assigned {0} students to course",
            ["Student_CourseNotFound"] = "Course with ID {0} not found",

            // Điểm danh (Attendance)
            ["Attendance_SaveSuccess"] = "Recorded attendance for {0} students successfully",
            ["Attendance_GvSuccess"] = "Recorded teacher attendance successfully",
            ["Attendance_SessionNotFound"] = "Class session with ID {0} not found",
            ["Attendance_NoStudents"] = "Attendance student list is empty",

            // Tài chính (Finance)
            ["Finance_ReceiptSuccess"] = "Tuition receipt created successfully",
            ["Finance_PaymentRecorded"] = "Tuition payment recorded successfully",
            ["Finance_TeacherPaymentSuccess"] = "Teacher salary payment created successfully",
            ["Finance_CashbookSuccess"] = "Retrieved cashbook records successfully",
            ["Finance_ReceiptNotFound"] = "Tuition receipt with ID {0} not found",
            ["Finance_StudentNotFound"] = "Student for tuition collection not found"
        }
    };

    public LocalizationService(IHttpContextAccessor? httpContextAccessor = null)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string Get(string key, params object[] args)
    {
        var culture = CurrentCulture;
        if (!Translations.TryGetValue(culture, out var dict) || !dict.TryGetValue(key, out var text))
        {
            if (!Translations[DefaultCulture].TryGetValue(key, out text))
            {
                text = key;
            }
        }

        if (args != null && args.Length > 0)
        {
            try
            {
                return string.Format(text, args);
            }
            catch
            {
                return text;
            }
        }

        return text;
    }

    public string this[string key] => Get(key);

    public string this[string key, params object[] args] => Get(key, args);

    public IDictionary<string, string> GetAllStrings()
    {
        var culture = CurrentCulture;
        if (Translations.TryGetValue(culture, out var dict))
        {
            return new Dictionary<string, string>(dict);
        }
        return new Dictionary<string, string>(Translations[DefaultCulture]);
    }
}
