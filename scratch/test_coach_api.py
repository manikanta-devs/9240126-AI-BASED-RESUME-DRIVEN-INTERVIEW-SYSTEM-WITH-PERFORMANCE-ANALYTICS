import requests
import sys

BASE_URL = "http://127.0.0.1:5000"

def test_coaching():
    # 1. Register or login to get token
    print("Logging in...")
    login_payload = {"username": "debugger_user_3", "password": "Password123!"}
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    if res.status_code != 200:
        print("Registering new user...")
        res = requests.post(f"{BASE_URL}/api/auth/register", json=login_payload)
        if res.status_code != 200:
            print(f"Auth failed: {res.text}")
            sys.exit(1)
        res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        
    token = res.json().get("token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 2. Call coaching API
    coaching_payload = {
        "question": "Can you explain the difference between a process and a thread?",
        "answer": "A process has its own memory space, whereas a thread shares memory with other threads in the same process.",
        "evaluation_scores": {
            "overall": 75,
            "technical": 80,
            "clarity": 70,
            "relevance": 75
        }
    }
    
    print("Requesting AI Coaching...")
    coach_res = requests.post(f"{BASE_URL}/api/interview/coach", json=coaching_payload, headers=headers)
    print(f"Status Code: {coach_res.status_code}")
    print(f"RAW SERVER RESPONSE: {coach_res.text}")
    if coach_res.status_code == 200:
        coaching = coach_res.json().get("coaching", {})
        print("\n--- AI COACHING OUTPUT ---")
        print(f"Overall Score: {coaching.get('overall_score')}/10")
        print(f"HR Impression: {coaching.get('hr_first_impression')}")
        print(f"Mistakes: {coaching.get('mistakes')}")
        print(f"Strengths: {coaching.get('strengths')}")
        print(f"Personalized Answer: {coaching.get('personalized_answer')}")
        print("---------------------------")
        print("✅ Coach API test passed successfully!")
    else:
        print(f"❌ Coach API failed: {coach_res.text}")
        sys.exit(1)

if __name__ == "__main__":
    test_coaching()
