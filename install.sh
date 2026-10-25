#!/usr/bin/env bash
# One-step macOS/Linux bootstrap: installs anything missing (Node.js, Claude Code), then runs setup.mjs.
#   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
# With options (e.g. machine-wide):
#   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash -s -- --user
set -euo pipefail

# Everything is inside main so bash has read the whole script before anything that might read stdin runs.
main() {

case "$(uname -s)" in
  Linux) os=linux ;;
  Darwin) os=darwin ;;
  *) echo "On Windows, use install.ps1 from PowerShell instead." >&2; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) arch=x64 ;;
  arm64|aarch64) arch=arm64 ;;
  *) echo "Unsupported CPU: $(uname -m)" >&2; exit 1 ;;
esac

need() { command -v "$1" >/dev/null 2>&1; }
for tool in curl tar; do need "$tool" || { echo "Please install $tool first." >&2; exit 1; }; done
export PATH="$HOME/.local/bin:$HOME/.local/share/claude-setup-node/bin:$PATH"

node_ok() { need node && node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=12)?0:1)'; }

# Node.js: a private copy in ~/.local/share (no sudo); its npm installs global packages there too.
if ! node_ok; then
  echo "Installing Node.js 24 LTS into ~/.local/share/claude-setup-node..."
  base=https://nodejs.org/dist/latest-v24.x
  file=$(curl -fsSL "$base/SHASUMS256.txt" | awk -v f="-$os-$arch.tar.gz" '$2 ~ f"$" {print $2}')
  sum=$(curl -fsSL "$base/SHASUMS256.txt" | awk -v f="$file" '$2 == f {print $1}')
  tmp=$(mktemp -d)
  curl -fsSL "$base/$file" -o "$tmp/$file"
  if need sha256sum; then got=$(sha256sum "$tmp/$file" | cut -d' ' -f1); else got=$(shasum -a 256 "$tmp/$file" | cut -d' ' -f1); fi
  [ "$got" = "$sum" ] || { echo "Node.js download checksum mismatch" >&2; exit 1; }
  rm -rf "$HOME/.local/share/claude-setup-node" && mkdir -p "$HOME/.local/share/claude-setup-node"
  tar -xzf "$tmp/$file" -C "$HOME/.local/share/claude-setup-node" --strip-components=1
  rm -rf "$tmp"
  for rc in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.zshrc"; do
    # zsh (macOS default) never reads .profile, so create .zshrc for zsh users.
    [ -f "$rc" ] || [ "$rc" = "$HOME/.profile" ] || { [ "$rc" = "$HOME/.zshrc" ] && [[ "${SHELL:-}" == *zsh ]]; } || continue
    grep -q claude-setup-node "$rc" 2>/dev/null || echo 'export PATH="$HOME/.local/share/claude-setup-node/bin:$PATH"' >> "$rc"
  done
fi

if ! need claude; then
  echo "Installing Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
curl -fsSL https://codeload.github.com/CIGIBWARIN/claude-setup/tar.gz/refs/heads/main | tar -xz -C "$tmp"
node "$tmp/claude-setup-main/setup.mjs" "$@"
echo 'If Claude Code was just installed, open a new terminal and run "claude" once to sign in.'
}

main "$@"
