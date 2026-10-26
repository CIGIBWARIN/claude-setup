#!/usr/bin/env bash
# One-step macOS/Linux bootstrap: installs anything missing (Node.js 22+, Claude Code), then runs setup.mjs.
#   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
# With options (e.g. also write this folder's .claude/settings.json):
#   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash -s -- --project
set -euo pipefail

# Everything is inside main so bash has read the whole script before anything that might read stdin runs.
main() {

case "$(uname -s)" in
  Linux) os=linux ;;
  Darwin) os=darwin ;;
  *) echo "On Windows, use install.ps1 from PowerShell instead." >&2; exit 1 ;;
esac

# macOS has only a stub git until the Apple developer tools are installed, and that install needs the user's click.
if [ "$os" = darwin ] && ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install >/dev/null 2>&1 || true
  echo "Finish the Apple developer tools install in the window that opened, then run this command again."
  exit 0
fi

case "$(uname -m)" in
  x86_64|amd64) arch=x64 ;;
  arm64|aarch64) arch=arm64 ;;
  *) echo "Unsupported CPU: $(uname -m)" >&2; exit 1 ;;
esac

need() { command -v "$1" >/dev/null 2>&1; }
for tool in curl tar; do need "$tool" || { echo "Please install $tool first." >&2; exit 1; }; done
export PATH="$HOME/.local/bin:$HOME/.local/share/claude-setup-node/bin:$PATH"

# taste-skill needs Node 22 or newer.
node_ok() { need node && node -e 'process.exit(+process.versions.node.split(".")[0] >= 22 ? 0 : 1)'; }

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
  node_ok || { echo "Node.js 22+ could not be installed. Install it from https://nodejs.org/en/download, then run this command again." >&2; exit 1; }
fi

# New terminals need ~/.local/bin (claude, yt-dlp) and our private Node on PATH.
for rc in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.zshrc"; do
  # zsh (macOS default) never reads .profile, so create .zshrc for zsh users.
  [ -f "$rc" ] || [ "$rc" = "$HOME/.profile" ] || { [ "$rc" = "$HOME/.zshrc" ] && [[ "${SHELL:-}" == *zsh ]]; } || continue
  if ! grep -q '\.local/bin' "$rc" 2>/dev/null; then echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$rc"; fi
  if [ -d "$HOME/.local/share/claude-setup-node" ] && ! grep -q claude-setup-node "$rc" 2>/dev/null; then
    echo 'export PATH="$HOME/.local/share/claude-setup-node/bin:$PATH"' >> "$rc"
  fi
done

if ! need claude; then
  echo "Installing Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
curl -fsSL https://codeload.github.com/CIGIBWARIN/claude-setup/tar.gz/refs/heads/main | tar -xz -C "$tmp"
# setup.mjs prints the closing block (done, or what is missing and how to fix it) and its exit code is ours.
node "$tmp/claude-setup-main/setup.mjs" "$@"
}

main "$@"
