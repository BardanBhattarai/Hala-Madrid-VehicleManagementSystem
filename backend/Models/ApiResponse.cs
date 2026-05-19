namespace VehicleManagement.Models
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();
        public int StatusCode { get; set; }

        public static ApiResponse<T> SuccessResponse(T data, string message = "") => new()
        {
            IsSuccess = true,
            Data = data,
            Message = message,
            StatusCode = 200
        };

        public static ApiResponse<T> Fail(string message) => new()
        {
            IsSuccess = false,
            Message = message,
            StatusCode = 400
        };

        public static ApiResponse<T> Fail(string message, List<string> errors, int statusCode = 400) => new()
        {
            IsSuccess = false,
            Message = message,
            Errors = errors,
            StatusCode = statusCode
        };
    }

    public class ApiResponse : ApiResponse<object>
    {
        public new static ApiResponse SuccessResponse(object data, string message = "") => new()
        {
            IsSuccess = true,
            Data = data,
            Message = message,
            StatusCode = 200
        };

        public new static ApiResponse Fail(string message) => new()
        {
            IsSuccess = false,
            Message = message,
            StatusCode = 400
        };

        public new static ApiResponse Fail(string message, List<string> errors, int statusCode = 400) => new()
        {
            IsSuccess = false,
            Message = message,
            Errors = errors,
            StatusCode = statusCode
        };
    }
}
