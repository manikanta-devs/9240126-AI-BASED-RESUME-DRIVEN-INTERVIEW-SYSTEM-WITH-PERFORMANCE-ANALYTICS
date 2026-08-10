import requests
import json

BASE_URL = "http://localhost:5000/api"

def populate_data():
    print("============================================================")
    print("POPULATING REAL INTERVIEW SESSION WITH HIGH SCORES IN SQLITE")
    print("============================================================")

    # 1. Register candidate user
    username = "jane_doe_pro"
    password = "Password123!"
    
    print("1. Registering & logging in as candidate 'jane_doe_pro'...")
    requests.post(f"{BASE_URL}/auth/register", json={
        "username": username,
        "password": password,
        "full_name": "Jane Doe"
    })

    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": password
    })

    if login_res.status_code != 200:
        print("Failed to login:", login_res.text)
        return

    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Start Interview Session
    print("2. Starting Software Engineer Mock Interview session...")
    questions = [
        {"id": 1, "text": "Explain how you design a resilient microservices architecture.", "type": "technical", "category": "System Design", "points": 20},
        {"id": 2, "text": "How do you handle a production database deadlock scenario under peak traffic?", "type": "technical", "category": "Database Internals", "points": 20},
        {"id": 3, "text": "Describe a high-pressure conflict with a team member and how you resolved it.", "type": "behavioral", "category": "Behavioral STAR", "points": 20},
        {"id": 4, "text": "What strategies do you use to optimize React virtual DOM rendering?", "type": "technical", "category": "Frontend Architecture", "points": 20},
        {"id": 5, "text": "What motivates you to excel as a Senior Software Engineer at our company?", "type": "behavioral", "category": "Motivation & Alignment", "points": 20}
    ]

    start_res = requests.post(f"{BASE_URL}/interview/start", headers=headers, json={
        "role": "software_engineer",
        "num_questions": 5,
        "duration_minutes": 30,
        "interview_format": "voice",
        "questions": questions,
        "candidate_name": "Jane Doe",
        "difficulty": "medium"
    })

    if start_res.status_code != 200:
        print("Failed to start session:", start_res.text)
        return

    session_id = start_res.json()["session_id"]
    print(f"   Created Session ID: {session_id}")

    # 3. Submit Answers
    answers = [
        "Situation: At my previous tech firm, our monolith faced 850ms latency during traffic spikes. Task: Decompose the monolith into resilient microservices. Action: Implemented API Gateway, gRPC inter-service communication, Redis distributed caching, and PostgreSQL read-replicas. Result: Reduced latency by 68% and achieved 99.99% operational uptime.",
        "Identified blocking transaction locks using pg_stat_activity, reordered transaction lock acquisition across repositories, configured statement timeouts, and enabled exponential backoff retries.",
        "Collaborated with a senior backend lead who preferred synchronous REST calls over event-driven webhooks. I conducted a data-driven benchmark test demonstrating 40% higher throughput with RabbitMQ. We aligned on an event-driven architecture.",
        "Utilized React.memo, useMemo, and useCallback to eliminate redundant renders. Profiling showed rendering cycles dropped from 45ms to 8ms.",
        "I am passionate about building AI-driven interview tools that empower candidates globally and solve scalable distributed architecture challenges."
    ]

    print("3. Submitting 5 high-quality STAR candidate answers...")
    for idx, ans_text in enumerate(answers):
        ans_res = requests.post(f"{BASE_URL}/interview/answer", headers=headers, json={
            "session_id": session_id,
            "answer": ans_text,
            "question_index": idx,
            "voice_metrics": {"filler_words": 1, "wpm": 145, "clarity": 92},
            "emotion_metrics": {"eye_contact_score": 94, "posture_score": 90, "emotion_label": "Confident"}
        })
        print(f"   Submitted Answer {idx+1}: Status {ans_res.status_code}")

    # 4. Complete Session
    print("4. Completing session and computing final scores...")
    comp_res = requests.post(f"{BASE_URL}/interview/complete", headers=headers, json={
        "session_id": session_id,
        "gaze_stats": {"presencePct": 96, "eyeContactPct": 94, "awayCount": 0}
    })

    print(f"   Completion Status: {comp_res.status_code}")
    if comp_res.status_code == 200:
        res_data = comp_res.json()
        print("   SUCCESS! Session Results saved in SQLite:")
        print("   Summary:", json.dumps(res_data.get("results", {}).get("overall_score"), indent=2))
        return token, username
    else:
        print("   Error completing session:", comp_res.text)
        return None, None

if __name__ == '__main__':
    populate_data()
