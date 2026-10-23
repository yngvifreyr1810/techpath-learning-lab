$ErrorActionPreference = 'Stop'
$chatSetup = Join-Path $PSScriptRoot 'Setup-GeminiChat.ps1'
Start-Process -FilePath powershell.exe -ArgumentList @('-NoExit','-NoProfile','-ExecutionPolicy','Bypass','-File',('"' + $chatSetup + '"'),'-LoginOnly') -WorkingDirectory $PSScriptRoot -WindowStyle Normal
