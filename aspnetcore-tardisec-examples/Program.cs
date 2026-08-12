using System.Text.Json.Nodes;
using Tardisec;

// Demo app, wired the same way you would wire it into your own ASP.NET Core app.
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Parsed once at startup, not per request; the file only changes via the sync workflow.
var manifest = JsonNode.Parse(
    File.ReadAllText(Path.Combine(builder.Environment.ContentRootPath, ".tardisec.json")))!;
var headers = manifest["http"]!["headers"]!.AsObject()
    .ToDictionary(property => property.Key, property => property.Value!.GetValue<string>());

// First in the pipeline, so it wraps everything after it: static files, the exception handler's
// error page, and endpoints alike. Register it later and whatever short-circuits before it
// answers without the headers.
app.UseMiddleware<TardisecHeadersMiddleware>(headers);

app.MapGet("/", () => Results.Content("<!doctype html><title>ok</title>", "text/html"));

app.Run();
