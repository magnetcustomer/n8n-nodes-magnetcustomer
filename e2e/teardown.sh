#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping n8n E2E container..."
cd "$SCRIPT_DIR" && docker compose down -v

echo "Done."
