"""
auto_deploy.py — Fully automated EC2 deployment via EC2 Instance Connect
No .pem key needed. Uses a temporary SSH key valid for 60 seconds.

Usage:
    python deploy/auto_deploy.py
"""
import os
import sys
import time
import subprocess
import tempfile
import textwrap

# ── Check dependencies ──────────────────────────────────────────────────────
try:
    import boto3
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.backends import default_backend
    import paramiko
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Run: pip install boto3 paramiko cryptography")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
EC2_IP          = "18.61.78.226"
EC2_USER        = "ubuntu"
INSTANCE_ID     = "i-09e28dd8e1b08c7e4"
REGION          = "ap-south-2"
AZ              = "ap-south-2a"   # Hyderabad AZ

RED    = "\033[91m"; GREEN = "\033[92m"; YELLOW = "\033[93m"
CYAN   = "\033[96m"; BOLD  = "\033[1m";  NC    = "\033[0m"

def log(msg):  print(f"{GREEN}[✔]{NC} {msg}")
def info(msg): print(f"{CYAN}[→]{NC} {msg}")
def warn(msg): print(f"{YELLOW}[!]{NC} {msg}")
def err(msg):  print(f"{RED}[✘]{NC} {msg}"); sys.exit(1)

def banner():
    print(f"""
{BOLD}{CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}
{BOLD}  AI Interview System — Automated EC2 Deployment{NC}
{BOLD}  Instance : {EC2_IP} ({INSTANCE_ID}){NC}
{BOLD}  Region   : {REGION}{NC}
{BOLD}{CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}
""")

# ── Collect credentials ─────────────────────────────────────────────────────
def collect_credentials():
    print(f"\n{BOLD}[1/5] Collecting credentials{NC}")

    aws_key    = os.environ.get("AWS_ACCESS_KEY_ID")
    aws_secret = os.environ.get("AWS_SECRET_ACCESS_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")

    if not aws_key:
        aws_key = input(f"{YELLOW}  >> AWS Access Key ID (AKIA...): {NC}").strip()
    if not aws_secret:
        import getpass
        aws_secret = getpass.getpass(f"{YELLOW}  >> AWS Secret Access Key (hidden): {NC}").strip()
    if not gemini_key:
        import getpass
        gemini_key = getpass.getpass(f"{YELLOW}  >> Gemini API Key (AIzaSy..., hidden): {NC}").strip()

    if not all([aws_key, aws_secret, gemini_key]):
        err("All three values are required.")

    log("Credentials collected.")
    return aws_key, aws_secret, gemini_key

# ── Generate temporary SSH key pair ─────────────────────────────────────────
def generate_temp_ssh_key():
    print(f"\n{BOLD}[2/5] Generating temporary SSH key pair{NC}")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.OpenSSH,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_key_openssh = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    ).decode("utf-8")

    log("Temporary RSA-2048 key pair generated.")
    return private_pem, public_key_openssh

# ── Push public key via EC2 Instance Connect ─────────────────────────────────
def push_public_key(aws_key, aws_secret, public_key_openssh):
    print(f"\n{BOLD}[3/5] Pushing temporary public key to EC2 via Instance Connect{NC}")
    info("This key is valid for 60 seconds — SSH will happen immediately after.")

    session = boto3.Session(
        aws_access_key_id=aws_key,
        aws_secret_access_key=aws_secret,
        region_name=REGION
    )
    eic = session.client("ec2-instance-connect")

    try:
        resp = eic.send_ssh_public_key(
            InstanceId=INSTANCE_ID,
            InstanceOSUser=EC2_USER,
            SSHPublicKey=public_key_openssh,
            AvailabilityZone=AZ
        )
        if resp.get("Success"):
            log(f"Public key pushed successfully. RequestId: {resp['RequestId']}")
        else:
            err(f"EC2 Instance Connect rejected the key: {resp}")
    except Exception as e:
        err(f"EC2 Instance Connect failed: {e}\n"
            f"Check that:\n"
            f"  1. Your AWS credentials have ec2-instance-connect:SendSSHPublicKey permission\n"
            f"  2. EC2 Instance Connect is enabled (port 22 open in security group)\n"
            f"  3. Instance ID and AZ are correct")

