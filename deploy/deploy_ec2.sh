#!/usr/bin/env bash
# =============================================================================
#  deploy_ec2.sh — AI Interview System · AWS EC2 Master Deployment Script
#  Target : Ubuntu 22.04/24.04 LTS · t3.micro (1 GB RAM)
#  Run as : sudo bash deploy_ec2.sh
# =============================================================================
set -euo pipefail
IFS=$'\n\t'

# ─── Colours ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✔]${NC} $*"; }
info() { echo -e "${BLUE}[i]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✘]${NC} $*" >&2; }
step() { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"; \
         echo -e "${BOLD}${CYAN}  $*${NC}"; \
         echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"; }

# ─── Config ───────────────────────────────────────────────────────────────────
REPO_URL="https://github.com/manikanta-devs/mca-final-project.git"
APP_DIR="/opt/ai-interview-system"
APP_USER="appuser"
DOMAIN="18.61.78.226"          # swap to your domain if you have one
SWAP_SIZE="2G"
PYTHON_MIN="3.10"
NODE_MIN="18"

# ─── Root check ───────────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  err "Please run as root:  sudo bash deploy_ec2.sh"
  exit 1
fi

echo -e "${BOLD}${CYAN}"
cat <<'BANNER'
  ___  ___   ___ ___ _   _ _____   ___  ___ ___ _    _____   __
 |   \| __| | _ \ _ \ | | |_   _| |   \| __| _ \ |  / _ \ \ / /
 | |) | _|  |  _/  _/ |_| | | |   | |) | _||  _/ |_| (_) \ V /
 |___/|___| |_| |_|  \___/  |_|   |___/|___|_| |____\___/ |_|

         AI Interview System · EC2 Production Deployment
BANNER
echo -e "${NC}"

# =============================================================================
# STEP 1 — COLLECT SECRETS UPFRONT (non-interactive for CI: set env vars before running)
# =============================================================================
step "STEP 1 — Collecting environment secrets"

prompt_secret() {
  local VAR_NAME="$1"; local DESCRIPTION="$2"; local DEFAULT="${3:-}"
  if [[ -n "${!VAR_NAME:-}" ]]; then
    log "$VAR_NAME already set via environment — skipping prompt."
    return
  fi
  if [[ -n "$DEFAULT" ]]; then
    read -rp "$(echo -e "${YELLOW}[?]${NC} $DESCRIPTION [default: $DEFAULT]: ")" val
    val="${val:-$DEFAULT}"
  else
    while true; do
      read -rsp "$(echo -e "${YELLOW}[?]${NC} $DESCRIPTION (required, input hidden): ")" val
      echo
      [[ -n "$val" ]] && break
      warn "  This value cannot be empty."
    done
  fi
  export "$VAR_NAME"="$val"
}

prompt_secret GEMINI_API_KEY   "Google Gemini API Key"
prompt_secret JWT_SECRET       "JWT Secret (random string, ≥ 32 chars)" \
  "$(openssl rand -hex 32)"
prompt_secret SECRET_KEY       "Flask Secret Key (random string, ≥ 32 chars)" \
  "$(openssl rand -hex 32)"
prompt_secret OPENAI_API_KEY   "OpenAI API Key (press Enter to skip if unused)" ""

log "All required secrets collected."

# =============================================================================
# STEP 2 — SYSTEM SETUP
# =============================================================================
step "STEP 2 — System update & tool installation"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  curl wget git unzip zip \
  build-essential libssl-dev libffi-dev \
  python3 python3-pip python3-venv python3-dev \
  nginx ufw fail2ban \
  htop tmux jq \
  ca-certificates gnupg lsb-release

log "System packages installed."

# ─── Enable swap (critical for 1 GB t3.micro) ─────────────────────────────────
step "STEP 2a — Enabling ${SWAP_SIZE} swap"
if [[ ! -f /swapfile ]]; then
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  log "Swap enabled: $(free -h | grep Swap)"
else
  log "Swap already configured."
fi

