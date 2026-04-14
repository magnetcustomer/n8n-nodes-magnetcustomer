#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SCRIPT_DIR/config/e2e.config.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}[1/6] Building node...${NC}"
cd "$ROOT_DIR" && npm run build

echo -e "${YELLOW}[2/6] Starting n8n container...${NC}"
cd "$SCRIPT_DIR" && docker compose up -d --build

echo -e "${YELLOW}[3/6] Waiting for n8n health...${NC}"
N8N_URL="http://localhost:5678"
RETRIES=60
for i in $(seq 1 $RETRIES); do
  if curl -sf "$N8N_URL/healthz" > /dev/null 2>&1; then
    echo -e "${GREEN}n8n is healthy${NC}"
    break
  fi
  if [ "$i" -eq "$RETRIES" ]; then
    echo -e "${RED}n8n failed to start after ${RETRIES}s${NC}"
    docker compose logs
    exit 1
  fi
  sleep 1
done

echo -e "${YELLOW}[4/6] Setting up owner account...${NC}"
OWNER_RESPONSE=$(curl -sf -X POST "$N8N_URL/rest/owner/setup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e2e@magnetcustomer.com",
    "password": "<E2E_PASSWORD>",
    "firstName": "E2E",
    "lastName": "Test"
  }' 2>/dev/null) || echo "Owner already exists, skipping"

# Extract cookie for authenticated requests
COOKIE=$(curl -sf -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -D - \
  -d '{"email":"e2e@magnetcustomer.com","password":"<E2E_PASSWORD>"}' \
  2>/dev/null | grep -i 'set-cookie' | head -1 | sed 's/.*: //' | sed 's/;.*//')

echo -e "${YELLOW}[5/6] Generating API key...${NC}"
API_KEY_RESPONSE=$(curl -sf -X POST "$N8N_URL/api/v1/api-keys" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"label":"e2e-test"}' 2>/dev/null)

API_KEY=$(echo "$API_KEY_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('apiKey',''))" 2>/dev/null || echo "")

if [ -z "$API_KEY" ]; then
  echo -e "${YELLOW}API key may already exist, trying to list...${NC}"
  API_KEY=$(curl -sf "$N8N_URL/api/v1/api-keys" \
    -H "Cookie: $COOKIE" 2>/dev/null \
    | python3 -c "import sys,json; keys=json.load(sys.stdin); print(keys[0]['apiKey'] if keys else '')" 2>/dev/null || echo "")
fi

if [ -z "$API_KEY" ]; then
  echo -e "${RED}Failed to get API key${NC}"
  exit 1
fi

# Update config with API key
if [ -f "$CONFIG_FILE" ]; then
  python3 -c "
import json
with open('$CONFIG_FILE') as f: cfg = json.load(f)
cfg['n8n']['apiKey'] = '$API_KEY'
with open('$CONFIG_FILE', 'w') as f: json.dump(cfg, f, indent=2)
"
  echo -e "${GREEN}API key saved to config${NC}"
else
  echo -e "${RED}Config file not found: $CONFIG_FILE${NC}"
  echo -e "${YELLOW}Copy e2e.config.example.json to e2e.config.json and fill magnetCustomer credentials${NC}"
  exit 1
fi

echo -e "${YELLOW}[6/6] Provisioning MagnetCustomer credential in n8n...${NC}"
MC_SUB_DOMAIN=$(python3 -c "import json; cfg=json.load(open('$CONFIG_FILE')); print(cfg['magnetCustomer']['subDomainAccount'])")
MC_CLIENT_ID=$(python3 -c "import json; cfg=json.load(open('$CONFIG_FILE')); print(cfg['magnetCustomer']['clientId'])")
MC_CLIENT_SECRET=$(python3 -c "import json; cfg=json.load(open('$CONFIG_FILE')); print(cfg['magnetCustomer']['clientSecret'])")

curl -sf -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"MagnetCustomer E2E\",
    \"type\": \"magnetCustomerApi\",
    \"data\": {
      \"subDomainAccount\": \"$MC_SUB_DOMAIN\",
      \"email\": \"\",
      \"apiToken\": \"$MC_CLIENT_SECRET\"
    }
  }" > /dev/null 2>&1 || echo "Credential may already exist"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} n8n E2E Ready!${NC}"
echo -e "${GREEN} URL: $N8N_URL${NC}"
echo -e "${GREEN} API Key: ${API_KEY:0:10}...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Run tests:  npm run test:e2e"
echo "Stop:       npm run e2e:infra:stop"
