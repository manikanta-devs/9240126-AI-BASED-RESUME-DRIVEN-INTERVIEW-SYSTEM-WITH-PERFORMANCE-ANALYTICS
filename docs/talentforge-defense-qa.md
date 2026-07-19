# TalentForge AI: Academic Defense Q&A Documentation

This document compiles technical justifications for the core engineering trade-offs in TalentForge AI. It is designed to prepare the candidate for defense questioning by the university evaluation panel.

---

### Q1: Why did you choose SQLite as your primary database instead of an enterprise database like PostgreSQL or MySQL? Isn't SQLite limited under concurrent write operations?
*   **Defense Justification**: 
    While PostgreSQL or MySQL are standard for enterprise architectures, **SQLite is an intentional, highly optimized design choice for this deployment context**:
    1.  **Deployment Footprint**: SQLite requires zero system administration, no external service processes, and has a **zero-RAM overhead footprint**. This was essential to host the entire stack (React, Flask, SQLite) on a single free-tier AWS EC2 t3.micro instance (1 GB RAM total) without running out of memory.
    2.  **Concurrency Suitability**: Mock interviews are highly episodic. The write load is limited to saving the interview configuration at startup and updating results at completion. Read operations dominate. SQLite's write-concurrency limitations are mitigated by our Python backend's thread-safe connection pooling and write timeouts.
    3.  **Experimental Proof**: Our stress-tests (Table III of the paper) prove that even under **500 concurrent requests**, SQLite database write latency remains at **60.9 ms**, which is negligible compared to standard network round-trip delays.

---

### Q2: Why does the system fall back to a local regex parser for resume evaluation when spaCy is unavailable? Isn't regex parsing too simple for NLP tasks?
*   **Defense Justification**:
    The fallback is a **fault-tolerant resilience strategy, not a primary choice**:
    1.  **Fail-Safe Redundancy**: If the host system loses internet access, or if the system is deployed in a low-resource laboratory where downloading a large spaCy NLP model fails, the system transitions to a regex-based parser.
    2.  **Deterministic Accuracy**: While regex lacks syntactic semantic understanding, it excels at deterministic keyword extraction. By comparing the resume keywords against our structured `SKILL_KEYWORDS` lexicon, the regex parser achieves high extraction accuracy with **zero memory overhead** and **extremely fast latency (0.03 seconds)**.
    3.  **Low Resource Footprint**: This fallback guarantees that the software remains usable under all circumstances, matching the core engineering principle of *graceful degradation*.

---

### Q3: How did you optimize the backend memory footprint to run within 56.6 MB of RAM?
*   **Defense Justification**:
    On standard low-cost cloud virtual machines (like t3.micro with 1 GB RAM), loading massive Python models like spaCy at server startup causes instant memory allocation failures (Out-Of-Memory / OOM-killer). We implemented two memory-management strategies:
    1.  **Lazy Loading (On-Demand Initialization)**:
        The spaCy English model `en_core_web_sm` (~80 MB) is not loaded when the Flask application starts. Instead, we use a lazy singleton pattern. The model is only loaded into memory when a candidate uploads a resume file for parsing, keeping the server's idle footprint at **56.6 MB**.
    2.  **Gunicorn Thread Pool Tuning**:
        We set Gunicorn workers to `2` and max threads to `4`, limiting the process cloning overhead while maintaining sufficient throughput.

---

### Q4: If the server-side Text-to-Speech (TTS) engine (Piper) fails or is missing, how does the frontend handle it?
*   **Defense Justification**:
    We implemented a **hybrid client-server TTS architecture**:
    1.  **Primary Engine (Piper)**: The Flask server attempts to run local, offline Piper TTS using the `en_US-lessac-medium.onnx` neural model to generate high-fidelity, natural-sounding audio.
    2.  **Browser Fallback**: If `piper.exe` is missing from the local path or the server times out, the backend returns a `503 Service Unavailable` response.
    3.  **Dynamic Client Interception**: The React client intercepts the 503 response and automatically falls back to the browser-native **Web Speech API (`window.speechSynthesis`)**. The question is read out using the client's local text-to-speech engine, ensuring that the voice-driven interview loop continues without interruption.
