"""
Gunicorn production configuration — tuned for memory-constrained hosts.
Render free tier: 512 MB RAM.  EC2 t3.micro: 1 GB RAM.

Key decisions:
  - 1 worker + 2 threads:  single process shares spaCy/model memory via preload
  - preload_app = True:    loads app ONCE in master; workers fork (copy-on-write)
  - max_requests:          recycles workers to prevent slow memory leaks
  - worker_tmp_dir /dev/shm: fast in-RAM tmpfs for worker heartbeats
"""
import os

# ─── Workers ────────────────────────────────────────────────────────────────
# 1 worker keeps memory usage low on Render/t3.micro.
# Increase GUNICORN_WORKERS env var on larger instances (e.g. 2 on t3.small).
worker_class = "gthread"
workers = int(os.getenv("GUNICORN_WORKERS", "1"))
threads  = int(os.getenv("GUNICORN_THREADS", "2"))

# ─── Preloading ─────────────────────────────────────────────────────────────
# Load the Flask app ONCE in the master process; forked workers share memory
# via copy-on-write. This is critical when spaCy / Gemini SDK are imported.
preload_app = True

# ─── Worker recycling (memory-leak defence) ──────────────────────────────────
# After N requests each worker is gracefully replaced with a fresh process.
# This prevents slow leaks from accumulating over hours/days.
max_requests          = int(os.getenv("GUNICORN_MAX_REQUESTS", "500"))
max_requests_jitter   = 50   # randomise restart time to avoid thundering herd

# ─── Timeouts ───────────────────────────────────────────────────────────────
timeout          = int(os.getenv("GUNICORN_TIMEOUT", "120"))  # Gemini can be slow
graceful_timeout = 20
keepalive        = 5

# ─── Binding ────────────────────────────────────────────────────────────────
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# ─── RAM-backed tmp dir for worker heartbeats (avoids /tmp I/O) ─────────────
# /dev/shm exists on Linux (Render/EC2). Falls back gracefully if not present.
import os as _os
if _os.path.isdir("/dev/shm"):
    worker_tmp_dir = "/dev/shm"

# ─── Logging ────────────────────────────────────────────────────────────────
accesslog = "-"   # stdout
errorlog  = "-"   # stderr
loglevel  = os.getenv("LOG_LEVEL", "info").lower()
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(D)sµs'

# ─── Process naming ─────────────────────────────────────────────────────────
proc_name = "ai-interview-backend"

# ─── Security ───────────────────────────────────────────────────────────────
limit_request_line   = 8190
limit_request_fields = 100
forwarded_allow_ips  = os.getenv("FORWARDED_ALLOW_IPS", "*")

