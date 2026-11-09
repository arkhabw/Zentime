# Zentime - Chrome Web Store Packaging Script (PowerShell)
# Usage: .\package-extension.ps1

Write-Host "🌸 Zentime Packaging Tool (PowerShell)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$rootDir = $PSScriptRoot
$distDir = Join-Path $rootDir "dist"
$tempDir = Join-Path $distDir "zentime-build"
$manifestPath = Join-Path $rootDir "manifest.json"

if (-not (Test-Path $manifestPath)) {
    Write-Error "manifest.json not found!"
    exit 1
}

$manifestJson = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifestJson.version
$zipFileName = "zentime-v$version.zip"
$zipPath = Join-Path $distDir $zipFileName

Write-Host "📦 Extension Name: $($manifestJson.name)"
Write-Host "🏷️  Version:        $version"
Write-Host "🎯 Target Zip:     dist/$zipFileName"

# Run syntax check with node
Write-Host "`n🔎 Validating JavaScript syntax..." -ForegroundColor Yellow
$jsFiles = @("background.js", "popup.js", "blocked.js", "audio.js")
foreach ($js in $jsFiles) {
    $fullPath = Join-Path $rootDir $js
    node --check $fullPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Syntax check failed on $js"
        exit 1
    }
    Write-Host "  ✓ $js syntax valid" -ForegroundColor Green
}

# Clean temp directory
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
New-Item -ItemType Directory -Path $tempDir | Out-Null

$requiredFiles = @(
    "manifest.json",
    "background.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "blocked.html",
    "blocked.css",
    "blocked.js",
    "audio.html",
    "audio.js"
)

$requiredDirs = @("icons", "fonts")

Write-Host "`n📋 Staging files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    Copy-Item (Join-Path $rootDir $file) (Join-Path $tempDir $file)
    Write-Host "  + $file"
}

foreach ($dir in $requiredDirs) {
    Copy-Item (Join-Path $rootDir $dir) (Join-Path $tempDir $dir) -Recurse
    Write-Host "  + $dir/"
}

# Compress
Write-Host "`n🗜️  Compressing into distribution zip..." -ForegroundColor Yellow
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force

# Cleanup temp
Remove-Item -Path $tempDir -Recurse -Force

$zipFile = Get-Item $zipPath
$hash = Get-FileHash $zipPath -Algorithm SHA256

Write-Host "`n✨ Packaging Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Gray
Write-Host "📁 File:   $zipPath"
Write-Host "📊 Size:   $([math]::Round($zipFile.Length / 1KB, 2)) KB"
Write-Host "🔒 SHA256: $($hash.Hash)"
Write-Host "========================================" -ForegroundColor Gray
Write-Host "🚀 Ready to upload to Chrome Developer Dashboard`n" -ForegroundColor Cyan
