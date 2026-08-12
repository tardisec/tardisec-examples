namespace Tardisec;

// ASP.NET Core middleware that layers .tardisec.json's http.headers onto every response,
// skipping any the app already set. Takes the parsed map rather than reading the file, so this
// class is copy-paste portable and the app decides where .tardisec.json lives.
public sealed class TardisecHeadersMiddleware(
    RequestDelegate next,
    IReadOnlyDictionary<string, string> headers)
{
    public Task InvokeAsync(HttpContext context)
    {
        // OnStarting, not after `await next`: once the first byte is written the response has
        // started, Headers is read-only, and a write throws InvalidOperationException. This
        // callback runs at that boundary, after the endpoint has set its own headers and before
        // anything is flushed, which is the only point where both halves are true.
        context.Response.OnStarting(() =>
        {
            foreach (var (name, value) in headers)
            {
                if (!context.Response.Headers.ContainsKey(name))
                {
                    context.Response.Headers[name] = value;
                }
            }

            return Task.CompletedTask;
        });

        return next(context);
    }
}
