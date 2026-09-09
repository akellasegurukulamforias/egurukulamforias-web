$ErrorActionPreference = "Stop"

$workspace = "d:\e-Gurukulam for IAS"
$staging = Join-Path $env:TEMP "egurukulam-source-staging"
$destZip = Join-Path $workspace "egurukulam-for-ias-source.zip"
$artifactDest = "C:\Users\bhanu\.gemini\antigravity\brain\113a656c-ee5f-45f4-b667-b4a7a32283c4\egurukulam-for-ias-source.zip"

Write-Host "Cleaning previous staging & zip files..."
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
if (Test-Path $destZip) { Remove-Item -Force $destZip }

New-Item -ItemType Directory -Path $staging | Out-Null

$itemsToInclude = @(
    "src",
    "public",
    "google-apps-script",
    "scripts",
    ".github",
    "index.html",
    "package.json",
    "package-lock.json",
    "tailwind.config.js",
    "postcss.config.js",
    "vite.config.js",
    "vercel.json",
    ".gitignore",
    ".env.example",
    "PROJECT_RULES.md"
)

Write-Host "Copying repository assets to staging..."
foreach ($item in $itemsToInclude) {
    $srcPath = Join-Path $workspace $item
    if (Test-Path $srcPath) {
        $target = Join-Path $staging $item
        Copy-Item -Path $srcPath -Destination $target -Recurse -Force
        Write-Host "  [+] Copied: $item"
    } else {
        Write-Host "  [-] Skipped (not found): $item"
    }
}

Write-Host "Compressing staging folder to ZIP archive..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $destZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Copying ZIP to artifact folder for one-click access..."
Copy-Item -Path $destZip -Destination $artifactDest -Force

Write-Host "Cleaning up staging directory..."
Remove-Item -Recurse -Force $staging

$zipFile = Get-Item $destZip
$sizeMB = [math]::Round($zipFile.Length / 1MB, 2)
Write-Host "SUCCESS! Archive created successfully:"
Write-Host "  Workspace ZIP: $destZip ($sizeMB MB)"
Write-Host "  Artifact ZIP:  $artifactDest ($sizeMB MB)"
