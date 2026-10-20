namespace dotnet_backend.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public int StatusCode { get; set; }
    public string? Code { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Thành công")
    {
        return new ApiResponse<T>
        {
            Success = true,
            StatusCode = 200,
            Code = "THANH_CONG",
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Created(T data, string message = "Tạo mới thành công")
    {
        return new ApiResponse<T>
        {
            Success = true,
            StatusCode = 201,
            Code = "TAO_MOI_THANH_CONG",
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Fail(string message, int statusCode = 400, IDictionary<string, string[]>? errors = null, string? code = null)
    {
        string defaultCode = statusCode switch
        {
            400 => "THAM_SO_KHONG_HOP_LE",
            401 => "THIEU_XAC_THUC",
            403 => "TU_CHOI_TRUY_CAP",
            404 => "KHONG_TIM_THAY",
            409 => "DU_LIEU_XUNG_DOT",
            _ => "LOI_HE_THONG"
        };

        return new ApiResponse<T>
        {
            Success = false,
            StatusCode = statusCode,
            Code = code ?? defaultCode,
            Message = message,
            Errors = errors
        };
    }
}
