#!/bin/bash
# =====================================================
# celx-atendimento - API Test Script
# =====================================================

BASE_URL="http://localhost:8000"
API_URL="$BASE_URL/api/v1"

echo "=========================================="
echo "celx-atendimento - API Test Report"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
TOTAL=0

# Test function
test_api() {
  local name="$1"
  local expected_code="$2"
  local method="$3"
  local endpoint="$4"
  local data="$5"
  local token="$6"

  TOTAL=$((TOTAL + 1))

  if [ -n "$token" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data" 2>/dev/null)
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  fi

  if [ "$response" = "$expected_code" ]; then
    echo -e "${GREEN}[PASS]${NC} $name (HTTP $response)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}[FAIL]${NC} $name - Expected $expected_code, got HTTP $response"
    FAIL=$((FAIL + 1))
  fi
}

echo "=========================================="
echo "1. PUBLIC ENDPOINTS"
echo "=========================================="

test_api "GET /health" "200" "GET" "/health" "" ""
test_api "GET /plans/ (list all plans)" "200" "GET" "/plans/" "" ""
test_api "GET /plans/1 (get plan by id)" "200" "GET" "/plans/1" "" ""

echo ""
echo "=========================================="
echo "2. AUTHENTICATION"
echo "=========================================="

# Get tokens
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","password":"123456"}' | python3 -c 'import sys,json; print(json.load(sys.stdin).get("access_token",""))')

AGENT_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"atendente@teste.com","password":"123456"}' | python3 -c 'import sys,json; print(json.load(sys.stdin).get("access_token",""))')

CUSTOMER_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@teste.com","password":"123456"}' | python3 -c 'import sys,json; print(json.load(sys.stdin).get("access_token",""))')

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}[PASS]${NC} Admin login successful"
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} Admin login failed"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

if [ -n "$AGENT_TOKEN" ]; then
  echo -e "${GREEN}[PASS]${NC} Agent login successful"
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} Agent login failed"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

if [ -n "$CUSTOMER_TOKEN" ]; then
  echo -e "${GREEN}[PASS]${NC} Customer login successful"
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} Customer login failed"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

# Test invalid login
INVALID_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@teste.com","password":"wrong"}')
if [ "$INVALID_RESPONSE" = "401" ]; then
  echo -e "${GREEN}[PASS]${NC} Invalid login returns 401"
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} Invalid login - Expected 401, got $INVALID_RESPONSE"
  FAIL=$((FAIL + 1))
fi
TOTAL=$((TOTAL + 1))

echo ""
echo "=========================================="
echo "3. AUTHORIZATION (protected endpoints)"
echo "=========================================="

# Without token
test_api "GET /tickets/ without token" "401" "GET" "/tickets/" "" ""
test_api "GET /categories/ without token" "401" "GET" "/categories/" "" ""

# With valid token
if [ -n "$ADMIN_TOKEN" ]; then
  # These will return 500 due to backend bug, but auth is passing
  test_api "GET /categories/ with admin token" "200" "GET" "/categories/" "" "$ADMIN_TOKEN"
fi

echo ""
echo "=========================================="
echo "4. AUTHENTICATED REQUESTS (with token)"
echo "=========================================="

if [ -n "$ADMIN_TOKEN" ]; then
  test_api "GET /tickets/ with admin token" "200" "GET" "/tickets/" "" "$ADMIN_TOKEN"
  test_api "GET /tickets/?status=open" "200" "GET" "/tickets/?status=open" "" "$ADMIN_TOKEN"
fi

if [ -n "$CUSTOMER_TOKEN" ]; then
  test_api "GET /tickets/ with customer token" "200" "GET" "/tickets/" "" "$CUSTOMER_TOKEN"
fi

# Note: Many endpoints return 500 due to backend bug with user_id lookup
# The issue is that user_id "1" (string) is being converted to UUID incorrectly

echo ""
echo "=========================================="
echo "5. SUMMARY"
echo "=========================================="
echo -e "Total tests: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${YELLOW}Some tests failed. Review the output above.${NC}"
fi

echo ""
echo "=========================================="
echo "KNOWN ISSUES"
echo "=========================================="
echo "1. Backend returns 500 on authenticated requests:"
echo "   - The JWT contains 'sub: 1' (user ID as string)"
echo "   - get_current_user tries to convert this to UUID"
echo "   - UUID() fails with 'badly formed hexadecimal UUID string'"
echo ""
echo "2. superadmin@celx.com.br login fails:"
echo "   - Credentials in README don't match seed.sql"
echo "   - Seed uses password hash for '123456' not 'admin123'"
echo ""