#!/usr/bin/env bash
#
# install-hooks.sh — Wire up the project's git hooks (pre-commit auto-update).
# Runs once after cloning. Idempotent.
#
# What it does:
#   • Copies .githooks/pre-commit into .git/hooks/pre-commit
#   • Makes it executable
#
# Why a copy and not core.hooksPath? Some IDEs (notably the Arduino IDE bundled
# git) ignore core.hooksPath, so we install into the standard location.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "❌ Not a git repository: $REPO_ROOT" >&2
    exit 1
fi

mkdir -p "$REPO_ROOT/.git/hooks"
cp "$REPO_ROOT/.githooks/pre-commit" "$REPO_ROOT/.git/hooks/pre-commit"
chmod +x "$REPO_ROOT/.git/hooks/pre-commit"

echo "✓ Pre-commit hook installed at .git/hooks/pre-commit"
echo "  Future commits will auto-regenerate the TOC of src/main.cpp"
