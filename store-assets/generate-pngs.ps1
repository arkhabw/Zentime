# Helper script to re-render all store PNG assets using Chromium/Edge headless
# Usage: .\generate-pngs.ps1

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

if (-not (Test-Path $edgePath)) {
    Write-Error "Microsoft Edge executable not found. Make sure Edge or Chrome is installed."
    exit 1
}

$assets = @(
  @{ svg = "promo-small-440x280.svg"; png = "promo-small-440x280.png"; w = 440; h = 280 },
  @{ svg = "marquee-1400x560.svg"; png = "marquee-1400x560.png"; w = 1400; h = 560 },
  @{ svg = "screenshot-1-timer.svg"; png = "screenshot-1-timer.png"; w = 1280; h = 800 },
  @{ svg = "screenshot-2-blocker.svg"; png = "screenshot-2-blocker.png"; w = 1280; h = 800 },
  @{ svg = "screenshot-3-insights.svg"; png = "screenshot-3-insights.png"; w = 1280; h = 800 },
  @{ svg = "screenshot-4-settings.svg"; png = "screenshot-4-settings.png"; w = 1280; h = 800 }
)

$baseDir = $PSScriptRoot

Write-Host "🎨 Generating high-resolution PNG assets from SVGs..." -ForegroundColor Cyan

foreach ($a in $assets) {
    $svgFile = Join-Path $baseDir $a.svg
    $pngFile = Join-Path $baseDir $a.png
    $url = "file:///" + $svgFile.Replace("\", "/")
    Write-Host "  -> Rendering $($a.png) ($($a.w)x$($a.h))..." -ForegroundColor Yellow
    Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--window-size=$($a.w),$($a.h)", "--hide-scrollbars", "--screenshot=$pngFile", $url -Wait -NoNewWindow
}

Write-Host "`n✨ All 6 PNG assets successfully rendered!" -ForegroundColor Green
Get-ChildItem -Path $baseDir -Filter "*.png" | Select-Object Name, Length
