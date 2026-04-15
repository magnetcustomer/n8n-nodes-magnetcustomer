#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SCRIPT_DIR/config/e2e.config.json"

# n8n 2.x owner credentials (password must have uppercase + number)
N8N_EMAIL="e2e@magnetcustomer.com"
N8N_PASSWORD="<E2E_PASSWORD>"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ------------------------------------------------------------------ prereqs

if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}Config not found: $CONFIG_FILE${NC}"
  echo -e "${YELLOW}Run: cp e2e/config/e2e.config.example.json e2e/config/e2e.config.json${NC}"
  echo -e "${YELLOW}Then fill in magnetCustomer credentials (apiUrl, clientId, clientSecret)${NC}"
  exit 1
fi

# ------------------------------------------------------------------ build

echo -e "${YELLOW}[1/6] Building node...${NC}"
cd "$ROOT_DIR" && npm run build

# ------------------------------------------------------------------ docker

echo -e "${YELLOW}[2/6] Starting n8n container...${NC}"
cd "$SCRIPT_DIR" && docker compose up -d --build

echo -e "${YELLOW}[3/6] Waiting for n8n health...${NC}"
N8N_URL="http://localhost:5678"
RETRIES=60
for i in $(seq 1 $RETRIES); do
  if curl -sf "$N8N_URL/healthz" > /dev/null 2>&1; then
    echo -e "${GREEN}  n8n healthy after ${i}s${NC}"
    break
  fi
  if [ "$i" -eq "$RETRIES" ]; then
    echo -e "${RED}  n8n failed to start after ${RETRIES}s${NC}"
    docker compose logs
    exit 1
  fi
  sleep 1
done

# ------------------------------------------------------------------ owner

echo -e "${YELLOW}[4/6] Setting up owner account...${NC}"
SETUP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$N8N_URL/rest/owner/setup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$N8N_EMAIL\",\"password\":\"$N8N_PASSWORD\",\"firstName\":\"E2E\",\"lastName\":\"Test\"}" 2>/dev/null || echo "000")

if [ "$SETUP_CODE" = "200" ]; then
  echo -e "${GREEN}  Owner created${NC}"
elif [ "$SETUP_CODE" = "400" ] || [ "$SETUP_CODE" = "409" ]; then
  echo -e "${GREEN}  Owner already exists${NC}"
else
  echo -e "${RED}  Owner setup failed (HTTP $SETUP_CODE)${NC}"
fi

# Login — n8n 2.x uses emailOrLdapLoginId
# Use -D file to capture headers separately from body (mixing with -D - is unreliable)
curl -s -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -D /tmp/n8n-e2e-login-headers.txt \
  -o /dev/null \
  -d "{\"emailOrLdapLoginId\":\"$N8N_EMAIL\",\"password\":\"$N8N_PASSWORD\"}"

COOKIE=$(grep -i 'set-cookie' /tmp/n8n-e2e-login-headers.txt 2>/dev/null | head -1 | sed 's/[Ss]et-[Cc]ookie: //' | sed 's/;.*//')
rm -f /tmp/n8n-e2e-login-headers.txt

if [ -z "$COOKIE" ]; then
  echo -e "${RED}  Login failed — cannot generate API key${NC}"
  exit 1
fi
echo -e "${GREEN}  Login OK${NC}"

# ------------------------------------------------------------------ API key

echo -e "${YELLOW}[5/6] Generating API key...${NC}"

# n8n 2.x /rest/api-keys requires: label, scopes (array), expiresAt (epoch ms)
EXPIRES=$(python3 -c "import time; print(int((time.time() + 365*86400) * 1000))")
SCOPES='["workflow:list","workflow:read","workflow:create","workflow:update","workflow:delete","execution:list","execution:read"]'

API_KEY_RESPONSE=$(curl -sf -X POST "$N8N_URL/rest/api-keys" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d "{\"label\":\"e2e-$(date +%s)\",\"scopes\":$SCOPES,\"expiresAt\":$EXPIRES}" 2>/dev/null || echo "")

