<#
.SYNOPSIS
    Starts the AlgoForge Visual Data Structure & Algorithm Playground dev server.
.DESCRIPTION
    Verifies dependencies, launches the Vite dev server on http://localhost:3000,
    and opens the default web browser.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

# Navigate to project root directory
Set-Location -Path $PSScriptRoot

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor DarkYellow
Write-Host "    ALGOFORGE // HARDWARE DSA LAB                                 " -ForegroundColor DarkYellow
Write-Host "    Matte Carbon & International Orange (React 19 + Tailwind v4)  " -ForegroundColor DarkGray
Write-Host "  ================================================================" -ForegroundColor DarkYellow
Write-Host ""

# 1. Verify dependencies
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "  [1/2] Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [!] Dependency installation failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    Write-Host "  [1/2] Dependencies found." -ForegroundColor Green
}

# 2. Launch browser and dev server
Write-Host "  [2/2] Starting Vite development server on http://localhost:3000..." -ForegroundColor Cyan
Write-Host "        Press Ctrl+C to terminate the server at any time." -ForegroundColor DarkGray
Write-Host ""

# Open default browser to playground
Start-Process "http://localhost:3000"

# Start Vite dev server
npm run dev

