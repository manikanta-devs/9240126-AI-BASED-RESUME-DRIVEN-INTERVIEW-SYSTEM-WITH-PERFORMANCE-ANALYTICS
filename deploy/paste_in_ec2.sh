#!/usr/bin/env bash
# ── Paste this ENTIRE block into the EC2 Instance Connect terminal ──
# It will ask for your GEMINI_API_KEY, then deploy everything automatically.

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AI Interview System — EC2 Auto-Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Collect secrets ────────────────────────────────────────────────
read -rsp ">> Enter your GEMINI_API_KEY: " GEMINI_API_KEY; echo
JWT_SECRET=$(openssl rand -hex 32)
SECRET_KEY=$(openssl rand -hex 32)
echo "✔ Secrets ready."

# ── 2. Swap (2 GB) — prevents OOM on 1 GB t3.micro ───────────────────
if [[ ! -f /swapfile ]]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "✔ 2 GB swap enabled."
fi

# ── 3. System packages ────────────────────────────────────────────────
echo ">> Installing system packages..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -yq
sudo apt-get install -yq \
  git curl wget build-essential \
  python3 python3-pip python3-venv python3-dev \
  nginx ufw unzip ca-certificates gnupg lsb-release

# ── 4. Node.js 20 ─────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -yq nodejs
fi
echo "✔ Node $(node -v)"

# ── 5. Docker ─────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update -yq
  sudo apt-get install -yq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker ubuntu
fi
echo "✔ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# ── 6. Clone repo ─────────────────────────────────────────────────────
APP_DIR="/opt/ai-interview-system"
if [[ -d "$APP_DIR/.git" ]]; then
  echo ">> Pulling latest..."
  sudo git -C "$APP_DIR" pull --ff-only 2>/dev/null || true
else
  echo ">> Cloning repository..."
  sudo git clone https://github.com/manikanta-devs/mca-final-project.git "$APP_DIR"
fi
sudo chown -R ubuntu:ubuntu "$APP_DIR"
echo "✔ Repo ready at $APP_DIR"

