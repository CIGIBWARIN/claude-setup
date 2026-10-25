# One-step Windows bootstrap: installs anything missing (Git, Node.js, Claude Code), then runs setup.mjs.
#   irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1 | iex
# With options (e.g. machine-wide):
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1))) --user
# Works in Windows PowerShell 5.1 and PowerShell 7.
$ErrorActionPreference = 'Stop'
$setupArgs = $args

function Test-Command($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Update-SessionPath {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
                (Join-Path $env:USERPROFILE '.local\bin')
}

function Install-WithWinget($id, $label) {
    if (-not (Test-Command 'winget')) { throw "$label is missing and winget isn't available. Install $label manually, then re-run." }
    Write-Host "Installing $label..."
    winget install --id $id --silent --accept-package-agreements --accept-source-agreements
    Update-SessionPath
}

Update-SessionPath
# Claude Code on Windows needs Git for Windows (it uses Git Bash).
if (-not (Test-Command 'git')) { Install-WithWinget 'Git.Git' 'Git' }
if (-not (Test-Command 'node')) { Install-WithWinget 'OpenJS.NodeJS.LTS' 'Node.js' }
if (-not (Test-Command 'claude')) {
    Write-Host 'Installing Claude Code...'
    Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
    Update-SessionPath
}

$tmp = Join-Path $env:TEMP ('claude-setup-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
    $zip = Join-Path $tmp 'repo.zip'
    Invoke-WebRequest -UseBasicParsing https://codeload.github.com/CIGIBWARIN/claude-setup/zip/refs/heads/main -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $tmp
    & node (Join-Path $tmp 'claude-setup-main\setup.mjs') @setupArgs
    if ($LASTEXITCODE) { throw "setup.mjs failed with exit code $LASTEXITCODE" }
} finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host 'If Claude Code was just installed, open a new terminal and run "claude" once to sign in.'