# ── Build the remote deploy script ───────────────────────────────────────────
def build_deploy_script(gemini_key):
    """Returns the shell script to run on EC2."""
    import secrets
    jwt_secret    = secrets.token_hex(32)
    secret_key    = secrets.token_hex(32)

    # Read the backend_only_ec2.sh and inject the keys as env vars
    script_path = os.path.join(os.path.dirname(__file__), "backend_only_ec2.sh")
    if os.path.exists(script_path):
        with open(script_path, "r") as f:
            script_body = f.read()
        # Pre-set secrets so the script skips the read -rsp prompts
        prefix = textwrap.dedent(f"""\
            #!/usr/bin/env bash
            # ── Pre-injected secrets ──────────────────────────────────
            export GEMINI_API_KEY='{gemini_key}'
            export JWT_SECRET='{jwt_secret}'
            export SECRET_KEY='{secret_key}'
            # Strip the secret-collection block and run the rest
        """)
        # Remove the "read -rsp" prompts since we pre-set the vars
        import re
        script_body = re.sub(
            r'read -rsp.*?GEMINI_API_KEY.*?echo\n.*?\[.*?\].*?\n',
            '# (secrets pre-injected)\n',
            script_body, flags=re.DOTALL
        )
        return prefix + "\n" + script_body
    else:
        # Inline minimal deploy if script file not found
        return textwrap.dedent(f"""\
            #!/usr/bin/env bash
            set -euo pipefail
            export GEMINI_API_KEY='{gemini_key}'
            export JWT_SECRET='{jwt_secret}'
            export SECRET_KEY='{secret_key}'

            # Swap
            if [[ ! -f /swapfile ]]; then
              sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
              sudo mkswap /swapfile && sudo swapon /swapfile
              echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
            fi

            # System packages
            export DEBIAN_FRONTEND=noninteractive
            sudo apt-get update -yq
            sudo apt-get install -yq git curl python3 python3-pip python3-venv build-essential nginx ufw

            # Node.js 20
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -yq nodejs

            # Clone repo
            APP_DIR="/opt/ai-interview-system"
            if [[ -d "$APP_DIR/.git" ]]; then
              sudo git -C "$APP_DIR" pull --ff-only || true
            else
              sudo git clone https://github.com/manikanta-devs/mca-final-project.git "$APP_DIR"
            fi
            sudo chown -R ubuntu:ubuntu "$APP_DIR"

            # Python env
            cd "$APP_DIR/backend"
            python3 -m venv .venv && source .venv/bin/activate
            pip install --upgrade pip -q
            pip install -r requirements.txt -q
            pip install gunicorn -q
            python3 -m spacy download en_core_web_sm 2>/dev/null || true
            deactivate

            # .env
            sudo tee "$APP_DIR/backend/.env" > /dev/null <<ENV
            FLASK_ENV=production
            FLASK_DEBUG=0
            SECRET_KEY={secret_key}
            JWT_SECRET={jwt_secret}
            GEMINI_API_KEY={gemini_key}
            ALLOWED_ORIGINS=*
            GUNICORN_WORKERS=1
            GUNICORN_THREADS=2
            GUNICORN_TIMEOUT=120
            ENV

            # Systemd
            FLASK_MODULE="app:app"
            sudo tee /etc/systemd/system/ai-interview-backend.service > /dev/null <<UNIT
            [Unit]
            Description=AI Interview Backend
            After=network.target
            [Service]
            User=ubuntu
            WorkingDirectory=$APP_DIR/backend
            EnvironmentFile=$APP_DIR/backend/.env
            ExecStart=$APP_DIR/backend/.venv/bin/gunicorn --config gunicorn.conf.py $FLASK_MODULE
            Restart=on-failure
            RestartSec=5
            [Install]
            WantedBy=multi-user.target
            UNIT
            sudo systemctl daemon-reload
            sudo systemctl enable --now ai-interview-backend

            # Nginx
            sudo tee /etc/nginx/sites-available/ai-interview > /dev/null <<'NGINX'
            server {{
              listen 80 default_server;
              client_max_body_size 20M;
              location /api/ {{ proxy_pass http://127.0.0.1:5000/api/; proxy_set_header Host $host; }}
              location = /health {{ proxy_pass http://127.0.0.1:5000/health; }}
              location / {{ proxy_pass http://127.0.0.1:5000/; proxy_set_header Host $host; }}
            }}
            NGINX
            sudo ln -sf /etc/nginx/sites-available/ai-interview /etc/nginx/sites-enabled/
            sudo rm -f /etc/nginx/sites-enabled/default
            sudo nginx -t && sudo systemctl enable --now nginx && sudo systemctl reload nginx

            # Firewall
            sudo ufw --force reset && sudo ufw default deny incoming && sudo ufw default allow outgoing
            sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
            sudo ufw --force enable

            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "  DONE! Backend at: http://18.61.78.226"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        """)

