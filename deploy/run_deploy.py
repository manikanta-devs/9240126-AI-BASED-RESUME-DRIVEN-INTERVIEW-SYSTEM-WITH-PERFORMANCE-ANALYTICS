"""
run_deploy.py — Launches the automated EC2 deployment with pre-loaded credentials.
Run: python deploy/run_deploy.py
"""
import os, sys, time, tempfile, textwrap, getpass, re, secrets

# ── Credentials (dynamic) ───────────────────────────────────────────────────
AWS_ACCESS_KEY    = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
AWS_SECRET_KEY    = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
EC2_IP            = os.getenv("EC2_IP", "18.61.78.226").strip()
EC2_USER          = os.getenv("EC2_USER", "ubuntu").strip()
INSTANCE_ID       = os.getenv("INSTANCE_ID", "i-09e28dd8e1b08c7e4").strip()
REGION            = os.getenv("REGION", "ap-south-2").strip()
AZ                = os.getenv("AZ", "ap-south-2a").strip()

if not AWS_ACCESS_KEY:
    AWS_ACCESS_KEY = input(f"AWS Access Key ID (AKIA...): ").strip()
if not AWS_SECRET_KEY:
    AWS_SECRET_KEY = getpass.getpass(f"AWS Secret Access Key (hidden): ").strip()

# Load local API keys dynamically
def get_local_env_var(key_name, default=""):
    try:
        # Check backend/.env in current workspace
        env_path = os.path.join("backend", ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() == key_name:
                            return v.strip().strip('"').strip("'")
    except Exception:
        pass
    return default

GEMINI_API_KEY      = get_local_env_var("GEMINI_API_KEY", "")
HUGGINGFACE_API_KEY = get_local_env_var("HUGGINGFACE_API_KEY", "")
GROQ_API_KEY        = get_local_env_var("GROQ_API_KEY", "")
OPENROUTER_API_KEY  = get_local_env_var("OPENROUTER_API_KEY", "")
MISTRAL_API_KEY     = get_local_env_var("MISTRAL_API_KEY", "")
DEEPSEEK_API_KEY    = get_local_env_var("DEEPSEEK_API_KEY", "")

JWT_SECRET        = secrets.token_hex(32)
SECRET_KEY        = secrets.token_hex(32)


# ── Colours ──────────────────────────────────────────────────────────────────
G="\033[92m"; C="\033[96m"; Y="\033[93m"; R="\033[91m"; B="\033[1m"; N="\033[0m"
def log(m):  print(f"{G}[✔]{N} {m}", flush=True)
def info(m): print(f"{C}[→]{N} {m}", flush=True)
def warn(m): print(f"{Y}[!]{N} {m}", flush=True)
def err(m):  print(f"{R}[✘]{N} {m}", flush=True); sys.exit(1)

# ── Imports ───────────────────────────────────────────────────────────────────
try:
    import boto3
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.backends import default_backend
    import paramiko
except ImportError as e:
    err(f"Missing dep: {e}. Run: pip install boto3 paramiko cryptography")

# ── Banner ────────────────────────────────────────────────────────────────────
print(f"""
{B}{C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{N}
{B}  AI Interview System — Automated EC2 Deployment{N}
{B}  Instance : {EC2_IP}  ({INSTANCE_ID}){N}
{B}  Region   : {REGION} (Hyderabad){N}
{B}{C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{N}
""")

# ── Step 1: Generate temp SSH key pair ────────────────────────────────────────
info("[1/4] Generating temporary RSA SSH key pair...")
private_key_obj = rsa.generate_private_key(
    public_exponent=65537, key_size=2048, backend=default_backend()
)
private_pem = private_key_obj.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.OpenSSH,
    encryption_algorithm=serialization.NoEncryption()
)
public_key_openssh = private_key_obj.public_key().public_bytes(
    encoding=serialization.Encoding.OpenSSH,
    format=serialization.PublicFormat.OpenSSH
).decode("utf-8")
log("Temporary RSA-2048 key pair generated.")

