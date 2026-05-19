using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VehicleManagement.Models;

namespace VehicleManagement.Middleware;

/// <summary>
/// Centralized exception handling middleware.
/// Catches all unhandled exceptions thrown by controllers/services and
/// returns a standardized <see cref="ApiResponse"/> error payload.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errors) = exception switch
        {
            // ── Validation errors (DTO / business rule) ──────────────
            ValidationException validationEx =>
                (HttpStatusCode.BadRequest,
                 validationEx.Message,
                 ExtractValidationErrors(validationEx)),

            // ── Entity not found ─────────────────────────────────────
            KeyNotFoundException notFoundEx =>
                (HttpStatusCode.NotFound,
                 notFoundEx.Message,
                 new List<string>()),

            // ── Unauthorized access ──────────────────────────────────
            UnauthorizedAccessException authEx =>
                (HttpStatusCode.Unauthorized,
                 authEx.Message.Length > 0 ? authEx.Message : "Unauthorized access.",
                 new List<string>()),

            // ── Business logic conflicts ─────────────────────────────
            InvalidOperationException opEx =>
                (HttpStatusCode.Conflict,
                 opEx.Message,
                 new List<string>()),

            // ── Database constraint violations ───────────────────────
            DbUpdateException dbEx =>
                (ParseDbStatusCode(dbEx),
                 ParseDbMessage(dbEx),
                 new List<string>()),

            // ── SMTP / email errors ──────────────────────────────────
            MailKit.Net.Smtp.SmtpCommandException smtpEx =>
                (HttpStatusCode.BadGateway,
                 "Email delivery failed. Please try again later.",
                 new List<string> { smtpEx.Message }),

            MailKit.Net.Smtp.SmtpProtocolException smtpProtoEx =>
                (HttpStatusCode.BadGateway,
                 "Email service is currently unavailable.",
                 new List<string> { smtpProtoEx.Message }),

            // ── Argument errors ──────────────────────────────────────
            ArgumentException argEx =>
                (HttpStatusCode.BadRequest,
                 argEx.Message,
                 new List<string>()),

            // ── Catch-all ────────────────────────────────────────────
            _ =>
                (HttpStatusCode.InternalServerError,
                 "An unexpected error occurred. Please try again later.",
                 new List<string>())
        };

        // ── Logging ──────────────────────────────────────────────────
        var logLevel = statusCode switch
        {
            HttpStatusCode.InternalServerError => LogLevel.Error,
            HttpStatusCode.BadGateway => LogLevel.Error,
            HttpStatusCode.NotFound => LogLevel.Warning,
            HttpStatusCode.BadRequest => LogLevel.Warning,
            _ => LogLevel.Warning
        };

        _logger.Log(logLevel, exception,
            "HTTP {StatusCode} — {Method} {Path}: {Message}",
            (int)statusCode, context.Request.Method, context.Request.Path, exception.Message);

        // ── Build response ───────────────────────────────────────────
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ApiErrorResponse
        {
            IsSuccess = false,
            Message = message,
            Errors = _env.IsDevelopment() ? errors : new List<string>(),
            StatusCode = (int)statusCode
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(json);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static List<string> ExtractValidationErrors(ValidationException ex)
    {
        if (ex.ValidationResult?.ErrorMessage is not null)
            return new List<string> { ex.ValidationResult.ErrorMessage };

        return new List<string> { ex.Message };
    }

    private static HttpStatusCode ParseDbStatusCode(DbUpdateException ex)
    {
        var inner = ex.InnerException?.Message?.ToLowerInvariant() ?? "";
        if (inner.Contains("duplicate") || inner.Contains("unique"))
            return HttpStatusCode.Conflict;
        if (inner.Contains("foreign key") || inner.Contains("reference"))
            return HttpStatusCode.BadRequest;
        if (inner.Contains("not null") || inner.Contains("null value"))
            return HttpStatusCode.BadRequest;

        return HttpStatusCode.InternalServerError;
    }

    private static string ParseDbMessage(DbUpdateException ex)
    {
        var inner = ex.InnerException?.Message?.ToLowerInvariant() ?? "";
        if (inner.Contains("duplicate") || inner.Contains("unique"))
            return "A record with the same unique value already exists.";
        if (inner.Contains("foreign key") || inner.Contains("reference"))
            return "Operation failed: a referenced record does not exist or is still in use.";
        if (inner.Contains("not null") || inner.Contains("null value"))
            return "A required field was missing or empty.";

        return "A database error occurred while processing your request.";
    }
}

/// <summary>
/// Standardized error response shape returned by the exception middleware.
/// </summary>
public class ApiErrorResponse
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
    public int StatusCode { get; set; }
}