# =============================================================================
# STEP 3 — INSTALL NODE.JS (via NodeSource)
# =============================================================================
step "STEP 3 — Installing Node.js ${NODE_MIN}"
if ! command -v node &>/dev/null || \
   [[ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt "$NODE_MIN" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MIN}.x | bash -
  apt-get install -y nodejs
fi
log "Node $(node -v) · npm $(npm -v)"

# =============================================================================
# STEP 4 — INSTALL DOCKER & DOCKER COMPOSE
# =============================================================================
step "STEP 4 — Installing Docker"
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi
log "Docker $(docker --version)"
log "Docker Compose $(docker compose version)"

# =============================================================================
# STEP 5 — CREATE APP USER & CLONE REPO
# =============================================================================
step "STEP 5 — App user and repository"

if ! id "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
  usermod -aG docker "$APP_USER"
  log "Created user: $APP_USER"
fi

if [[ -d "$APP_DIR/.git" ]]; then
  info "Repository already cloned — pulling latest."
  git -C "$APP_DIR" pull --ff-only || true
else
  info "Cloning $REPO_URL → $APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
log "Repository ready at $APP_DIR"

# =============================================================================
# STEP 6 — GENERATE .env FILES
# =============================================================================
step "STEP 6 — Generating environment configuration"

# Backend .env
cat > "$APP_DIR/backend/.env" <<EOF
# ── Auto-generated by deploy_ec2.sh ──────────────────
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=${SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY:-}

# Database (SQLite by default; swap for Postgres if you add it)
DATABASE_URL=sqlite:///app.db

# CORS — allow the public IP / domain
CORS_ORIGINS=http://${DOMAIN},https://${DOMAIN}

# Worker limits (conservative for t3.micro)
GUNICORN_WORKERS=2
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=120
EOF
chmod 600 "$APP_DIR/backend/.env"

# Frontend .env
cat > "$APP_DIR/frontend/.env" <<EOF
# ── Auto-generated by deploy_ec2.sh ──────────────────
VITE_API_URL=/api
VITE_APP_TITLE=AI Interview System
NODE_ENV=production
EOF

# Root .env (Docker Compose reads this)
cat > "$APP_DIR/.env" <<EOF
GEMINI_API_KEY=${GEMINI_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
SECRET_KEY=${SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
DOMAIN=${DOMAIN}
EOF
chmod 600 "$APP_DIR/.env"

log ".env files generated."

# =============================================================================
# STEP 7 — DETECT DEPLOYMENT STRATEGY
# =============================================================================
step "STEP 7 — Detecting deployment strategy"

USE_DOCKER=false
if [[ -f "$APP_DIR/docker-compose.yml" ]] || \
   [[ -f "$APP_DIR/docker-compose.yaml" ]]; then
  USE_DOCKER=true
  info "Docker Compose file found — attempting Docker deployment first."
fi

# =============================================================================
# STEP 8A — DOCKER COMPOSE DEPLOYMENT (preferred)
# =============================================================================
docker_deploy() {
  step "STEP 8A — Docker Compose deployment"

  local COMPOSE_FILE=""
  [[ -f "$APP_DIR/docker-compose.yml"  ]] && COMPOSE_FILE="$APP_DIR/docker-compose.yml"
  [[ -f "$APP_DIR/docker-compose.yaml" ]] && COMPOSE_FILE="$APP_DIR/docker-compose.yaml"

  # Patch compose file: skip heavy ML services on t3.micro
  info "Checking for heavy ML services (SadTalker, Wav2Lip) — will disable on t3.micro."
  SKIP_SERVICES=("sadtalker" "wav2lip" "celery_worker_gpu")
  COMPOSE_OVERRIDE="$APP_DIR/docker-compose.override.yml"

  cat > "$COMPOSE_OVERRIDE" <<'OVERRIDE'
# Auto-generated override — disables GPU/ML services on t3.micro
services:
OVERRIDE

  for svc in "${SKIP_SERVICES[@]}"; do
    if grep -q "$svc" "$COMPOSE_FILE" 2>/dev/null; then
      warn "Disabling heavy service: $svc"
      cat >> "$COMPOSE_OVERRIDE" <<SVCBLOCK
  ${svc}:
    deploy:
      replicas: 0
    profiles:
      - disabled
SVCBLOCK
    fi
  done

  cd "$APP_DIR"
  info "Pulling/building images…"
  docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" pull --ignore-pull-failures 2>/dev/null || true
  docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" build \
    --build-arg GEMINI_API_KEY="${GEMINI_API_KEY}" \
    --no-cache 2>&1 | grep -v "^#" || true

  info "Starting services…"
  docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" up -d \
    --remove-orphans \
    --force-recreate

  sleep 10
  docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" ps

  # Quick health check
  local retries=0
  while [[ $retries -lt 12 ]]; do
    if curl -sf "http://localhost:5000/health" &>/dev/null || \
       curl -sf "http://localhost:5000/api/health" &>/dev/null; then
      log "Backend health check passed."
      break
    fi
    info "Waiting for backend… ($retries/12)"
    sleep 5
    (( retries++ ))
  done

  if [[ $retries -ge 12 ]]; then
    warn "Backend health check timed out. Falling back to manual deployment."
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" down 2>/dev/null || true
    return 1
  fi

  # Create systemd unit to auto-restart Docker Compose on reboot
  cat > /etc/systemd/system/ai-interview.service <<UNIT
[Unit]
Description=AI Interview System (Docker Compose)
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/docker compose -f ${COMPOSE_FILE} -f ${COMPOSE_OVERRIDE} up -d --remove-orphans
ExecStop=/usr/bin/docker compose -f ${COMPOSE_FILE} -f ${COMPOSE_OVERRIDE} down
TimeoutStartSec=300
User=root

[Install]
WantedBy=multi-user.target
UNIT

  systemctl daemon-reload
  systemctl enable ai-interview
  log "Docker Compose deployment complete — systemd service enabled."
  return 0
}

# =============================================================================
# STEP 8B — MANUAL DEPLOYMENT (fallback)
# =============================================================================
manual_deploy() {
  step "STEP 8B — Manual deployment (Flask + Gunicorn + Nginx)"

  # ── Backend: Python virtual environment + Gunicorn ──────────────────────────
  info "Setting up Python backend…"
  cd "$APP_DIR/backend"

  python3 -m venv .venv
  source .venv/bin/activate

  pip install --upgrade pip wheel
  if [[ -f requirements.txt ]]; then
    pip install -r requirements.txt
  fi

  # Install Gunicorn
  pip install gunicorn

  # Install spaCy model (en_core_web_sm, ~12 MB — safe on t3.micro)
  if python3 -c "import spacy; spacy.load('en_core_web_sm')" &>/dev/null 2>&1; then
    log "spaCy model already installed."
  else
    python3 -m spacy download en_core_web_sm || warn "spaCy model install failed — skipping."
  fi

  deactivate

  # Detect Flask entry point
  FLASK_APP="app.py"
  for candidate in app.py main.py run.py wsgi.py; do
    [[ -f "$APP_DIR/backend/$candidate" ]] && { FLASK_APP="$candidate"; break; }
  done
  FLASK_MODULE="${FLASK_APP%.py}:app"
  info "Flask entry point: $FLASK_MODULE"

  # ── Systemd: backend ─────────────────────────────────────────────────────────
  cat > /etc/systemd/system/ai-interview-backend.service <<UNIT
[Unit]
Description=AI Interview Backend (Gunicorn / Flask)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}/backend
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=${APP_DIR}/backend/.venv/bin/gunicorn \\
  --bind 127.0.0.1:5000 \\
  --workers 2 \\
  --threads 2 \\
  --timeout 120 \\
  --worker-class gthread \\
  --access-logfile /var/log/ai-interview-backend-access.log \\
  --error-logfile  /var/log/ai-interview-backend-error.log \\
  --capture-output \\
  --enable-stdio-inheritance \\
  ${FLASK_MODULE}
ExecReload=/bin/kill -s HUP \$MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

  touch /var/log/ai-interview-backend-access.log /var/log/ai-interview-backend-error.log
  chown "$APP_USER:$APP_USER" \
    /var/log/ai-interview-backend-access.log \
    /var/log/ai-interview-backend-error.log

  systemctl daemon-reload
  systemctl enable ai-interview-backend
  systemctl restart ai-interview-backend

  # Wait for backend
  local retries=0
  while [[ $retries -lt 12 ]]; do
    if curl -sf "http://127.0.0.1:5000/health" &>/dev/null || \
       curl -sf "http://127.0.0.1:5000/api/health" &>/dev/null || \
       curl -sf "http://127.0.0.1:5000/" &>/dev/null; then
      log "Backend is up on :5000"
      break
    fi
    info "Waiting for backend… ($retries/12)"
    sleep 5
    (( retries++ ))
  done
  [[ $retries -ge 12 ]] && warn "Backend did not respond — check logs: journalctl -u ai-interview-backend -n 50"

  # ── Frontend: Vite build ──────────────────────────────────────────────────────
  info "Building React frontend…"
  cd "$APP_DIR/frontend"
  npm ci --prefer-offline --no-audit 2>&1 | grep -v "^npm warn" || npm install
  npm run build 2>&1 | grep -v "^vite"
  log "Frontend built → $APP_DIR/frontend/dist"
}

# =============================================================================
# STEP 9 — NGINX REVERSE PROXY
# =============================================================================
configure_nginx() {
  step "STEP 9 — Configuring Nginx reverse proxy"

  # Resolve the actual static path
  local STATIC_ROOT="$APP_DIR/frontend/dist"
  [[ ! -d "$STATIC_ROOT" ]] && STATIC_ROOT="$APP_DIR/frontend/build"
  [[ ! -d "$STATIC_ROOT" ]] && STATIC_ROOT="/var/www/ai-interview"

  # If using Docker, frontend is served by the container — proxy to port 3000
  if $USE_DOCKER; then
    PROXY_FRONTEND="http://127.0.0.1:3000"
  fi

  cat > /etc/nginx/sites-available/ai-interview <<NGINX
# ── AI Interview System — Nginx config ─────────────────────────────────────
upstream flask_backend {
  server 127.0.0.1:5000;
  keepalive 16;
}

server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN} _;

  # Security headers
  add_header X-Frame-Options          "SAMEORIGIN"          always;
  add_header X-Content-Type-Options   "nosniff"             always;
  add_header X-XSS-Protection         "1; mode=block"       always;
  add_header Referrer-Policy          "strict-origin"       always;
  add_header Permissions-Policy       "camera=*, microphone=*" always;

  # Compression
  gzip on;
  gzip_comp_level 5;
  gzip_types text/plain text/css application/json
             application/javascript text/javascript
             application/x-font-ttf font/opentype;

  # Upload limit (resume PDFs)
  client_max_body_size 20M;

  # ── Backend: /api ──────────────────────────────────────────────────────────
  location /api/ {
    proxy_pass         http://flask_backend/api/;
    proxy_http_version 1.1;
    proxy_set_header   Host              \$host;
    proxy_set_header   X-Real-IP         \$remote_addr;
    proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto \$scheme;
    proxy_set_header   Connection        "";
    proxy_read_timeout 120s;
    proxy_connect_timeout 10s;
    proxy_send_timeout 120s;
  }

  # Also expose /health without prefix
  location = /health {
    proxy_pass http://flask_backend/health;
  }

  # ── Static uploads (if backend stores them locally) ─────────────────────
  location /uploads/ {
    alias ${APP_DIR}/backend/uploads/;
    expires 1d;
    add_header Cache-Control "public, no-transform";
  }

  location /interviewers/ {
    alias ${APP_DIR}/frontend/public/interviewers/;
    expires 7d;
    add_header Cache-Control "public, no-transform";
  }

NGINX

  if $USE_DOCKER && [[ -n "${PROXY_FRONTEND:-}" ]]; then
    cat >> /etc/nginx/sites-available/ai-interview <<NGINX_DOCKER
  # ── Frontend: proxy to Docker container ───────────────────────────────────
  location / {
    proxy_pass         ${PROXY_FRONTEND};
    proxy_http_version 1.1;
    proxy_set_header   Upgrade    \$http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host       \$host;
    try_files \$uri \$uri/ =404;
  }
NGINX_DOCKER
  else
    cat >> /etc/nginx/sites-available/ai-interview <<NGINX_STATIC
  # ── Frontend: static Vite build ────────────────────────────────────────────
  root ${STATIC_ROOT};
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
  }

  # Cache hashed assets forever
  location ~* \.(js|css|woff2?|ttf|ico|png|jpg|svg|webp|mp4)\$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
NGINX_STATIC
  fi

  echo "}" >> /etc/nginx/sites-available/ai-interview

  # Enable site
  ln -sf /etc/nginx/sites-available/ai-interview \
          /etc/nginx/sites-enabled/ai-interview
  rm -f /etc/nginx/sites-enabled/default

  nginx -t
  systemctl enable nginx
  systemctl reload nginx
  log "Nginx configured — serving on http://${DOMAIN}"
}

