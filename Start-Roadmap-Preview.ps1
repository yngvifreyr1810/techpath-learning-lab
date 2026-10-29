param([switch]$NoOpen)
$ErrorActionPreference = 'Stop'
$previewPort = 4191
$previewUrl = "http://127.0.0.1:$previewPort"
$previewRoot = $PSScriptRoot
$previewLogs = Join-Path $previewRoot '.techpath-local'
$listener = Get-NetTCPConnection -LocalPort $previewPort -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    try {
        $health = Invoke-RestMethod "$previewUrl/api/health" -TimeoutSec 3
        $learningStatus = Invoke-RestMethod "$previewUrl/api/learning/status" -TimeoutSec 3
        if ($health.app -ne 'techpath' -or $learningStatus.version -ne 1) { throw 'Different service' }
    } catch { throw "Port $previewPort is already used by another or older server. No process was stopped." }
} else {
    New-Item -ItemType Directory -Path $previewLogs -Force | Out-Null
    $previousPort = $env:PORT
    try {
        $env:PORT = [string]$previewPort
        $previewNode = (Get-Command node -ErrorAction Stop).Source
        $previewProcess = Start-Process -FilePath $previewNode -ArgumentList 'server.mjs' -WorkingDirectory $previewRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $previewLogs 'roadmap-preview.stdout.log') -RedirectStandardError (Join-Path $previewLogs 'roadmap-preview.stderr.log')
        $ready = $false
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            Start-Sleep -Milliseconds 250
            if ($previewProcess.HasExited) { throw 'Preview stopped; check .techpath-local/roadmap-preview.stderr.log.' }
            try { $health = Invoke-RestMethod "$previewUrl/api/health" -TimeoutSec 1; $learningStatus = Invoke-RestMethod "$previewUrl/api/learning/status" -TimeoutSec 1; $ready = $health.app -eq 'techpath' -and $learningStatus.version -eq 1 } catch { }
            if ($ready) { break }
        }
        if (-not $ready) { throw 'Preview is not ready yet. No existing connector was stopped.' }
    } finally { $env:PORT = $previousPort }
}
Write-Output "TechPath roadmap preview: $previewUrl/#roadmap"
if (-not $NoOpen) { Start-Process "$previewUrl/#roadmap" }
