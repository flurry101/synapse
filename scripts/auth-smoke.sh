#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://localhost:8000/api/v1}"
EMAIL="e2e.$(date +%s)@example.com"
PASSWORD="TestPass123!"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

request() {
  local method="$1"
  local url="$2"
  local output="$3"
  shift 3
  curl -sS -o "$output" -w "%{http_code}" -X "$method" "$url" "$@"
}

echo "BASE_URL=$BASE_URL"
echo "EMAIL=$EMAIL"

register_status=$(request POST "$BASE_URL/users" "$tmpdir/register.json" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"E2E\",\"last_name\":\"User\"}")
echo "register_status=$register_status body=$(tr -d '\n' < "$tmpdir/register.json")"

token_status=$(request POST "$BASE_URL/login/access-token" "$tmpdir/token.json" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=$EMAIL&password=$PASSWORD")
echo "token_status=$token_status body=$(tr -d '\n' < "$tmpdir/token.json")"

token="$(sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p' "$tmpdir/token.json")"
if [[ -n "$token" ]]; then
  me_status=$(request GET "$BASE_URL/users/me" "$tmpdir/me.json" \
    -H "Authorization: Bearer $token")
  echo "me_status=$me_status body=$(tr -d '\n' < "$tmpdir/me.json")"
else
  echo "me_status=skipped reason=no_token"
fi

refresh_status=$(request GET "$BASE_URL/login/refresh-token" "$tmpdir/refresh.json")
echo "refresh_status_without_cookie=$refresh_status body=$(tr -d '\n' < "$tmpdir/refresh.json")"

google_headers="$tmpdir/google.headers"
curl -sS -D "$google_headers" -o /dev/null "$BASE_URL/login/google"
google_status="$(awk 'NR==1{print $2}' "$google_headers")"
google_location="$(grep -i '^location:' "$google_headers" | sed 's/[Ll]ocation:[[:space:]]*//;s/\r$//' || true)"
echo "google_status=$google_status"
if [[ -n "$google_location" ]]; then
  echo "google_location=$google_location"
fi

echo "auth_smoke=done"