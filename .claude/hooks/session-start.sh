#!/bin/bash
# Cloud sessions only: run the sign-in-free checks CI runs (.github/workflows/check.yml), so Claude
# starts knowing whether the branch is green. Never blocks the session; failures become context.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
report=""
add() { report+="- $1"$'\n'; }

major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
[ "$major" -ge 22 ] || add "Node.js 22+ is required (package.json engines), found ${major}."

out=$(node evals/check.mjs 2>&1) || add "node evals/check.mjs failed: ${out}"
out=$(bash -n install.sh 2>&1) || add "bash -n install.sh failed: ${out}"

if command -v pwsh >/dev/null; then
  out=$(pwsh -NoProfile -Command '$e=$null; [System.Management.Automation.Language.Parser]::ParseFile("$PWD/install.ps1",[ref]$null,[ref]$e)|Out-Null; if($e){$e|%{$_.Message}; exit 1}' 2>&1) \
    || add "install.ps1 does not parse: ${out}"
else
  add "pwsh is not installed, so install.ps1 was not parse-checked (add it to the environment's setup script)."
fi

out=$(claude plugin validate . 2>&1) || add "claude plugin validate . failed: ${out}"

if [ -z "$report" ]; then
  msg="Session start: all CI checks pass on this branch (evals/check.mjs, install.sh/install.ps1 parse, plugin validate). Re-run them before pushing."
else
  msg="Session start: some CI checks fail on this branch before any edits:"$'\n'"${report}"
fi
node -e 'console.log(JSON.stringify({hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:process.argv[1]}}))' "$msg"
