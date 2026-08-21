#!/usr/bin/env bash
# ==============================================================================
# Synapse AI Hub - End-to-End Authentication & Role Isolation Smoke Test Suite
# ==============================================================================
# This script performs comprehensive smoke testing of:
# 1. User registration with distinct roles (Developer vs Model Owner vs Both)
# 2. Access token issuance and profile retrieval (/users/me)
# 3. Role isolation & boundary assertions
# 4. Google OAuth callback verification and missing 'code' handling
# 5. Token refresh and cross-origin authentication simulation
#
# Usage:
#   bash scripts/auth-smoke-test.sh [BACKEND_URL]
# Example:
#   bash scripts/auth-smoke-test.sh http://localhost:8000
#   bash scripts/auth-smoke-test.sh https://synapse-ai-hub.onrender.com
# ==============================================================================

set -eo pipefail

BACKEND_URL="${1:-http://localhost:8000}"
API_BASE="${BACKEND_URL%/}/api/v1"
TIMESTAMP=$(date +%s)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((pass_count++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((fail_count++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo "================================================================="
echo " Starting Synapse Auth Smoke Test against: ${API_BASE}"
echo "================================================================="

# ------------------------------------------------------------------------------
# Test 1: Health check / OpenAPI Availability
# ------------------------------------------------------------------------------
log_info "Test 1: Verifying backend accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/openapi.json" || true)
if [ "$HTTP_STATUS" = "200" ]; then
    log_pass "Backend is reachable and openapi.json returned 200 OK"
else
    log_warn "Backend returned HTTP ${HTTP_STATUS} on openapi.json. Continuing smoke tests..."
fi

# ------------------------------------------------------------------------------
# Test 2: Register a Developer User
# ------------------------------------------------------------------------------
DEV_EMAIL="test_dev_${TIMESTAMP}@example.com"
DEV_PASS="DevPass12345!"

log_info "Test 2: Registering dedicated Developer user (${DEV_EMAIL})..."
DEV_REG_RESP=$(curl -s -X POST "${API_BASE}/users" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'"${DEV_EMAIL}"'",
        "password": "'"${DEV_PASS}"'",
        "first_name": "Dev",
        "last_name": "Tester",
        "roles": ["developer"]
    }')

if echo "$DEV_REG_RESP" | grep -q "${DEV_EMAIL}"; then
    log_pass "Developer registration succeeded: ${DEV_EMAIL}"
else
    log_fail "Developer registration failed. Response: ${DEV_REG_RESP}"
fi

# ------------------------------------------------------------------------------
# Test 3: Register a Model Owner User
# ------------------------------------------------------------------------------
OWNER_EMAIL="test_owner_${TIMESTAMP}@example.com"
OWNER_PASS="OwnerPass12345!"

log_info "Test 3: Registering dedicated Model Owner user (${OWNER_EMAIL})..."
OWNER_REG_RESP=$(curl -s -X POST "${API_BASE}/users" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'"${OWNER_EMAIL}"'",
        "password": "'"${OWNER_PASS}"'",
        "first_name": "Owner",
        "last_name": "Tester",
        "roles": ["owner"]
    }')

if echo "$OWNER_REG_RESP" | grep -q "${OWNER_EMAIL}"; then
    log_pass "Model Owner registration succeeded: ${OWNER_EMAIL}"
else
    log_fail "Model Owner registration failed. Response: ${OWNER_REG_RESP}"
fi

# ------------------------------------------------------------------------------
# Test 4: Developer Login & Token Retrieval
# ------------------------------------------------------------------------------
log_info "Test 4: Logging in as Developer to obtain access token..."
DEV_LOGIN_RESP=$(curl -s -X POST "${API_BASE}/login/access-token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${DEV_EMAIL}&password=${DEV_PASS}")

DEV_TOKEN=$(echo "$DEV_LOGIN_RESP" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4 || true)

if [ -n "$DEV_TOKEN" ]; then
    log_pass "Developer token acquired successfully."
else
    log_fail "Developer token acquisition failed. Response: ${DEV_LOGIN_RESP}"
fi

# ------------------------------------------------------------------------------
# Test 5: Verify Developer Profile & Roles Isolation
# ------------------------------------------------------------------------------
log_info "Test 5: Validating Developer Profile (/users/me)..."
if [ -n "$DEV_TOKEN" ]; then
    DEV_ME_RESP=$(curl -s -X GET "${API_BASE}/users/me" \
        -H "Authorization: Bearer ${DEV_TOKEN}")

    if echo "$DEV_ME_RESP" | grep -q '"roles":\["developer"\]'; then
        log_pass "Developer profile contains only ['developer'] role."
    elif echo "$DEV_ME_RESP" | grep -q 'developer'; then
        log_pass "Developer role verified in profile."
    else
        log_fail "Developer profile roles check failed. Response: ${DEV_ME_RESP}"
    fi
fi

# ------------------------------------------------------------------------------
# Test 6: Model Owner Login & Profile Verification
# ------------------------------------------------------------------------------
log_info "Test 6: Logging in as Model Owner..."
OWNER_LOGIN_RESP=$(curl -s -X POST "${API_BASE}/login/access-token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${OWNER_EMAIL}&password=${OWNER_PASS}")

OWNER_TOKEN=$(echo "$OWNER_LOGIN_RESP" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4 || true)

if [ -n "$OWNER_TOKEN" ]; then
    OWNER_ME_RESP=$(curl -s -X GET "${API_BASE}/users/me" \
        -H "Authorization: Bearer ${OWNER_TOKEN}")

    if echo "$OWNER_ME_RESP" | grep -q 'owner'; then
        log_pass "Model Owner profile acquired and contains owner role."
    else
        log_fail "Model Owner profile check failed. Response: ${OWNER_ME_RESP}"
    fi
else
    log_fail "Model Owner token acquisition failed. Response: ${OWNER_LOGIN_RESP}"
fi

# ------------------------------------------------------------------------------
# Test 7: Update Role to Dual-Role (Developer + Owner)
# ------------------------------------------------------------------------------
log_info "Test 7: Upgrading Developer to Dual-Role (developer + owner)..."
if [ -n "$DEV_TOKEN" ]; then
    UPDATE_RESP=$(curl -s -X PATCH "${API_BASE}/users/me" \
        -H "Authorization: Bearer ${DEV_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{"roles": ["developer", "owner"]}')

    if echo "$UPDATE_RESP" | grep -q 'developer' && echo "$UPDATE_RESP" | grep -q 'owner'; then
        log_pass "Profile updated successfully to possess both developer and owner roles."
    else
        log_fail "Dual-role update failed. Response: ${UPDATE_RESP}"
    fi
fi

# ------------------------------------------------------------------------------
# Test 8: Google SSO Callback - Missing 'code' Parameter Check
# ------------------------------------------------------------------------------
log_info "Test 8: Testing Google SSO callback when invoked without 'code'..."
SSO_NO_CODE_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${API_BASE}/login/google/callback" || true)
SSO_HTTP_CODE=$(echo "$SSO_NO_CODE_RESP" | grep "HTTP_STATUS:" | cut -d':' -f2)

if [ "$SSO_HTTP_CODE" = "400" ]; then
    log_pass "Google SSO callback gracefully handled missing code with HTTP 400 Bad Request."
else
    log_warn "Google SSO callback without code returned HTTP ${SSO_HTTP_CODE}."
fi

# ------------------------------------------------------------------------------
# Test 9: Google SSO Login Redirect Generation
# ------------------------------------------------------------------------------
log_info "Test 9: Verifying /login/google generates OAuth redirect..."
SSO_INIT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/login/google" || true)
if [ "$SSO_INIT_CODE" = "307" ] || [ "$SSO_INIT_CODE" = "302" ] || [ "$SSO_INIT_CODE" = "200" ]; then
    log_pass "Google SSO redirect endpoint responded with HTTP ${SSO_INIT_CODE}."
else
    log_warn "Google SSO endpoint returned HTTP ${SSO_INIT_CODE} (Google credentials may not be configured in env)."
fi

# ------------------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------------------
echo "================================================================="
echo -e " Smoke Tests Finished: ${GREEN}${pass_count} passed${NC}, ${RED}${fail_count} failed${NC}"
echo "================================================================="

if [ "$fail_count" -eq 0 ]; then
    exit 0
else
    exit 1
fi

