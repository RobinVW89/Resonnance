#!/usr/bin/env bash
# Start the API with a single API_TOKEN env var
set -euo pipefail

# Usage: ./start-secure.sh [token]
# If token not provided, it will derive base64 from ADMIN_USER:ADMIN_PASS if available.

TOKEN="$1"
if [ -z "$TOKEN" ]; then
  if [ -n "${ADMIN_USER:-}" ] && [ -n "${ADMIN_PASS:-}" ]; then
    TOKEN=$(printf "%s:%s" "$ADMIN_USER" "$ADMIN_PASS" | base64)
  else
    echo "Provide token as first argument or set ADMIN_USER and ADMIN_PASS in env." >&2
    exit 1
  fi
fi

export API_TOKEN="$TOKEN"
echo "Starting server with API_TOKEN (length ${#API_TOKEN})"
nohup npm start > server.log 2>&1 &
echo $!
