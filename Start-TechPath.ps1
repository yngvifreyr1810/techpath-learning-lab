$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskNode = Get-Command node -ErrorAction SilentlyContinue
$taskNodeExe = if ($taskNode) { $taskNode.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $taskNodeExe)) { Write-Host 'Install Node.js 20+ first: https://nodejs.org'; Read-Host 'Press Enter'; exit 1 }

$taskCodex = Get-Command codex -ErrorAction SilentlyContinue
if (-not $taskCodex) {
    $taskBinRoot = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
    if (Test-Path -LiteralPath $taskBinRoot) {
        $taskCodexFile = Get-ChildItem -LiteralPath $taskBinRoot -Filter codex.exe -File -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($taskCodexFile) { $env:TECHPATH_CODEX_BIN = $taskCodexFile.FullName }
    }
} else { $env:TECHPATH_CODEX_BIN = $taskCodex.Source }

$routerListening = Get-NetTCPConnection -LocalPort 20128 -State Listen -ErrorAction SilentlyContinue
if ($routerListening) {
    Write-Host '9Router is running on port 20128 (Gemini / Antigravity supported).'
}
if ($env:TECHPATH_CODEX_BIN) {
    Write-Host "Codex found at: $($env:TECHPATH_CODEX_BIN)"
} elseif (-not $routerListening) {
    Write-Host 'Note: Neither Codex CLI nor 9Router was detected.'
    Write-Host 'Start 9Router for Gemini or install Codex CLI for ChatGPT tutor.'
}

$taskPortBusy = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if (-not $taskPortBusy) {
    Start-Process -FilePath $taskNodeExe -ArgumentList @('server.mjs') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
}
Start-Process 'http://127.0.0.1:4173/#lesson/sql-proc'
Write-Host 'TechPath connector started. In TechPath, click Nho review.'
Write-Host 'Open at: http://127.0.0.1:4173'
