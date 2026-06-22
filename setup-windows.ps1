# Quill Haven — Windows kiosk setup
# Run AFTER installing Quill Haven as a PWA in Microsoft Edge.
#
#   irm https://stjohnbuilds.github.io/quill-haven/setup-windows.ps1 | iex
#
# What it does:
#   1. Drops a .cmd into the user's Startup folder that launches Edge in
#      fullscreen kiosk mode pointed at Quill Haven on every login.
#   2. Disables Edge's first-run welcome / sign-in nags.
#   3. Prints the few manual steps you still need to do (auto-login,
#      taskbar autohide).
# Does NOT require admin. Does NOT modify the registry.

$ErrorActionPreference = 'Stop'
$Url = 'https://stjohnbuilds.github.io/quill-haven/'

function Say($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }

Say "Locating Microsoft Edge"
$edge = $null
foreach ($p in @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
  "${env:LocalAppData}\Microsoft\Edge\Application\msedge.exe"
)) {
  if (Test-Path $p) { $edge = $p; break }
}
if (-not $edge) {
  Write-Host "Could not find Microsoft Edge. Install it from microsoft.com/edge and re-run this script." -ForegroundColor Red
  exit 1
}
Write-Host "  Found: $edge"

Say "Writing the Quill Haven launcher"
$startup = [Environment]::GetFolderPath('Startup')
$cmdPath = Join-Path $startup 'QuillHaven.cmd'
@"
@echo off
start "" "$edge" --kiosk "$Url" --edge-kiosk-type=fullscreen --no-first-run --noerrdialogs --disable-features=TranslateUI --disable-pinch --overscroll-history-navigation=0
"@ | Out-File -FilePath $cmdPath -Encoding ASCII -Force
Write-Host "  Wrote: $cmdPath"

Say "Pre-warming Quill Haven so it works offline"
try {
  Start-Process -FilePath $edge -ArgumentList '--headless','--disable-gpu',$Url -WindowStyle Hidden -PassThru | Out-Null
  Start-Sleep -Seconds 6
  Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process -Force -ErrorAction SilentlyContinue
} catch {}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Quill Haven kiosk launcher installed."  -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two manual steps still to do (one-time):"
Write-Host "  1. Auto sign-in: press Win+R, type 'netplwiz', untick"
Write-Host "     'Users must enter a user name and password'."
Write-Host "  2. Hide taskbar: right-click the taskbar -> Taskbar"
Write-Host "     settings -> turn on 'Automatically hide the taskbar'."
Write-Host ""
Write-Host "Then sign out and back in. Quill Haven opens fullscreen."
Write-Host ""
Write-Host "To turn this off later: delete '$cmdPath'."
Write-Host ""