# =============================================================================
# STEP 10 — FIREWALL
# =============================================================================
configure_firewall() {
  step "STEP 10 — UFW firewall"
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp   comment 'SSH'
  ufw allow 80/tcp   comment 'HTTP'
  ufw allow 443/tcp  comment 'HTTPS'
  ufw --force enable
  log "Firewall rules applied:"
  ufw status numbered
}

# =============================================================================
# STEP 11 — VALIDATION
# =============================================================================
validate() {
  step "STEP 11 — Post-deployment validation"

  local BASE="http://${DOMAIN}"
  local ALL_PASS=true

  check() {
    local DESC="$1"; local URL="$2"; local EXPECT="${3:-200}"
    local STATUS
    STATUS=$(curl -so /dev/null -w "%{http_code}" --max-time 10 "$URL" 2>/dev/null || echo "000")
    if [[ "$STATUS" == "$EXPECT" ]] || [[ "$STATUS" == "200" ]] || \
       [[ "$STATUS" == "301" ]] || [[ "$STATUS" == "302" ]]; then
      log "  ✔  $DESC ($STATUS)"
    else
      warn "  ✘  $DESC — got HTTP $STATUS (expected $EXPECT)"
      ALL_PASS=false
    fi
  }

  check "Frontend loads"          "$BASE/"
  check "Backend /health"         "$BASE/health"
  check "Backend /api/health"     "$BASE/api/health"
  check "Resume upload endpoint"  "$BASE/api/resume/parse"   "405"
  check "Interview endpoint"      "$BASE/api/interview/generate" "401"

  if $ALL_PASS; then
    log "All validation checks passed!"
  else
    warn "Some checks failed — review the logs above."
  fi
}

