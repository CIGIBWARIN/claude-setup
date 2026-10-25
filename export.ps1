# Copies this PC's current Claude Code setup back into the repo, ready to commit.
# -Add registers new paths under ~/.claude to track, e.g.  .\export.ps1 -Add skills/my-skill, agents/foo.md
param([string[]]$Add)
$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$claudeDir = Join-Path $env:USERPROFILE '.claude'
$listFile = Join-Path $repo 'managed-paths.txt'

$paths = [System.Collections.Generic.List[string]]@(Get-Content $listFile | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') })
foreach ($a in $Add) {
    $a = $a.Replace('\', '/').Trim('/')
    if (-not (Test-Path (Join-Path $claudeDir $a))) { throw "Not found under ~/.claude: $a" }
    if (-not $paths.Contains($a)) { $paths.Add($a) }
}
Set-Content -Path $listFile -Value $paths

foreach ($rel in $paths) {
    $src = Join-Path $claudeDir $rel
    $dst = Join-Path $repo "home\$rel"
    if (-not (Test-Path $src)) { Write-Warning "No longer on this PC, removing from repo: $rel"; continue }
    if (Test-Path $dst) { Remove-Item -LiteralPath $dst -Recurse -Force -Confirm:$false }
    New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
    Copy-Item -LiteralPath $src -Destination $dst -Recurse
}
# Drop repo copies of paths that were deleted locally
$kept = @($paths | Where-Object { Test-Path (Join-Path $claudeDir $_) })
Set-Content -Path $listFile -Value $kept
foreach ($rel in $paths | Where-Object { $kept -notcontains $_ }) {
    $dst = Join-Path $repo "home\$rel"
    if (Test-Path $dst) { Remove-Item -LiteralPath $dst -Recurse -Force -Confirm:$false }
}

# Record user-scope plugins that are enabled here
$plugins = claude plugin list --json | ConvertFrom-Json | Where-Object { $_.scope -eq 'user' -and $_.enabled } | ForEach-Object { $_.id } | Sort-Object
Set-Content -Path (Join-Path $repo 'plugins.txt') -Value (@('# plugin@marketplace, one per line. Installed at user scope by setup.ps1.') + $plugins)

git -C $repo status --short
Write-Host 'Review the changes above, then: git commit -am "Update setup" ; git push'
