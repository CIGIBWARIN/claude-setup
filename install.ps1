# One-step Windows bootstrap: installs anything missing (Git, Node.js 22+, Claude Code), then runs setup.mjs.
#   irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.ps1 | iex
# With options (e.g. also write this folder's .claude/settings.json):
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.ps1))) --project
# Works in Windows PowerShell 5.1 and PowerShell 7.
# The body runs in its own scope so `iex` doesn't leave settings or functions behind in the caller's shell.
$setupArgs = $args
& {
    $ErrorActionPreference = 'Stop'

    function Test-Command($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

    # taste-skill needs Node 22 or newer.
    function Test-Node { (Test-Command 'node') -and ([int]((node -v) -replace '^v(\d+).*', '$1') -ge 22) }

    function Update-SessionPath {
        $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                    [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
                    (Join-Path $env:USERPROFILE '.local\bin')
    }

    # Re-checks afterwards, so a missing winget or a failed install always ends with the manual download link.
    function Invoke-Winget($verb, $id, $label, $url, $check) {
        if (-not (Test-Command 'winget')) { throw "$label is needed and winget isn't available. Install $label from $url, then run this command again." }
        Write-Host "Installing $label..."
        winget $verb --id $id --silent --accept-package-agreements --accept-source-agreements
        Update-SessionPath
        if (-not (& $check)) { throw "$label could not be installed automatically. Install it from $url, then run this command again." }
    }

    Update-SessionPath
    # Claude Code on Windows needs Git for Windows (it uses Git Bash).
    if (-not (Test-Command 'git')) { Invoke-Winget 'install' 'Git.Git' 'Git' 'https://git-scm.com/download/win' { Test-Command 'git' } }
    if (-not (Test-Node)) {
        $verb = if (Test-Command 'node') { 'upgrade' } else { 'install' }
        Invoke-Winget $verb 'OpenJS.NodeJS.LTS' 'Node.js 22 or newer' 'https://nodejs.org/en/download' { Test-Node }
    }
    if (-not (Test-Command 'claude')) {
        Write-Host 'Installing Claude Code...'
        # Child process: the official installer calls `exit` on failure, which would close this window.
        powershell -NoProfile -ExecutionPolicy Bypass -Command 'irm https://claude.ai/install.ps1 | iex'
        Update-SessionPath
    }

    $tmp = Join-Path $env:TEMP ('ingot-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tmp | Out-Null
    try {
        $zip = Join-Path $tmp 'repo.zip'
        Invoke-WebRequest -UseBasicParsing https://codeload.github.com/CIGIBWARIN/ingot/zip/refs/heads/main -OutFile $zip
        Expand-Archive -Path $zip -DestinationPath $tmp
        # setup.mjs prints the closing block (done, or what is missing and how to fix it) and sets $LASTEXITCODE.
        & node (Join-Path $tmp 'ingot-main\setup.mjs') @setupArgs
    } finally {
        Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
    }
}