# ── Step 2: Push public key via EC2 Instance Connect ─────────────────────────
info("[2/4] Pushing temporary public key to EC2 via Instance Connect API...")
info("Key is valid for 60 seconds — SSH will connect immediately after.")
try:
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=REGION
    )
    eic = session.client("ec2-instance-connect")
    resp = eic.send_ssh_public_key(
        InstanceId=INSTANCE_ID,
        InstanceOSUser=EC2_USER,
        SSHPublicKey=public_key_openssh,
        AvailabilityZone=AZ
    )
    if resp.get("Success"):
        log(f"Public key pushed! RequestId: {resp['RequestId']}")
    else:
        err(f"Key push failed: {resp}")
except Exception as e:
    err(f"EC2 Instance Connect error: {e}")

# ── Step 3: Build deploy script ───────────────────────────────────────────────
DEPLOY_SCRIPT = f"""#!/usr/bin/env bash
set -euo pipefail
GEMINI_API_KEY='{GEMINI_API_KEY}'
HUGGINGFACE_API_KEY='{HUGGINGFACE_API_KEY}'
GROQ_API_KEY='{GROQ_API_KEY}'
OPENROUTER_API_KEY='{OPENROUTER_API_KEY}'
MISTRAL_API_KEY='{MISTRAL_API_KEY}'
DEEPSEEK_API_KEY='{DEEPSEEK_API_KEY}'
JWT_SECRET='{JWT_SECRET}'
SECRET_KEY='{SECRET_KEY}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AI Interview System — EC2 Backend Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# [A] Swap
echo "[A] Setting up 2GB swap..."
if [[ ! -f /swapfile ]]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile > /dev/null
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
  sudo sysctl vm.swappiness=10 > /dev/null
  echo "  ✔ 2GB swap active"
else
  echo "  ✔ Swap already configured"
fi

# [B] System packages
echo "[B] Installing system packages..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -yq 2>/dev/null
sudo apt-get install -yq git curl python3 python3-pip python3-venv python3-dev \\
  build-essential libssl-dev libffi-dev nginx ufw ca-certificates 2>/dev/null
echo "  ✔ System packages ready"

# [C] Node.js 20
echo "[C] Installing Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null
  sudo apt-get install -yq nodejs 2>/dev/null
fi
echo "  ✔ Node $(node -v)"

# [D] Clone/update repo
echo "[D] Cloning repository..."
APP_DIR="/opt/ai-interview-system"
REPO_URL="https://github.com/manikanta-devs/9240126-AI-BASED-RESUME-DRIVEN-INTERVIEW-SYSTEM-WITH-PERFORMANCE-ANALYTICS.git"
if [[ -d "$APP_DIR/.git" ]]; then
  echo "  → Repo exists, pulling latest..."
  sudo git -C "$APP_DIR" remote set-url origin "$REPO_URL" || true
  sudo git -C "$APP_DIR" fetch --all || true
  sudo git -C "$APP_DIR" reset --hard origin/master || true
else
  sudo git clone "$REPO_URL" "$APP_DIR"
fi
sudo chown -R ubuntu:ubuntu "$APP_DIR"
echo "  ✔ Repo at $APP_DIR"

# [E] Python virtualenv + packages
echo "[E] Setting up Python environment..."
cd "$APP_DIR/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q || \\
  pip install flask flask-cors python-dotenv PyJWT google-generativeai \\
    requests PyPDF2 python-docx pydantic gunicorn psutil flask-limiter -q
python3 -m spacy download en_core_web_sm -q 2>/dev/null || true
deactivate
echo "  ✔ Python env ready"

# [F] Write .env files
echo "[F] Writing environment configuration..."
mkdir -p "$APP_DIR/backend/uploads" "$APP_DIR/backend/data"
cat > "$APP_DIR/backend/.env" <<ENV
FLASK_ENV=production
FLASK_DEBUG=0
DEBUG=false
SECRET_KEY=$SECRET_KEY
JWT_SECRET=$JWT_SECRET
GEMINI_API_KEY=$GEMINI_API_KEY
HUGGINGFACE_API_KEY=$HUGGINGFACE_API_KEY
GROQ_API_KEY=$GROQ_API_KEY
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
MISTRAL_API_KEY=$MISTRAL_API_KEY
DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY
ALLOWED_ORIGINS=*
RATE_LIMIT_ENABLED=true
MAX_QUESTIONS=10
MIN_QUESTIONS=3
SESSION_TIMEOUT_HOURS=24
LOG_LEVEL=INFO
PORT=5000
GUNICORN_WORKERS=1
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=120
GUNICORN_MAX_REQUESTS=500
ENV
sudo chown ubuntu:ubuntu "$APP_DIR/backend/.env"
chmod 600 "$APP_DIR/backend/.env"
echo "  ✔ .env written"

# [G] Detect Flask entry point
FLASK_APP="app.py"
for f in app.py main.py run.py wsgi.py; do
  [[ -f "$APP_DIR/backend/$f" ]] && {{ FLASK_APP="$f"; break; }}
done
FLASK_MODULE="${{FLASK_APP%.py}}:app"
echo "  ✔ Flask entry: $FLASK_MODULE"

# [H] Systemd service
echo "[H] Creating systemd service..."
GUNICORN_CMD="$APP_DIR/backend/.venv/bin/gunicorn"
if [[ -f "$APP_DIR/backend/gunicorn.conf.py" ]]; then
  GUNICORN_ARGS="--config $APP_DIR/backend/gunicorn.conf.py $FLASK_MODULE"
else
  GUNICORN_ARGS="--bind 127.0.0.1:5000 --workers 1 --threads 2 --timeout 120 $FLASK_MODULE"
fi
sudo tee /etc/systemd/system/ai-interview-backend.service > /dev/null <<UNIT
[Unit]
Description=AI Interview System Backend
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=$APP_DIR/backend
EnvironmentFile=$APP_DIR/backend/.env
ExecStart=$GUNICORN_CMD $GUNICORN_ARGS
Restart=on-failure
RestartSec=5
StartLimitBurst=3

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable ai-interview-backend
sudo systemctl restart ai-interview-backend
echo "  ✔ Backend service started"

# [I] Wait for backend
echo "[I] Waiting for backend to start..."
for i in {{1..20}}; do
  if curl -sf http://127.0.0.1:5000/health &>/dev/null || \\
     curl -sf http://127.0.0.1:5000/ &>/dev/null; then
    echo "  ✔ Backend responding on :5000"
    break
  fi
  echo "  ... ($i/20)"
  sleep 3
done

# [J] Nginx
echo "[J] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ai-interview > /dev/null <<'NGINX'
server {{
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 20M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Permissions-Policy "camera=*, microphone=*" always;

    location /api/ {{
        proxy_pass         http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }}
    location = /health {{
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }}
    location /uploads/ {{
        alias /opt/ai-interview-system/backend/uploads/;
    }}
    location / {{
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }}
}}
NGINX
sudo ln -sf /etc/nginx/sites-available/ai-interview /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t 2>&1 && sudo systemctl enable nginx && sudo systemctl reload nginx
echo "  ✔ Nginx configured"

# [K] Firewall
echo "[K] Configuring firewall..."
sudo ufw --force reset > /dev/null
sudo ufw default deny incoming > /dev/null
sudo ufw default allow outgoing > /dev/null
sudo ufw allow 22/tcp > /dev/null
sudo ufw allow 80/tcp > /dev/null
sudo ufw allow 443/tcp > /dev/null
sudo ufw --force enable > /dev/null
echo "  ✔ Firewall: 22/80/443 open"

# [L] Validate
echo ""
echo "[L] Validating deployment..."
sudo chown -R ubuntu:ubuntu "$APP_DIR"
sleep 5
check() {{
  local code
  code=$(curl -so /dev/null -w "%{{http_code}}" --max-time 8 "$2" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|401|405|422)$ ]]; then
    echo "  ✔ $1 → HTTP $code"
  else
    echo "  ✘ $1 → HTTP $code (check logs)"
  fi
}}
check "Backend /health"      "http://127.0.0.1/health"
check "Backend /api/health"  "http://127.0.0.1/api/health"
check "Interview endpoint"   "http://127.0.0.1/api/interview/generate"
check "Resume endpoint"      "http://127.0.0.1/api/resume/parse"

echo ""
echo "  Memory usage:"
free -h | grep -E "Mem|Swap"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ BACKEND DEPLOYED SUCCESSFULLY!"
echo "  API : http://18.61.78.226/api"
echo "  Health: http://18.61.78.226/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"""