# =============================================================================
# MAIN — Run everything
# =============================================================================
DEPLOY_OK=false

if $USE_DOCKER; then
  if docker_deploy; then
    DEPLOY_OK=true
    info "Docker Compose deployment succeeded."
  else
    warn "Docker deployment failed — falling back to manual deployment."
  fi
fi

if ! $DEPLOY_OK; then
  manual_deploy
  DEPLOY_OK=true
fi

configure_nginx
configure_firewall
validate

# =============================================================================
# FINAL REPORT
# =============================================================================
step "DEPLOYMENT COMPLETE"

echo -e "${BOLD}Public URL:${NC}    http://${DOMAIN}"
echo -e "${BOLD}App directory:${NC} ${APP_DIR}"
echo ""
echo -e "${BOLD}${CYAN}── Running services ───────────────────────────────────${NC}"
systemctl list-units --state=running --no-pager \
  | grep -E "nginx|docker|ai-interview" || true

echo ""
echo -e "${BOLD}${CYAN}── Open ports ─────────────────────────────────────────${NC}"
ss -tlnp | grep -E ":(80|443|22|5000|3000)\b" || true

echo ""
echo -e "${BOLD}${CYAN}── Docker containers ──────────────────────────────────${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true

echo ""
echo -e "${BOLD}${CYAN}── Memory ─────────────────────────────────────────────${NC}"
free -h

echo ""
echo -e "${BOLD}${CYAN}── Useful commands ────────────────────────────────────${NC}"
echo "  Nginx logs:    journalctl -u nginx -f"
echo "  Backend logs:  journalctl -u ai-interview-backend -f"
echo "  Docker logs:   docker compose logs -f"
echo "  Restart all:   systemctl restart ai-interview nginx"
echo ""
log "Done! Visit http://${DOMAIN} in your browser."
