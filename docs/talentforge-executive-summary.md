# TalentForge AI: Project Executive Summary

### 1. Project Title
**TalentForge AI**: An Autonomous, Resume-Driven Mock Interview System with Dynamic Fallback and Performance Analytics.

---

### 2. Problem Definition
*   **API Vulnerability**: Modern AI applications depend heavily on external APIs (like OpenAI, Gemini, or Claude). Rate-limiting or outages cause instant application crashes.
*   **High Deployment Cost**: Hosting local deep learning models demands expensive GPU infrastructures, which is not viable for free educational tier systems.
*   **Evaluation Limitations**: Traditional interview training platforms lack quantifiable performance dashboards (tracking anxiety, posture, and speech speed concurrently).

---

### 3. System Objectives
*   **High Availability**: Guarantee close to 100% application uptime by building an automated fallback API router.
*   **Zero Operational Costs**: Utilize free-tier API endpoints and lightweight local open-source utilities.
*   **Low RAM Footprint**: Optimize memory usage to allow hosting the entire system on a cheap cloud host with less than 1 GB of RAM.

---

### 4. Technical Specifications
*   **Frontend**: React (Vite, TailwindCSS, Chart.js, Lucide Icons, Web Speech API).
*   **Backend**: Flask (Python 3.12, SQLite, spaCy NLP Parser, NLTK, PyDantic).
*   **Hosting**: AWS EC2 (t3.micro, 1 vCPU, 1 GB RAM, Ubuntu 22.04 LTS).

---

### 5. Key Performance Indicators (KPIs)
*   **Failover Resolution Rate**: **100%** successful failover resolution under concurrency stress tests.
*   **Idle Memory Footprint**: **56.6 MB** RAM (achieved through lazy-loading models).
*   **Average Latency (Groq Fallback)**: **0.455 seconds** average response time.
*   **Concurrency Uptime**: Under a simulated load of **500 concurrent requests**, SQLite transaction overhead was limited to **60.9 ms** with **0 lost sessions**.