API_KEY=$(echo "$API_KEY_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('rawApiKey',''))" 2>/dev/null || echo "")

# If creation failed, try listing existing keys
if [ -z "$API_KEY" ]; then
  echo -e "${YELLOW}  Trying to list existing keys...${NC}"
  API_KEY=$(curl -sf "$N8N_URL/rest/api-keys" \
    -H "Cookie: $COOKIE" 2>/dev/null \
    | python3 -c "
import sys,json
d = json.load(sys.stdin)
keys = d.get('data', d if isinstance(d, list) else [])
# rawApiKey is only available at creation, not listing
# If keys exist, user needs to recreate the container
if keys:
    print('EXISTS_BUT_MASKED')
else:
    print('')
" 2>/dev/null || echo "")

  if [ "$API_KEY" = "EXISTS_BUT_MASKED" ]; then
    echo -e "${YELLOW}  API key exists but is masked. Recreate container to get a new one:${NC}"
    echo -e "${YELLOW}    npm run e2e:infra:stop && npm run e2e:infra:start${NC}"
    exit 1
  fi
fi

if [ -z "$API_KEY" ]; then
  echo -e "${RED}  Failed to generate API key${NC}"
  exit 1
fi

# Save to config
python3 << PYEOF
import json
with open('$CONFIG_FILE') as f: cfg = json.load(f)
cfg['n8n']['apiKey'] = """$API_KEY"""
with open('$CONFIG_FILE', 'w') as f: json.dump(cfg, f, indent=2)
PYEOF
echo -e "${GREEN}  API key saved to config${NC}"

# Test API key
TEST_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" 2>/dev/null || echo "000")
if [ "$TEST_CODE" = "200" ]; then
  echo -e "${GREEN}  API key verified${NC}"
else
  echo -e "${RED}  API key test failed (HTTP $TEST_CODE)${NC}"
  exit 1
fi

# ------------------------------------------------------------------ credential

echo -e "${YELLOW}[6/6] Provisioning MagnetCustomer credential...${NC}"
MC_SUB_DOMAIN=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['magnetCustomer']['subDomainAccount'])")
MC_CLIENT_SECRET=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['magnetCustomer']['clientSecret'])")

# Use internal REST (cookie-based) since public API may lack credential:create scope
CRED_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$N8N_URL/rest/credentials" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"MagnetCustomer E2E\",
    \"type\": \"magnetCustomerApi\",
    \"data\": {
      \"subDomainAccount\": \"$MC_SUB_DOMAIN\",
      \"email\": \"\",
      \"apiToken\": \"$MC_CLIENT_SECRET\"
    }
  }" 2>/dev/null || echo "000")

if [ "$CRED_CODE" = "200" ]; then
  echo -e "${GREEN}  Credential created${NC}"
elif [ "$CRED_CODE" = "409" ]; then
  echo -e "${GREEN}  Credential already exists${NC}"
else
  echo -e "${YELLOW}  Credential creation returned HTTP $CRED_CODE (may already exist)${NC}"
fi

# ------------------------------------------------------------------ community package

echo -e "${YELLOW}[7/7] Installing MagnetCustomer node...${NC}"
INSTALL_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$N8N_URL/rest/community-packages" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"name":"@magnetcustomer/n8n-nodes-magnetcustomer"}' 2>/dev/null || echo "000")

if [ "$INSTALL_CODE" = "200" ]; then
  echo -e "${GREEN}  Node installed from npm${NC}"
elif [ "$INSTALL_CODE" = "409" ]; then
  echo -e "${GREEN}  Node already installed${NC}"
else
  echo -e "${YELLOW}  Node install returned HTTP $INSTALL_CODE (may already be installed)${NC}"
fi

# ------------------------------------------------------------------ done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  n8n E2E Ready!${NC}"
echo -e "${GREEN}  URL: $N8N_URL${NC}"
echo -e "${GREEN}  API Key: ${API_KEY:0:15}...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Run tests:  npm run test:e2e"
echo "Stop:       npm run e2e:infra:stop"