# ── 7. Environment files ──────────────────────────────────────────────
echo ">> Writing .env files..."
sudo tee "$APP_DIR/backend/.env" > /dev/null <<ENV
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=${SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
CORS_ORIGINS=http://18.61.78.226
GUNICORN_WORKERS=2
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=120
DATABASE_URL=sqlite:///app.db
ENV
sudo chmod 600 "$APP_DIR/backend/.env"

sudo tee "$APP_DIR/frontend/.env" > /dev/null <<FENV
VITE_API_URL=/api
NODE_ENV=production
VITE_APP_TITLE=AI Interview System
FENV

sudo tee "$APP_DIR/.env" > /dev/null <<RENV
GEMINI_API_KEY=${GEMINI_API_KEY}
SECRET_KEY=${SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
RENV
sudo chmod 600 "$APP_DIR/.env"
echo "✔ .env files written."

# ── 8. Try Docker Compose first ───────────────────────────────────────
DEPLOY_METHOD="manual"
if [[ -f "$APP_DIR/docker-compose.yml" ]] || [[ -f "$APP_DIR/docker-compose.yaml" ]]; then
  echo ">> Docker Compose found — trying Docker deployment..."

  # Override to disable heavy ML services
  sudo tee "$APP_DIR/docker-compose.override.yml" > /dev/null <<'OVERRIDE'
services:
  sadtalker:
    profiles: [disabled]
  wav2lip:
    profiles: [disabled]
OVERRIDE

  cd "$APP_DIR"
  sudo docker compose up -d --build --remove-orphans 2>&1 | tail -20 || true

  sleep 15
  if curl -sf http://localhost:5000/health &>/dev/null || \
     curl -sf http://localhost:5000/api/health &>/dev/null || \
     curl -sf http://localhost:5000/ &>/dev/null; then
    DEPLOY_METHOD="docker"
    echo "✔ Docker Compose deployment successful!"
  else
    echo "! Docker health check failed — switching to manual deploy."
    sudo docker compose down 2>/dev/null || true
  fi
fi

# ── 9. Manual deploy (Flask + Gunicorn + Vite build) ──────────────────
if [[ "$DEPLOY_METHOD" == "manual" ]]; then
  echo ">> Manual deployment starting..."

  # Backend
  cd "$APP_DIR/backend"
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip -q
  [[ -f requirements.txt ]] && pip install -r requirements.txt -q
  pip install gunicorn -q
  python3 -m spacy download en_core_web_sm 2>/dev/null || true
  deactivate

  # Detect Flask entry point
  FLASK_APP="app.py"
  for f in app.py main.py run.py wsgi.py; do
    [[ -f "$APP_DIR/backend/$f" ]] && { FLASK_APP="$f"; break; }
  done
  FLASK_MODULE="${FLASK_APP%.py}:app"

  # Systemd backend service
  sudo tee /etc/systemd/system/ai-interview-backend.service > /dev/null <<UNIT
[Unit]
Description=AI Interview Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=${APP_DIR}/backend
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=${APP_DIR}/backend/.venv/bin/gunicorn \
  --bind 127.0.0.1:5000 \
  --workers 2 \
  --threads 2 \
  --timeout 120 \
  --worker-class gthread \
  --log-level info \
  ${FLASK_MODULE}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

  sudo systemctl daemon-reload
  sudo systemctl enable --now ai-interview-backend
  echo "✔ Backend service started."

  # Frontend
  echo ">> Building React frontend..."
  cd "$APP_DIR/frontend"
  npm ci --silent 2>/dev/null || npm install --silent
  npm run build
  echo "✔ Frontend built."
fi

# ── 10. Nginx config ──────────────────────────────────────────────────
echo ">> Configuring Nginx..."

# Determine static root
STATIC_ROOT="$APP_DIR/frontend/dist"
[[ ! -d "$STATIC_ROOT" ]] && STATIC_ROOT="$APP_DIR/frontend/build"

# Detect backend port from Docker or manual
BACKEND_PORT="5000"
if [[ "$DEPLOY_METHOD" == "docker" ]]; then
  BACKEND_PORT=$(sudo docker compose -f "$APP_DIR/docker-compose.yml" \
    port backend 5000 2>/dev/null | cut -d: -f2 || echo "5000")
fi

sudo tee /etc/nginx/sites-available/ai-interview > /dev/null <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  client_max_body_size 20M;
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Permissions-Policy "camera=*, microphone=*" always;

  # API → Flask backend
  location /api/ {
    proxy_pass         http://127.0.0.1:${BACKEND_PORT}/api/;
    proxy_http_version 1.1;
    proxy_set_header   Host \$host;
    proxy_set_header   X-Real-IP \$remote_addr;
    proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_read_timeout 120s;
  }

  location = /health {
    proxy_pass http://127.0.0.1:${BACKEND_PORT}/health;
  }

  # Static video/audio assets
  location /interviewers/ {
    alias ${APP_DIR}/frontend/public/interviewers/;
    expires 7d;
  }

  # React SPA
  root ${STATIC_ROOT};
  index index.html;
  location / {
    try_files \$uri \$uri/ /index.html;
  }

  location ~* \.(js|css|woff2?|ttf|ico|png|jpg|svg|webp|mp4)\$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/ai-interview \
            /etc/nginx/sites-enabled/ai-interview
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl enable --now nginx && sudo systemctl reload nginx
echo "✔ Nginx configured."

# ── 11. Firewall ──────────────────────────────────────────────────────
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "✔ Firewall: ports 22/80/443 open."

# ── 12. Validate ──────────────────────────────────────────────────────
echo ""
echo ">> Waiting 15s for services to stabilise..."
sleep 15

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check() {
  local desc="$1" url="$2"
  local code
  code=$(curl -so /dev/null -w "%{http_code}" --max-time 8 "$url" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|401|405)$ ]]; then
    echo "  ✔  $desc → HTTP $code"
  else
    echo "  ✘  $desc → HTTP $code (may need attention)"
  fi
}
check "Frontend"          "http://127.0.0.1/"
check "Backend /health"   "http://127.0.0.1/health"
check "Backend /api"      "http://127.0.0.1/api/health"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYMENT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Method  : $DEPLOY_METHOD"
echo "  URL     : http://18.61.78.226"
echo "  App dir : $APP_DIR"
echo ""
echo "  Useful commands:"
echo "  Backend logs : sudo journalctl -u ai-interview-backend -f"
echo "  Nginx logs   : sudo journalctl -u nginx -f"
echo "  Docker logs  : cd $APP_DIR && sudo docker compose logs -f"
echo "  Memory       : free -h"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Done! Visit: http://18.61.78.226"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
