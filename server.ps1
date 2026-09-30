param(
    [int]$Port = 3000,
    [string]$Path = "c:\vrunda\watch"
)

$listener = New-Object System.Net.HttpListener
$prefixes = @(
    "http://localhost:$Port/",
    "http://127.0.0.1:$Port/"
)

foreach ($prefix in $prefixes) {
    try {
        $listener.Prefixes.Add($prefix)
    } catch {
        Write-Warning "Failed to register prefix $prefix : $_"
    }
}

try {
    $listener.Start()
    Write-Host "Server running at:"
    foreach ($prefix in $prefixes) {
        Write-Host "  -> $prefix"
    }
    Write-Host "Serving files from $Path"
} catch {
    Write-Error "Failed to start listener on port $Port : $_"
    exit 1
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".png"   = "image/png"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".mp3"   = "audio/mpeg"
    ".wav"   = "audio/wav"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $method = $request.HttpMethod
        $rawPath = $request.Url.LocalPath.TrimStart('/')

        # Handle CORS
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "*")

        if ($method -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        # Normalize relative path (handle empty or /watch/ prefix)
        $urlPath = $rawPath
        if ([string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "index.html"
        }
        if ($urlPath.StartsWith("watch/", [System.StringComparison]::OrdinalIgnoreCase)) {
            $urlPath = $urlPath.Substring(6)
        }
        if ([string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "index.html"
        }

        if ($urlPath -eq "favicon.ico") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $normalizedPath = [System.IO.Path]::Combine($Path, $urlPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))
        $fullPath = [System.IO.Path]::GetFullPath($normalizedPath)
        $rootFullPath = [System.IO.Path]::GetFullPath($Path)

        if ($fullPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase) -and [System.IO.File]::Exists($fullPath)) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.StatusCode = 200

            if ($method -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            Write-Host "200 $method - $urlPath ($($bytes.Length) bytes)"
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            if ($method -ne "HEAD") {
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
            Write-Warning "404 $method - $urlPath"
        }
    } catch {
        Write-Warning "Request error: $_"
    } finally {
        if ($null -ne $response) {
            try { $response.Close() } catch {}
        }
    }
}