# ── SSH and run deployment ───────────────────────────────────────────────────
def ssh_and_deploy(private_pem, gemini_key):
    print(f"\n{BOLD}[4/5] Connecting to EC2 and running deployment{NC}")
    info(f"SSH → {EC2_USER}@{EC2_IP}")

    deploy_script = build_deploy_script(gemini_key)

    # Write private key to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pem", mode="wb") as f:
        f.write(private_pem)
        key_path = f.name

    try:
        pkey = paramiko.RSAKey.from_private_key_file(key_path)
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        info("Connecting... (must happen within 60 seconds of key push)")
        ssh.connect(
            hostname=EC2_IP,
            username=EC2_USER,
            pkey=pkey,
            timeout=30,
            banner_timeout=30
        )
        log("SSH connection established!")

        print(f"\n{BOLD}[5/5] Running deployment script on EC2{NC}")
        print(f"{YELLOW}  This takes 5-10 minutes. Streaming output...{NC}\n")
        print("─" * 60)

        # Run the deploy script via stdin (avoids file transfer)
        stdin, stdout, stderr = ssh.exec_command(
            "bash -s",
            timeout=900,  # 15 min max
            get_pty=True  # allocate pseudo-terminal for interactive output
        )
        stdin.write(deploy_script)
        stdin.channel.shutdown_write()

        # Stream output live
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line, end="", flush=True)

        exit_code = stdout.channel.recv_exit_status()
        print("─" * 60)

        if exit_code == 0:
            print(f"""
{BOLD}{GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}
{BOLD}{GREEN}  ✅ DEPLOYMENT SUCCESSFUL!{NC}
{BOLD}{GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}

  🌐 Backend API : http://18.61.78.226/api
  💚 Health check: http://18.61.78.226/health

  Next step — deploy frontend to Vercel (free):
  1. Go to vercel.com → Import manikanta-devs/mca-final-project
  2. Set Root Directory = frontend
  3. Add env var: VITE_API_BASE_URL = http://18.61.78.226
  4. Deploy!

{BOLD}{YELLOW}  ⚠  IMPORTANT: Delete your AWS access key now!{NC}
  AWS Console → Security credentials → Access keys → Delete
{BOLD}{GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}
""")
        else:
            warn(f"Deployment exited with code {exit_code}. Check output above.")

        ssh.close()

    except paramiko.AuthenticationException:
        err("SSH auth failed. The 60-second window may have expired. Run again.")
    except Exception as e:
        err(f"SSH error: {e}")
    finally:
        os.unlink(key_path)

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    banner()
    aws_key, aws_secret, gemini_key = collect_credentials()
    private_pem, public_key_openssh = generate_temp_ssh_key()
    push_public_key(aws_key, aws_secret, public_key_openssh)
    # SSH immediately after key push (60-second window)
    ssh_and_deploy(private_pem, gemini_key)

if __name__ == "__main__":
    main()
