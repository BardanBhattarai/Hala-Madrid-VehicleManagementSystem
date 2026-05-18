namespace VehicleManagement.Models
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;

        public static ApiResponse<T> SuccessResponse(T data, string message = "") => new() { IsSuccess = true, Data = data, Message = message };
        public static ApiResponse<T> Fail(string message) => new() { IsSuccess = false, Message = message };
    }

    public class ApiResponse : ApiResponse<object>
    {
        public new static ApiResponse SuccessResponse(object data, string message = "") => new() { IsSuccess = true, Data = data, Message = message };
        public new static ApiResponse Fail(string message) => new() { IsSuccess = false, Message = message };
    }
}
