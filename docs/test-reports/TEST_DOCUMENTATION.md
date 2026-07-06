# AI Interview System - Test Execution & Verification Report

Welcome to the automated test verification report for the **AI-Based Resume Driven Interview System**. This document summarizes the test runs, execution statistics, and includes screenshots of the application workflows captured during testing.

---

## 📊 Test Execution Summary

| Test Suite | Framework | Total Tests | Passed | Failed | Status | Duration |
|------------|-----------|-------------|--------|--------|--------|----------|
| Backend API & Logic | pytest | 70 | 70 | 0 | ✅ PASSED | 35.45s |
| Frontend Unit | vitest | 15 | 15 | 0 | ✅ PASSED | 6.11s |
| End-to-End | Playwright | 3 | 3 | 0 | ✅ PASSED | 1.4m |

---

## 🖥️ Terminal Outputs

### Backend Tests (pytest)
Below is the execution result of the Flask API unit and integration test suite, verifying all core AI fallbacks, route parameters, validators, and endpoints.
![Pytest Terminal Run](./screenshots/pytest_terminal.png)

### Frontend Unit Tests (vitest)
Below is the execution result of the React application unit tests, verifying the state store management and emotion analysis utilities.
![Vitest Terminal Run](./screenshots/vitest_terminal.png)

---

## 🎨 Application Flows (E2E Walkthrough)

### 1. Landing & Authentication
The candidate is greeted by a modern, glassy Landing Page. If they are not logged in, accessing the dashboard routes redirects them to the premium Authentication screen where they can sign in or create an account.

| Landing Page | Authentication Page |
|--------------|---------------------|
| ![Landing Page](./screenshots/01_landing_page.png) | ![Auth Page](./screenshots/02_auth_page.png) |

| Registration Form |
|-------------------|
| ![Registration State](./screenshots/03_auth_register.png) |

### 2. Candidate Dashboard Overview
Once authenticated, the candidate is redirected to the central Dashboard hub showcasing the navigation panel, speaking coaching drills, resume analysis indicators, and historical stats.

| Dashboard Hub |
|---------------|
| ![Dashboard Overview](./screenshots/04_dashboard_overview.png) |

### 3. Resume Analysis & Job Matching
Candidates can paste their resume and analyze it. The NLP parser extracts skills, experience levels, and computes a resume score. Additionally, they can paste a target Job Description to receive a skill-match percentage, gaps analysis, and recommended action steps.

| Resume Analysis Setup | Resume Scoring Results |
|-----------------------|------------------------|
| ![Resume Upload](./screenshots/05_resume_upload.png) | ![Resume Score](./screenshots/06_resume_score.png) |

| Job Description Comparison | Job Fit Report |
|----------------------------|----------------|
| ![Job Description Match](./screenshots/07_job_match_input.png) | ![Job Match Results](./screenshots/08_job_match_result.png) |

### 4. Practice Quizzes & speaking Drills
To prepare for technical tests, the system features a Quiz module covering core coding topics, database queries, and aptitude tests. It also has a speaking Coach feature that suggests voice-based drills.

| Quiz Setup | Active Quiz Question |
|------------|----------------------|
| ![Quiz Setup](./screenshots/09_quiz_setup.png) | ![Quiz Active](./screenshots/10_quiz_active.png) |

| Quiz Results Screen | Speaking Coach Drills |
|---------------------|-----------------------|
| ![Quiz Completed](./screenshots/11_quiz_result.png) | ![Speaking Coach](./screenshots/12_speaking_drills.png) |

### 5. Performance Analytics & Theme Configuration
The analytics section provides deep insight using interactive radar charts, skill-breakdown metrics, and weakness-detection cards. Users can toggle light/dark modes seamlessly across the UI.

| Performance Analytics | Dark Mode Dashboard |
|--------------|---------------------|
| ![Analytics Dashboard](./screenshots/13_analytics_dashboard.png) | ![Dark Mode Dashboard](./screenshots/14_dark_mode_dashboard.png) |

### 6. Interactive Mock Interview Flow
The core feature: a timed mock interview using Gemini AI. The candidate configures their role, format, and questions. During the session, the AI asks structured questions based on the candidate's resume and scores typed/voice answers immediately.

| Configure Interview | Active Interview Question |
|---------------------|---------------------------|
| ![Interview Setup](./screenshots/15_interview_setup.png) | ![Active Question](./screenshots/16_interview_active.png) |

| Typing Answer | AI Answer Evaluation |
|---------------|----------------------|
| ![Typed Answer](./screenshots/17_interview_active_typed.png) | ![Answer Evaluated](./screenshots/18_interview_evaluation.png) |

| Final Interview Results Summary |
|---------------------------------|
| ![Interview Results](./screenshots/19_interview_results.png) |

---
*Report generated on 2026-07-02.*
