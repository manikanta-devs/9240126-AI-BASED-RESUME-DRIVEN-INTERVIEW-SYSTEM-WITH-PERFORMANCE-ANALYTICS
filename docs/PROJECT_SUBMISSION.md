AI-BASED RESUME DRIVEN INTERVIEW SYSTEM WITH PERFORMANCE ANALYTICS

Project Title and Objective
---------------------------
Title: AI-BASED RESUME DRIVEN INTERVIEW SYSTEM WITH PERFORMANCE ANALYTICS

Objective:
The project builds an intelligent platform that automatically generates personalized interview questions from a candidate's resume, evaluates text and voice answers using AI techniques, and provides performance scores, feedback, and analytics to help students prepare for real interviews.

Problem Statement
-----------------
Traditional interview practice platforms provide generic, one-size-fits-all question banks and little measurable feedback. Students need personalized practice tailored to their resume and clear, actionable analytics to identify strengths and weaknesses.

Literature Survey (short)
-------------------------
- Resume parsing & NER: classical NLP pipelines and modern transformer-based extraction for skills and experience.  
- Question generation: prompt-engineered LLM-based generation vs. template/rule-based fallbacks.  
- Automatic evaluation: LLM scoring combined with deterministic heuristics for reliability.  
- Learning analytics: dashboards and skill-gap reports improve targeted practice and retention.

Methodology / Approach
----------------------
1. Resume Analysis
   - Parse uploaded resume to extract skills, roles, education, and experience.
   - Seed question templates and AI prompts with extracted entities.

2. Question Generation
   - AI-first generation using prompt templates and LLMs (Hugging Face API, optional local LLM, Gemini fallback).
   - Structured JSON output requirement from the model; robust parsing.
   - Fallback question bank for offline/no-key mode.

3. Interview Flow
   - Frontend simulates interviews (text + voice) and sends answers to backend endpoints for evaluation.
   - Backend endpoints handle sessions, adaptive difficulty, and persistence.

4. Answer Evaluation
   - LLM-based evaluation when provider available; fallback heuristic evaluator otherwise.
   - Outputs detailed scores (technical, clarity, completeness, relevance, depth), coaching tips, and next-action suggestions.

5. Analytics
   - Aggregate session results into skill-gap reports and dashboards for progress tracking.

Dataset and Tools Used
----------------------
- Data files: `data/quizzes.json` (question bank), `data/sessions.json` (session persistence).
- Backend: Python 3.10+, Flask, python-dotenv, requests, wikipedia. Key code under `backend/`.
- AI providers: Hugging Face Inference API (primary), optional `transformers` local LLM (LocalLLM), Google Gemini (optional fallback).
- Frontend: React + Vite + Tailwind; source in `frontend/src/`.
- Dev tools: `black`, `flake8`, `pytest`, ESLint.
- Packaging: Docker Compose (`docker-compose.yml`), packaging script `package_release.ps1`.

Work Completed So Far
---------------------
- Implemented AI provider chain and robust JSON parsing: `backend/ai/gemini_service.py`.
- Question generator and fallback templates: `backend/ai/question_generator.py`.
- Answer evaluator with structured outputs + fallback heuristic: `backend/ai/answer_evaluator.py`.
- Wiki helper for context enrichment: `backend/ai/wiki_service.py`.
- Optional local LLM wrapper: `backend/ai/local_llm.py` (optional heavy dependency).
- Frontend UI for interviews and analytics (React + Vite): `frontend/src/pages/InterviewPage.jsx`, `frontend/src/pages/AnalyticsPage.jsx`.
- Basic testing & lint: `tests/test_health.py`, `.flake8`, `frontend/.eslintrc.json`.
- Documentation & packaging for admin handoff: `ADMIN_SETUP.md`, `.env.example`, Docker Compose updates.

Future Plan and Expected Outcomes
---------------------------------
Short term:
- Fix remaining frontend lint issues and add frontend unit tests (vitest + React Testing Library).
- Expand backend unit tests for question generation and evaluation.
- Add privacy & data retention policy to docs.

Medium term:
- Add CI pipeline (GitHub Actions) to run formatters, linters, and tests on PRs.
- Improve evaluation reliability by ensembling LLM + deterministic heuristics and human-in-the-loop spot checks.
- Conduct small user study (N≈10) to validate improvement in candidate performance.

Expected outcomes:
- Personalized interview practice tailored to resumes, actionable analytics, and robust fallback for offline/no-key usage.

Project Demo Notes
------------------
- Run backend: `python backend/app.py` (or use the provided VS Code task).  
- Run frontend: `cd frontend && npm run dev`.  
- Run Docker: `docker-compose up --build`.  
- Tests & linters: `python -m pytest`, `python -m flake8 backend`, `npx eslint "frontend/src/**/*.{js,jsx}"`.

Common Viva / Submission Questions and Suggested Answers
--------------------------------------------------------
Q1: What is the core contribution of your project?
A1: The system personalizes interview questions based on a candidate's resume and provides AI-driven real-time evaluation and analytics, enabling targeted practice and measurable improvement.

Q2: Which AI providers does the system support and why?
A2: The project supports a priority chain: LocalLLM (optional) → Hugging Face Inference API (primary) → Google Gemini (fallback). This allows flexible deployment for local testing, free/paid cloud usage, and a fallback when keys are missing.

Q3: How do you ensure evaluation remains reliable when an LLM is unavailable?
A3: We implement a deterministic fallback evaluator that applies heuristics to measure structure, presence of examples, numeric evidence, trade-off discussion, and produce reproducible scores and coaching tips.

Q4: How is data persisted and what about privacy?
A4: Sessions and quizzes are persisted to JSON files under `data/` for the demo. For production, we recommend a secured database, explicit consent, retention policy, encryption at rest, and masking PII before processing.

Q5: How would you extend this project further?
A5: Add CI, more automated tests, integrate user accounts and secure storage, add multi-language prompts, build a human-evaluator interface for calibration, and run a controlled user study measuring score improvements.

Appendix: Useful File References
- Backend entry: [backend/app.py](backend/app.py)
- Question generator: [backend/ai/question_generator.py](backend/ai/question_generator.py)
- Answer evaluator: [backend/ai/answer_evaluator.py](backend/ai/answer_evaluator.py)
- Gemini/HF wrapper: [backend/ai/gemini_service.py](backend/ai/gemini_service.py)
- Frontend interview page: frontend/src/pages/InterviewPage.jsx
- Frontend analytics page: frontend/src/pages/AnalyticsPage.jsx


Prepared by: Project Team
Date: May 31, 2026

