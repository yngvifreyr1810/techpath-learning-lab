param([switch]$Disable, [switch]$NoStart)
$ErrorActionPreference = 'Stop'
$taskStartup = [Environment]::GetFolderPath('Startup')
$taskLink = Join-Path $taskStartup 'TechPath Connector.lnk'
$taskLauncher = Join-Path $PSScriptRoot 'Start-TechPath.ps1'
$taskShell = New-Object -ComObject WScript.Shell
if (Test-Path -LiteralPath $taskLink) {
    $taskExisting = $taskShell.CreateShortcut($taskLink)
    if ($taskExisting.Arguments -notlike ('*' + $taskLauncher + '*')) { throw 'The existing startup shortcut belongs to a different TechPath folder. Inspect it before replacing.' }
}
if ($Disable) {
    if (Test-Path -LiteralPath $taskLink) { Remove-Item -LiteralPath $taskLink }
    Write-Host 'TechPath automatic startup disabled.'
    exit 0
}
if (-not (Test-Path -LiteralPath $taskLauncher)) { throw 'Start-TechPath.ps1 is missing.' }
New-Item -ItemType Directory -Path $taskStartup -Force | Out-Null
$taskShortcut = $taskShell.CreateShortcut($taskLink)
$taskShortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$taskShortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $taskLauncher + '" -NoOpen'
$taskShortcut.WorkingDirectory = $PSScriptRoot
$taskShortcut.WindowStyle = 7
$taskShortcut.Description = 'Start the TechPath tutor/SQL connector on port 4173 at Windows sign-in.'
$taskShortcut.Save()
Write-Host 'TechPath will start in the background when you sign in to Windows.'
if (-not $NoStart) { & $taskLauncher -NoOpen }