# ── Step 4: SSH and deploy ─────────────────────────────────────────────────────
info("[3/4] Opening SSH connection to EC2...")

with tempfile.NamedTemporaryFile(delete=False, suffix=".pem", mode="wb") as f:
    f.write(private_pem)
    key_path = f.name

try:
    pkey = paramiko.RSAKey.from_private_key_file(key_path)
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    info(f"Connecting to {EC2_USER}@{EC2_IP}... (60s window)")
    ssh.connect(hostname=EC2_IP, username=EC2_USER, pkey=pkey, timeout=30, banner_timeout=30)
    log("SSH connection established!")

    # Upload script via SFTP instead of stdin — avoids PTY echo problem
    info("Uploading deployment script to EC2...")
    sftp = ssh.open_sftp()
    remote_script = "/tmp/ai_deploy.sh"
    with sftp.file(remote_script, "w") as rf:
        rf.write(DEPLOY_SCRIPT)
    sftp.chmod(remote_script, 0o755)
    sftp.close()
    log(f"Script uploaded to EC2:{remote_script}")

    info("[4/4] Running deployment on EC2 — streaming output live...\n")
    print("-" * 60)

    # Execute without PTY so output is clean (no echo of commands)
    transport = ssh.get_transport()
    channel = transport.open_session()
    channel.set_combine_stderr(True)   # merge stderr into stdout
    channel.exec_command(f"sudo bash {remote_script}")

    # Stream output line by line
    buffer = ""
    while True:
        chunk = channel.recv(4096)
        if not chunk:
            break
        text = chunk.decode("utf-8", errors="replace")
        buffer += text
        lines = buffer.split("\n")
        buffer = lines[-1]   # keep incomplete last line
        for line in lines[:-1]:
            print(line, flush=True)

    if buffer:
        print(buffer, flush=True)

    exit_code = channel.recv_exit_status()
    print("-" * 60)

    if exit_code == 0:
        print(f"""
{B}{G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{N}
{B}{G}  ✅  DEPLOYMENT COMPLETE!{N}
{B}{G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{N}

  🌐 API Base URL : http://18.61.78.226/api
  💚 Health check : http://18.61.78.226/health

  Next — Deploy frontend to Vercel (free, 2 min):
  1. vercel.com → Import manikanta-devs/mca-final-project
  2. Root Directory = frontend
  3. Env var: VITE_API_BASE_URL = http://18.61.78.226
  4. Deploy!

{B}{Y}  ⚠  Delete your AWS access key now (one-time use):{N}
  AWS Console → Security credentials → Access keys → Delete
{B}{G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{N}
""")
    else:
        warn(f"Deploy exited with code {exit_code} — check output above for errors.")

    ssh.close()

except paramiko.AuthenticationException:
    err("SSH auth failed — 60s window may have expired. Run the script again.")
except Exception as e:
    err(f"SSH/deploy error: {e}")
finally:
    os.unlink(key_path)
