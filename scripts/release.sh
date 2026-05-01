#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh <version>

VERSION_INPUT="${1:-}"
if [ -z "$VERSION_INPUT" ]; then
  echo "Usage: ./scripts/release.sh <version> (e.g., 1.1.0 or v1.1.0)";
  exit 1;
fi

# Normalize and validate SemVer (allow optional leading 'v')
VERSION_STRIPPED="${VERSION_INPUT#v}"
if [[ ! "$VERSION_STRIPPED" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be SemVer (major.minor.patch). Got: $VERSION_INPUT";
  exit 1;
fi
VERSION_TAG="v$VERSION_STRIPPED"

if git rev-parse "refs/tags/$VERSION_TAG" >/dev/null 2>&1; then
  echo "Tag $VERSION_TAG ya existe"
  exit 0
fi

echo "Bumping version to $VERSION_STRIPPED and tagging $VERSION_TAG..."

# Update package.json version
node -e "let p=JSON.parse(require('fs').readFileSync('./package.json','utf8')); p.version='${VERSION_STRIPPED}'; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2) + '\n');"

# Prepend CHANGELOG entry for this version
DATE=$(date +"%Y-%m-%d")
ENTRY="## [${VERSION_STRIPPED}] - ${DATE}\n### Added\n- Campaigns and adapters present in this release.\n- Integrations with runtime and observability scaffolding.\n\n### Changed\n- Minor improvements to deployment and wiring.\n\n### Fixed\n- No breaking fixes yet.\n\n"
{ echo "$ENTRY"; cat CHANGELOG.md; } > CHANGELOG.tmp; mv CHANGELOG.tmp CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "chore(release): bump version to ${VERSION_STRIPPED} and update changelog"
git tag -a "$VERSION_TAG" -m "Release ${VERSION_TAG}" 
git push origin "$VERSION_TAG" --tags
echo "Release prepared: ${VERSION_TAG}"
