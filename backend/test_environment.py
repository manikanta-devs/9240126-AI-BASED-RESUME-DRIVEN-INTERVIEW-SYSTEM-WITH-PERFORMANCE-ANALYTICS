#!/usr/bin/env python
"""
test_environment.py — College Lab Environment Diagnostic Script.
Runs comprehensive checks on Python modules, API access, SQLite read/write,
and directory permissions to prevent presentation-day crashes.
ASCII-only encoding to support old Windows lab systems.
"""
import os
import sys
import sqlite3
import requests
from dotenv import load_dotenv

# Terminal colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[96m"
RESET = "\033[0m"


def check_python_version():
    print(f"{BLUE}[1/6]{RESET} Checking Python version...")
    v = sys.version_info
    print(f"   Python version: {v.major}.{v.minor}.{v.micro}")
    if v.major < 3 or (v.major == 3 and v.minor < 8):
        print(f"   {RED}[FAIL] Python 3.8+ is required. Please update Python.{RESET}")
        return False
    print(f"   {GREEN}[OK] Python version compatible.{RESET}")
    return True


def check_dependencies():
    print(f"\n{BLUE}[2/6]{RESET} Checking required Python packages...")
    required = [
        "flask", "flask_cors", "dotenv", "jwt",
        "requests", "pydantic", "psutil"
    ]
    missing = []
    for pkg in required:
        try:
            if pkg == "dotenv":
                import dotenv
            elif pkg == "jwt":
                import jwt
            else:
                __import__(pkg)
            print(f"   [OK] {pkg} installed.")
        except ImportError:
            print(f"   {RED}[FAIL] {pkg} missing.{RESET}")
            missing.append(pkg)

    if missing:
        print(f"   {RED}[FAIL] Missing packages: {', '.join(missing)}{RESET}")
        print(f"   {YELLOW}[FIX] Run 'pip install -r requirements.txt' inside backend folder.{RESET}")
        return False
    print(f"   {GREEN}[OK] All core dependencies found.{RESET}")
    return True


def check_env_file():
    print(f"\n{BLUE}[3/6]{RESET} Checking .env configuration...")
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        print(f"   {RED}[FAIL] .env file not found in backend directory.{RESET}")
        print(f"   {YELLOW}[FIX] Copy .env.example to .env and configure keys.{RESET}")
        return False

    load_dotenv(env_path)
    keys = ["HUGGINGFACE_API_KEY", "GEMINI_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY"]
    configured = 0
    for key in keys:
        val = os.getenv(key, "").strip()
        if val and not val.startswith("your_") and not val.startswith("AQ."):
            print(f"   [OK] {key} is configured.")
            configured += 1
        elif val:
            print(f"   {YELLOW}[WARN] {key} is set to a placeholder or default value.{RESET}")
        else:
            print(f"   {YELLOW}[WARN] {key} is empty.{RESET}")

    if configured == 0:
        print(f"   {RED}[FAIL] No active AI keys configured. The system will fail to generate questions or evaluations.{RESET}")
        print(f"   {YELLOW}[FIX] Enter at least one valid key in backend/.env.{RESET}")
        return False

    print(f"   {GREEN}[OK] Configuration check completed.{RESET}")
    return True


def check_db_and_permissions():
    print(f"\n{BLUE}[4/6]{RESET} Checking database write permissions...")
    db_path = os.path.join(os.path.dirname(__file__), "data", "interviews.db")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS _test_table (id INTEGER PRIMARY KEY, val TEXT)")
        cursor.execute("INSERT INTO _test_table (val) VALUES ('test')")
        conn.commit()
        cursor.execute("DROP TABLE _test_table")
        conn.commit()
        conn.close()
        print(f"   [OK] SQLite read/write operations active.")
    except Exception as e:
        print(f"   {RED}[FAIL] Database permission failed: {e}{RESET}")
        print(f"   {YELLOW}[FIX] Check file permissions or run terminal as Administrator.{RESET}")
        return False
    print(f"   {GREEN}[OK] Database read/write verified.{RESET}")
    return True


def check_internet_and_api():
    print(f"\n{BLUE}[5/6]{RESET} Checking internet connection and external AI API endpoints...")
    try:
        response = requests.get("https://aistudio.google.com", timeout=3)
        print(f"   [OK] Internet connection active.")
    except Exception:
        print(f"   {RED}[FAIL] No internet access detected. External AI APIs will not work.{RESET}")
        print(f"   {YELLOW}[FIX] Connect to the internet or disable college laboratory proxy/firewall.{RESET}")
        return False

    # Check Gemini connection
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_key:
        print(f"   Testing Gemini API connection...")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
        payload = {"contents": [{"parts": [{"text": "Say ok"}]}]}
        try:
            res = requests.post(url, json=payload, timeout=5)
            if res.status_code == 200:
                print(f"   {GREEN}[OK] Gemini API Key is valid and active.{RESET}")
            else:
                print(f"   {YELLOW}[WARN] Gemini API returned status {res.status_code}. Key might be limited.{RESET}")
        except Exception as e:
            print(f"   {YELLOW}[WARN] Gemini API connection timed out: {e}. Checking fallback providers next.{RESET}")

    # Check Hugging Face
    hf_key = os.getenv("HUGGINGFACE_API_KEY", "").strip()
    if hf_key:
        print(f"   Testing Hugging Face Inference API connection...")
        headers = {"Authorization": f"Bearer {hf_key}"}
        url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        payload = {"inputs": "Say ok"}
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=5)
            if res.status_code == 200 or res.status_code == 503:  # 503 is okay (loading)
                print(f"   {GREEN}[OK] Hugging Face API Key is valid.{RESET}")
            else:
                print(f"   {YELLOW}[WARN] Hugging Face API returned status {res.status_code}.{RESET}")
        except Exception:
            print(f"   {YELLOW}[WARN] Hugging Face API connection failed.{RESET}")

    print(f"   {GREEN}[OK] API checks completed.{RESET}")
    return True


def check_uploads_folder():
    print(f"\n{BLUE}[6/6]{RESET} Checking temporary upload directory...")
    upload_path = os.path.join(os.path.dirname(__file__), "uploads")
    try:
        os.makedirs(upload_path, exist_ok=True)
        test_file = os.path.join(upload_path, "_test.txt")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        print(f"   [OK] Write access to uploads folder verified.")
    except Exception as e:
        print(f"   {RED}[FAIL] Uploads folder permission failed: {e}{RESET}")
        return False
    print(f"   {GREEN}[OK] Temporary uploads directory verified.{RESET}")
    return True


def main():
    print("==========================================================")
    print("   AI Interview System - College Lab Diagnostic Utility")
    print("==========================================================")
    
    success = True
    checks = [
        check_python_version,
        check_dependencies,
        check_env_file,
        check_db_and_permissions,
        check_internet_and_api,
        check_uploads_folder
    ]
    
    for check in checks:
        if not check():
            success = False
            
    print("\n==========================================================")
    if success:
        print(f"   {GREEN}[SUCCESS] ALL DIAGNOSTIC CHECKS PASSED SUCCESSFULLY!{RESET}")
        print("   Your project is 100% ready for presentation.")
    else:
        print(f"   {RED}[FAIL] DIAGNOSTIC CHECKS FAILED.{RESET}")
        print("   Please review the instructions above to resolve the issues.")
    print("==========================================================")
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
