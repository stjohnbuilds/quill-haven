# Quill Haven — Windows true site lockdown
# Run AS ADMIN after the regular setup-windows.ps1.
#
#   Open PowerShell AS ADMIN (right-click PowerShell -> Run as administrator)
#   Then paste:
#
#   irm https://stjohnbuilds.github.io/quill-haven/setup-windows-lockdown.ps1 | iex
#
# What it does (beyond the basic kiosk):
#   - Writes Edge URLBlocklist = ["*"] + URLAllowlist (Quill Haven + the 3 writing apps).
#   - Disables Edge incognito + developer tools + the password manager.
#   This is the REAL wall — visiting any other site shows an Edge block page.
#
# To UNDO later: run this script with -Remove.

[CmdletBinding()]
param(
  [switch]$Remove
)

$ErrorActionPreference = 'Stop'

function Say($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }
function Die($msg) { Write-Host $msg -ForegroundColor Red; exit 1 }

# Must be admin
$me = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$p  = New-Object System.Security.Principal.WindowsPrincipal($me)
if (-not $p.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Die "This script needs to run as Administrator. Right-click PowerShell -> Run as administrator, then re-run."
}

$EdgeKey      = 'HKLM:\SOFTWARE\Policies\Microsoft\Edge'
$BlockKey     = "$EdgeKey\URLBlocklist"
$AllowKey     = "$EdgeKey\URLAllowlist"

if ($Remove) {
  Say "Removing Quill Haven Edge lockdown policies"
  if (Test-Path $BlockKey) { Remove-Item -Path $BlockKey -Recurse -Force }
  if (Test-Path $AllowKey) { Remove-Item -Path $AllowKey -Recurse -Force }
  foreach ($name in 'IncognitoModeAvailability','DeveloperToolsAvailability','PasswordManagerEnabled','TranslateEnabled') {
    if (Get-ItemProperty -Path $EdgeKey -Name $name -ErrorAction SilentlyContinue) {
      Remove-ItemProperty -Path $EdgeKey -Name $name -ErrorAction SilentlyContinue
    }
  }
  Write-Host ""
  Write-Host "Edge lockdown removed. You'll need to restart Edge for the change to take effect." -ForegroundColor Green
  exit 0
}

Say "Creating Edge policy keys"
New-Item -Path $EdgeKey  -Force | Out-Null
New-Item -Path $BlockKey -Force | Out-Null
New-Item -Path $AllowKey -Force | Out-Null

# URLBlocklist: a single "*" wildcard means "block everything by default"
Say "Block-by-default rule"
New-ItemProperty -Path $BlockKey -Name '1' -Value '*' -PropertyType String -Force | Out-Null

# URLAllowlist: only these load
Say "Allow-list (Quill Haven + the writing apps)"
$allow = @(
  'stjohnbuilds.github.io',
  'raw.githubusercontent.com',
  'accounts.google.com',
  'docs.google.com',
  'drive.google.com',
  'www.google.com',
  'ssl.google.com',
  '.googleusercontent.com',
  '.gstatic.com',
  '.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'app.dabblewriter.com',
  'dabblewriter.com',
  'typingandtomes.vercel.app',
  'vercel-scripts.com',
  'vercel.live'
)
for ($i = 0; $i -lt $allow.Count; $i++) {
  New-ItemProperty -Path $AllowKey -Name ($i + 1).ToString() -Value $allow[$i] -PropertyType String -Force | Out-Null
}

Say "Locking down distractions in Edge itself"
# IncognitoModeAvailability: 1 = Disabled
New-ItemProperty -Path $EdgeKey -Name 'IncognitoModeAvailability' -Value 1 -PropertyType DWord -Force | Out-Null
# DeveloperToolsAvailability: 2 = Disabled
New-ItemProperty -Path $EdgeKey -Name 'DeveloperToolsAvailability' -Value 2 -PropertyType DWord -Force | Out-Null
# Disable Edge's password manager nags / translate nags
New-ItemProperty -Path $EdgeKey -Name 'PasswordManagerEnabled' -Value 0 -PropertyType DWord -Force | Out-Null
New-ItemProperty -Path $EdgeKey -Name 'TranslateEnabled' -Value 0 -PropertyType DWord -Force | Out-Null

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " Quill Haven Edge lockdown applied."             -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Restart Edge (and any open Quill Haven kiosk) for the policy to take effect."
Write-Host ""
Write-Host "To undo later: re-run this script with -Remove,"
Write-Host "  irm https://stjohnbuilds.github.io/quill-haven/setup-windows-lockdown.ps1 -OutFile lock.ps1; .\lock.ps1 -Remove"
Write-Host ""
