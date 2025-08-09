#!/usr/bin/env bash
set -euo pipefail

# Deploys the contents of a subdirectory (default: web/) to a branch (default: gh-pages)
# using `git subtree split` + force push. Compatible with GitHub Pages "Deploy from a branch".

BRANCH="gh-pages"
REMOTE="origin"
PREFIX="web"
FORCE=1
ALLOW_DIRTY=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -b, --branch <name>    Target branch (default: gh-pages)
  -r, --remote <name>    Remote name (default: origin)
  -p, --prefix <dir>     Directory to publish (default: web)
      --no-force         Do not use --force on push
      --allow-dirty      Allow running with uncommitted changes
  -h, --help             Show this help

Examples:
  $(basename "$0")                     # publish web/ to origin gh-pages (force)
  $(basename "$0") -b pages -p web     # publish web/ to origin pages (force)
  $(basename "$0") --no-force          # publish without force
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--branch) BRANCH="$2"; shift 2;;
    -r|--remote) REMOTE="$2"; shift 2;;
    -p|--prefix) PREFIX="$2"; shift 2;;
    --no-force) FORCE=0; shift 1;;
    --allow-dirty) ALLOW_DIRTY=1; shift 1;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option: $1" >&2; usage; exit 2;;
  esac
done

if [[ ! -d "$PREFIX" ]]; then
  echo "Error: directory '$PREFIX' not found." >&2
  exit 1
fi

if [[ "$ALLOW_DIRTY" -ne 1 ]]; then
  if ! git diff-index --quiet HEAD --; then
    echo "Error: working tree has uncommitted changes. Commit or use --allow-dirty." >&2
    exit 1
  fi
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Error: remote '$REMOTE' not found." >&2
  exit 1
fi

TMPBR="__deploy_${BRANCH}_$(date +%s)"

echo "Creating subtree split from '$PREFIX' into temp branch '$TMPBR'..."
git subtree split --prefix "$PREFIX" -b "$TMPBR" >/dev/null

PUSH_FLAGS=()
if [[ "$FORCE" -eq 1 ]]; then
  PUSH_FLAGS+=("--force")
fi

echo "Pushing '$PREFIX' to $REMOTE/$BRANCH ${PUSH_FLAGS[*]}..."
git push "$REMOTE" "$TMPBR:$BRANCH" "${PUSH_FLAGS[@]}"

echo "Cleaning up temp branch '$TMPBR'..."
git branch -D "$TMPBR" >/dev/null

echo "Done. Configure GitHub Pages to publish from branch '$BRANCH' (root)."

