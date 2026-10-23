param([switch]$NoOpen)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskLogs = Join-Path $PSScriptRoot '.techpath-local'
New-Item -ItemType Directory -Path $taskLogs -Force | Out-Null
function Test-TechPath {
    try {
        $taskHealth = Invoke-RestMethod -Uri 'http://127.0.0.1:4173/api/health' -TimeoutSec 2
        return ($taskHealth.app -eq 'techpath' -and $taskHealth.protocol -eq 1)
    } catch { return $false }
}
$taskMutex = New-Object System.Threading.Mutex($false, 'Local\TechPathConnector4173')
$taskLocked = $false
try {
    $taskLocked = $taskMutex.WaitOne(30000)
    if (-not $taskLocked) { throw 'TechPath startup is busy. Try again shortly.' }
    if (-not (Test-TechPath)) {
        $taskListener = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
        if ($taskListener) { throw 'Port 4173 is already used by another or older server. Restart that TechPath connector first.' }
        $taskNode = Get-Command node.exe -ErrorAction SilentlyContinue
        $taskNodeExe = if ($taskNode) { $taskNode.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
        if (-not (Test-Path -LiteralPath $taskNodeExe)) { throw 'Node.js 20+ was not found. Install Node.js or open Codex once, then try again.' }
        $taskCodex = Get-Command codex.exe -ErrorAction SilentlyContinue
        if ($taskCodex) { $env:TECHPATH_CODEX_BIN = $taskCodex.Source }
        else {
            $taskBinRoot = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
            if (Test-Path -LiteralPath $taskBinRoot) {
                $taskFile = Get-ChildItem -LiteralPath $taskBinRoot -Filter codex.exe -File -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                if ($taskFile) { $env:TECHPATH_CODEX_BIN = $taskFile.FullName }
            }
        }
        $taskProcess = Start-Process -FilePath $taskNodeExe -ArgumentList @('server.mjs') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskLogs 'connector.stdout.log') -RedirectStandardError (Join-Path $taskLogs 'connector.stderr.log') -PassThru
        $taskReady = $false
        for ($taskAttempt = 0; $taskAttempt -lt 30; $taskAttempt++) {
            if (Test-TechPath) { $taskReady = $true; break }
            $taskProcess.Refresh()
            if ($taskProcess.HasExited) { throw 'TechPath stopped during startup. See .techpath-local\connector.stderr.log.' }
            Start-Sleep -Milliseconds 500
        }
        if (-not $taskReady) { throw 'Port 4173 is not ready yet. See .techpath-local\connector.stderr.log.' }
    }
    Write-Host 'TechPath connector is ready: http://127.0.0.1:4173'
    if (-not $NoOpen) { Start-Process 'http://127.0.0.1:4173/#lesson/sql-proc' }
} catch {
    $_.Exception.Message | Add-Content -LiteralPath (Join-Path $taskLogs 'startup-error.log')
    throw
} finally {
    if ($taskLocked) { $taskMutex.ReleaseMutex() }
    $taskMutex.Dispose()
}
