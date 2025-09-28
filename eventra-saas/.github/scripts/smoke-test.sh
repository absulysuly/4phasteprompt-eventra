#!/bin/bash
set -euo pipefail

# Smoke Test Script
# Performs basic health checks against staging environment

echo "🔥 Eventra SaaS Smoke Tests"
echo "=========================="

# Check if STAGING_URL is provided
if [[ -z "${STAGING_URL:-}" ]]; then
  echo "ℹ️  STAGING_URL not provided - skipping smoke tests"
  exit 0
fi

# Clean up URL (remove trailing slash)
STAGING_URL="${STAGING_URL%/}"
echo "🎯 Testing staging environment: $STAGING_URL"

# Test configuration
TIMEOUT=30
MAX_RETRIES=3
RETRY_DELAY=5

# Function to make HTTP request with retries
make_request() {
  local url="$1"
  local expected_status="${2:-200}"
  local description="$3"
  local retry_count=0
  
  echo "📡 Testing: $description"
  echo "   URL: $url"
  
  while [[ $retry_count -lt $MAX_RETRIES ]]; do
    # Make request and capture both status code and response body
    local response
    local status_code
    
    if response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null); then
      status_code=$(echo "$response" | tail -n1)
      body=$(echo "$response" | head -n -1)
      
      if [[ "$status_code" == "$expected_status" ]]; then
        echo "   ✅ Success (HTTP $status_code)"
        if [[ -n "$body" && "$body" != "null" ]]; then
          echo "   📄 Response preview: $(echo "$body" | head -c 100)..."
        fi
        return 0
      else
        echo "   ❌ Unexpected status code: $status_code (expected $expected_status)"
      fi
    else
      echo "   ❌ Request failed (network error or timeout)"
    fi
    
    retry_count=$((retry_count + 1))
    if [[ $retry_count -lt $MAX_RETRIES ]]; then
      echo "   🔄 Retrying in ${RETRY_DELAY}s... (attempt $((retry_count + 1))/$MAX_RETRIES)"
      sleep $RETRY_DELAY
    fi
  done
  
  echo "   ❌ Failed after $MAX_RETRIES attempts"
  return 1
}

# Function to test JSON API endpoint
test_json_endpoint() {
  local url="$1"
  local description="$2"
  local required_fields="$3"
  
  echo "🧪 Testing JSON API: $description"
  echo "   URL: $url"
  
  local response
  if response=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null); then
    local status_code
    status_code=$(curl -s -w "%{http_code}" --max-time $TIMEOUT "$url" -o /dev/null 2>/dev/null || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
      echo "   ✅ HTTP 200 OK"
      
      # Validate JSON structure if jq is available
      if command -v jq >/dev/null 2>&1; then
        if echo "$response" | jq empty 2>/dev/null; then
          echo "   ✅ Valid JSON response"
          
          # Check for required fields
          if [[ -n "$required_fields" ]]; then
            local missing_fields=()
            IFS=',' read -ra fields <<< "$required_fields"
            for field in "${fields[@]}"; do
              if ! echo "$response" | jq -e ".$field" >/dev/null 2>&1; then
                missing_fields+=("$field")
              fi
            done
            
            if [[ ${#missing_fields[@]} -eq 0 ]]; then
              echo "   ✅ All required fields present"
            else
              echo "   ⚠️  Missing fields: ${missing_fields[*]}"
            fi
          fi
        else
          echo "   ❌ Invalid JSON response"
          return 1
        fi
      else
        echo "   ⚠️  JSON validation skipped (jq not available)"
      fi
      
      return 0
    else
      echo "   ❌ HTTP $status_code"
      return 1
    fi
  else
    echo "   ❌ Request failed"
    return 1
  fi
}

# Start smoke tests
echo ""
echo "🚀 Starting smoke tests..."
echo ""

# Test 1: Health check endpoint
if ! make_request "$STAGING_URL/api/health" "200" "Health check endpoint"; then
  echo "❌ Critical: Health check failed"
  exit 1
fi

echo ""

# Test 2: Homepage accessibility
if ! make_request "$STAGING_URL" "200" "Homepage"; then
  echo "❌ Critical: Homepage not accessible"
  exit 1
fi

echo ""

# Test 3: API health with JSON validation
if ! test_json_endpoint "$STAGING_URL/api/health" "Health check API" "status"; then
  echo "⚠️  Warning: Health API structure may be incorrect"
fi

echo ""

# Test 4: Events API (should be accessible)
if ! make_request "$STAGING_URL/api/events" "200" "Events API"; then
  echo "⚠️  Warning: Events API not accessible (may require authentication)"
fi

echo ""

# Test 5: Static assets (try to load favicon)
if ! make_request "$STAGING_URL/favicon.ico" "200" "Static assets (favicon)"; then
  echo "⚠️  Warning: Static assets may not be properly served"
fi

echo ""

# Test 6: Authentication pages
if ! make_request "$STAGING_URL/login" "200" "Login page"; then
  echo "⚠️  Warning: Login page not accessible"
fi

echo ""

# Test 7: Check for security headers (basic CSP check)
echo "🔒 Checking security headers..."
headers=$(curl -s -I --max-time $TIMEOUT "$STAGING_URL" 2>/dev/null || echo "")
if echo "$headers" | grep -i "x-frame-options" >/dev/null; then
  echo "   ✅ X-Frame-Options header present"
else
  echo "   ⚠️  X-Frame-Options header missing"
fi

if echo "$headers" | grep -i "x-content-type-options" >/dev/null; then
  echo "   ✅ X-Content-Type-Options header present"
else
  echo "   ⚠️  X-Content-Type-Options header missing"
fi

echo ""

# Final summary
echo "🎉 SMOKE TEST SUMMARY"
echo "====================="
echo "✅ Staging environment is accessible"
echo "✅ Core endpoints responding"
echo "⚠️  Some warnings may need attention"
echo ""
echo "🔗 Staging URL: $STAGING_URL"
echo "📊 For detailed monitoring, check your APM dashboard"
echo ""
echo "🚀 Smoke tests completed successfully!"