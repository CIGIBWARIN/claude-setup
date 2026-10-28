# One-step Windows bootstrap: installs anything missing (Git, Node.js 22+, Claude Code), then runs setup.mjs.
#   irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/stable/install.ps1 | iex
# Run it in the project folder. With options (e.g. --user to turn Ingot on for every project on this PC):
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/stable/install.ps1))) --user
# Works in Windows PowerShell 5.1 and PowerShell 7.
# The body runs in its own scope so `iex` doesn't leave settings or functions behind in the caller's shell.
$setupArgs = $args
& {
    $ErrorActionPreference = 'Stop'

    function Test-Command($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

    # taste-skill needs Node 22 or newer.
    # A shim with no Node behind it (Volta without a default) prints an error instead of a version.
    function Test-Node { (Test-Command 'node') -and ("$(node -v)" -match '^v(\d+)') -and ([int]$Matches[1] -ge 22) }

    # Saved PATH first, so new installs win; this window's own entries (fnm, conda, nvm) are kept after it.
    # Duplicates are dropped: each refresh would add the saved PATH again, and past about 8,000 characters
    # cmd.exe finds no commands at all (not even `where`), so setup.mjs would report everything as missing.
    function Update-SessionPath {
        $all = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
               [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
               (Join-Path $env:USERPROFILE '.local\bin') + ';' + $env:Path
        $env:Path = ($all -split ';' | Where-Object { $_ } | Select-Object -Unique) -join ';'
    }

    # Re-checks afterwards, so a missing winget or a failed install always ends with the manual download link.
    function Invoke-Winget($verb, $id, $label, $url, $check) {
        if (-not (Test-Command 'winget')) { throw "$label is needed and winget isn't available. Install $label from $url, then run this command again." }
        Write-Host "Installing $label..."
        # Only the community source: the Microsoft Store source can fail on its own (seen on a fresh Windows) and isn't needed.
        winget $verb --id $id --source winget --silent --accept-package-agreements --accept-source-agreements
        Update-SessionPath
        if (-not (& $check)) { throw "$label could not be installed automatically. Install it from $url, then run this command again." }
    }

    # Node.js in the user's own folder, like install.sh's ~/.local/share/ingot-node: needs neither admin rights nor winget.
    function Install-PrivateNode {
        $ProgressPreference = 'SilentlyContinue'  # Windows PowerShell's progress bar makes a 30 MB download crawl.
        $dir = Join-Path $env:LOCALAPPDATA 'ingot-node'
        Write-Host "Installing Node.js 24 LTS into $dir..."
        $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
        $base = 'https://nodejs.org/dist/latest-v24.x'
        $sum, $file = ((Invoke-WebRequest -UseBasicParsing "$base/SHASUMS256.txt").Content -split '\r?\n' |
            Where-Object { $_ -match "\snode-v[\d.]+-win-$arch\.zip$" }) -split '\s+'
        if (-not $file) { throw 'No Node.js download for this PC was found. Install it from https://nodejs.org/en/download, then run this command again.' }
        $zip = Join-Path $env:TEMP $file
        Invoke-WebRequest -UseBasicParsing "$base/$file" -OutFile $zip
        if ((Get-FileHash $zip -Algorithm SHA256).Hash -ne $sum) { throw 'The Node.js download failed its checksum. Run this command again.' }
        if (Test-Path $dir) { Remove-Item -LiteralPath $dir -Recurse -Force }
        New-Item -ItemType Directory -Path $dir | Out-Null
        # Windows' own tar unpacks Node's thousands of small files far faster than Expand-Archive.
        & "$env:SystemRoot\System32\tar.exe" -xf $zip -C $dir --strip-components=1
        if ($LASTEXITCODE) { throw "Node.js could not be unpacked into $dir (is the disk full, or did antivirus block it?). Run this command again." }
        Remove-Item -LiteralPath $zip
        # First on the user PATH, so new terminals find it ahead of an older nvm-windows, Volta or Scoop Node.
        $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
        if (($userPath -split ';') -notcontains $dir) { [Environment]::SetEnvironmentVariable('Path', "$dir;$userPath", 'User') }
        Update-SessionPath
        # An older Node installed for all users still comes first, and only an admin can update that one.
        if (-not (Test-Node)) { throw 'Node.js 22 or newer could not be installed automatically. Install it from https://nodejs.org/en/download (or ask an admin to update the Node.js installed for all users), then run this command again.' }
    }

    Update-SessionPath
    # Claude Code on Windows needs Git for Windows (it uses Git Bash).
    if (-not (Test-Command 'git')) { Invoke-Winget 'install' 'Git.Git' 'Git' 'https://git-scm.com/download/win' { Test-Command 'git' } }
    if (-not (Test-Node)) {
        try {
            # An older Node from nvm-windows, fnm, Volta or Scoop isn't winget's to upgrade, so fall back to a fresh install.
            if (Test-Command 'node') {
                try { Invoke-Winget 'upgrade' 'OpenJS.NodeJS.LTS' 'Node.js 22 or newer' 'https://nodejs.org/en/download' { Test-Node } }
                catch { Invoke-Winget 'install' 'OpenJS.NodeJS.LTS' 'Node.js 22 or newer' 'https://nodejs.org/en/download' { Test-Node } }
            } else {
                Invoke-Winget 'install' 'OpenJS.NodeJS.LTS' 'Node.js 22 or newer' 'https://nodejs.org/en/download' { Test-Node }
            }
        } catch {
            # winget's Node is installed for all users, so it needs admin rights (and winget itself).
            Install-PrivateNode
        }
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
        Invoke-WebRequest -UseBasicParsing https://codeload.github.com/CIGIBWARIN/ingot/zip/refs/heads/stable -OutFile $zip
        Expand-Archive -Path $zip -DestinationPath $tmp
        # setup.mjs prints the closing block (done, or what is missing and how to fix it) and sets $LASTEXITCODE.
        & node (Join-Path $tmp 'ingot-stable\setup.mjs') @setupArgs
    } finally {
        Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
    }
}
