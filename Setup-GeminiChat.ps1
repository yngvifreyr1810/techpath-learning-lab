param([switch]$LoginOnly)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$chatRuntime = Join-Path $PSScriptRoot '.techpath-local\gemini-runtime'
$chatPackage = Join-Path $chatRuntime 'node_modules\@google\gemini-cli\package.json'
if (-not (Test-Path -LiteralPath $chatPackage)) {
    if ($LoginOnly) { throw 'Run Setup-GeminiChat.cmd once to install Gemini CLI.' }
    & npm.cmd install --prefix $chatRuntime --no-audit --no-fund '@google/gemini-cli@0.65.0'
    if ($LASTEXITCODE -ne 0) { throw 'Gemini CLI installation failed.' }
}
$chatHome = Join-Path $PSScriptRoot '.techpath-local\gemini-chat\home'
$chatWork = Join-Path $PSScriptRoot '.techpath-local\gemini-chat\work'
New-Item -ItemType Directory -Path $chatHome,$chatWork -Force | Out-Null
& node --input-type=module -e "import('./gemini-chat.mjs').then(m=>m.prepareGeminiChat()).then(()=>{})"
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare personal chat settings.' }
$env:GEMINI_CLI_HOME = $chatHome
$env:GEMINI_SYSTEM_MD = Join-Path $chatHome 'personal-system.md'
Remove-Item Env:GEMINI_API_KEY,Env:GOOGLE_API_KEY,Env:GOOGLE_GENAI_USE_VERTEXAI,Env:GOOGLE_APPLICATION_CREDENTIALS -ErrorAction SilentlyContinue
$chatMeta = Get-Content -LiteralPath $chatPackage -Raw | ConvertFrom-Json
$chatBin = Join-Path (Split-Path -Parent $chatPackage) $chatMeta.bin.gemini
Set-Location -LiteralPath $chatWork
Write-Host 'Sign in with Google. Use the account with your Google AI plan.'
Write-Host 'After sign-in, close this window and select Gemini CLI in TechPath.'
& node $chatBin --extensions none
