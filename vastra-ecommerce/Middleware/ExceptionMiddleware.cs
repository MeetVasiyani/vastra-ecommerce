using System.Text.Json;

namespace EcommerceApplication.Middleware
{
	public class ExceptionMiddleware
	{
		private readonly RequestDelegate _next;
		private readonly ILogger<ExceptionMiddleware> _logger;
		private readonly IHostEnvironment _environment;

		public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment environment)
		{
			_next = next;
			_logger = logger;
			_environment = environment;
		}

		public async Task InvokeAsync(HttpContext context)
		{
			try
			{
				await _next(context);
			}
			catch (Exception exception)
			{
				await HandleExceptionAsync(context, exception);
			}
		}

		private async Task HandleExceptionAsync(HttpContext context, Exception exception)
		{
			if (context.Response.HasStarted)
			{
				throw exception;
			}

			var statusCode = exception switch
			{
				ArgumentException => StatusCodes.Status400BadRequest,
				KeyNotFoundException => StatusCodes.Status404NotFound,
				UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
				_ => StatusCodes.Status500InternalServerError
			};

			_logger.LogError(exception, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);

			context.Response.Clear();
			context.Response.StatusCode = statusCode;
			context.Response.ContentType = "application/json";

			var payload = new
			{
				statusCode,
				message = _environment.IsDevelopment() || statusCode != StatusCodes.Status500InternalServerError
					? exception.Message
					: "An unexpected error occurred.",
				traceId = context.TraceIdentifier
			};

			await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
		}
	}
}
