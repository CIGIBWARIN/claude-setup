# Applies this repo's Claude Code setup to the current Windows user.
# Safe to re-run: existing copies are backed up to ~/.claude/backups before being replaced.
param(
    [switch]$SkipTools,    # don't install Node/Python/npm language servers
    [switch]$SkipPlugins   # don't install plugins
)
$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$claudeDir = Join-Path $env:USERPROFILE '.claude'

function Read-List($name) {
    Get-Content (Join-Path $repo $name) | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }
}

function Test-Command($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Update-SessionPath {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}

if (-not (Test-Command 'claude')) { throw 'Claude Code CLI not found. Install Claude Code first, then re-run.' }

# --- Tools -----------------------------------------------------------------
if (-not $SkipTools) {
    if (-not (Test-Command 'node')) {
        Write-Host 'Installing Node.js LTS...'
        winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        Update-SessionPath
    }
    # The Microsoft Store "python" stub doesn't count; security-guidance needs a real install.
    $hasPython = $false
    try { $hasPython = ((& python -c "import sys; print(sys.version_info >= (3, 10))" 2>$null) -eq 'True') } catch {}
    if (-not $hasPython) {
        Write-Host 'Installing Python 3.13...'
        winget install --id Python.Python.3.13 --scope user --silent --accept-package-agreements --accept-source-agreements
        Update-SessionPath
    }
    $npmPackages = @(Read-List 'npm-globals.txt')
    if ($npmPackages) {
        Write-Host "Installing npm globals: $($npmPackages -join ', ')"
        npm install -g @npmPackages
    }
}

# --- Agents, commands, rules, skills ----------------------------------------
$backup = Join-Path $claudeDir ("backups\claude-setup-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
foreach ($rel in Read-List 'managed-paths.txt') {
    $src = Join-Path $repo "home\$rel"
    $dst = Join-Path $claudeDir $rel
    if (-not (Test-Path $src)) { Write-Warning "Missing in repo: $rel"; continue }
    if (Test-Path $dst) {
        $bak = Join-Path $backup $rel
        New-Item -ItemType Directory -Force (Split-Path $bak) | Out-Null
        Move-Item -LiteralPath $dst -Destination $bak
    }
    New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
    Copy-Item -LiteralPath $src -Destination $dst -Recurse
}
Write-Host "Copied $(@(Read-List 'managed-paths.txt').Count) items into $claudeDir"
if (Test-Path $backup) { Write-Host "Previous versions backed up to $backup" }

# --- Plugins ----------------------------------------------------------------
if (-not $SkipPlugins) {
    $marketplaces = (claude plugin marketplace list 2>$null) -join "`n"
    if ($marketplaces -notmatch 'claude-plugins-official') {
        claude plugin marketplace add anthropics/claude-plugins-official
    } else {
        claude plugin marketplace update claude-plugins-official
    }
    $installed = @(claude plugin list --json | ConvertFrom-Json | ForEach-Object { $_.id })
    foreach ($p in Read-List 'plugins.txt') {
        if ($installed -contains $p) {
            claude plugin enable $p 2>$null | Out-Null
            Write-Host "Plugin already installed: $p"
        } else {
            claude plugin install $p --scope user
        }
    }
}

Write-Host ''
Write-Host 'Done. Restart Claude Code / the Claude app so it picks everything up.'
Write-Host 'Context7 needs a one-time authorization: run /mcp in a claude terminal.'
