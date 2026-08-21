#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-https://synapse-ai-hub.onrender.com/api/v1}"
EXPECTED_CALLBACK_HOST="${2:-https://synapse-ai-hub.onrender.com}"
EXPECTED_FRONTEND_CALLBACK="${3:-https://synapse-hub-web.onrender.com/sso-login-callback}"

headers_file="$(mktemp)"
trap 'rm -f "$headers_file"' EXIT

curl -sS -D "$headers_file" -o /dev/null "$BASE_URL/login/google"
status="$(awk 'NR==1{print $2}' "$headers_file")"
location="$(grep -i '^location:' "$headers_file" | sed 's/[Ll]ocation:[[:space:]]*//;s/\r$//' || true)"

echo "base_url=$BASE_URL"
echo "google_status=$status"

if [[ -z "$location" ]]; then
  echo "google_location=missing"
  echo "result=fail"
  exit 1
fi

echo "google_location=$location"

if [[ "$location" == *"redirect_uri=None"* ]]; then
  echo "issue=redirect_uri_contains_None"
  echo "fix_hint=Set SSO_CALLBACK_HOSTNAME to backend root, for example $EXPECTED_CALLBACK_HOST"
  echo "result=fail"
  exit 1
fi

if [[ "$location" != *"redirect_uri="* ]]; then
  echo "issue=redirect_uri_missing"
  echo "result=fail"
  exit 1
fi

encoded_expected_callback="$(python3 - "$EXPECTED_CALLBACK_HOST" <<'PY'
import urllib.parse
import sys
callback_host = sys.argv[1]
print(urllib.parse.quote(callback_host + '/api/v1/login/google/callback', safe=''))
PY
)"

if [[ "$location" != *"redirect_uri=${encoded_expected_callback}"* ]]; then
  echo "issue=redirect_uri_unexpected"
  echo "expected_redirect_uri=${EXPECTED_CALLBACK_HOST}/api/v1/login/google/callback"
  echo "result=warn"
else
  echo "redirect_uri_check=ok"
fi

echo "expected_frontend_callback=$EXPECTED_FRONTEND_CALLBACK"
echo "note=Verify backend env SSO_LOGIN_CALLBACK_URL equals expected_frontend_callback"
echo "result=ok"
