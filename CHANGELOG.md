# Changelog — TalentForge AI v4.1

All notable changes to the `AI-BASED-RESUME-DRIVEN-INTERVIEW-SYSTEM` project are documented below.

---

## [Phase 6] — Version 4.1 Feature Expansion & System Polish
- **Real-Time STAR Method Analyzer (`/api/interview/evaluate-star`)**:
  - Implemented `StarAnalyzer` engine for sentence-by-sentence classification (Situation, Task, Action, Result).
  - Quantitative metric detection (detects missing numbers/KPIs in Result section).
  - AI STAR rewrites and `StarBreakdownCard` frontend component with component score badges.
- **Company-Specific & Culture-Fit Interview Mode (`/api/interview/companies` & `/api/interview/company-questions`)**:
  - Created `CompanyPresetEngine` supporting Amazon (16 Leadership Principles), Google (Googleyness & Scale), Meta (Move Fast), Netflix (Freedom & Responsibility), Apple (Precision), Microsoft (Growth Mindset), and Tech Startups.
  - Implemented `CompanySelector` component for selecting target company culture during interview setup.
- **System Design & Architecture Studio (`/api/interview/system-design`)**:
  - Built `SystemDesignEvaluator` and `SystemDesignPage` supporting real distributed system scenarios (URL Shortener, Distributed Rate Limiter, Live Video Streaming, Real-time Chat, Notification Engine).
  - Automated detection of Single Points of Failure (SPOFs), database selection analysis, CAP/trade-off breakdown, and Mermaid JS architecture flow generation.
- **System Verification & Coverage**:
  - Backend tests expanded to 109 Pytest cases (100% green).
  - Frontend tests expanded to 38 Vitest cases (100% green across 7 test suites).
  - Vite production build verified with 0 warnings/errors.

---

## [Phase 0 - 5] — Core Platform Upgrades (v4.0)
- Dual-driver database persistence (SQLite/PostgreSQL) with JWT authentication and IDOR protection.
- Reusable UI component library (`AuroraBackground`, `SpotlightCard`, `GlassPanel`, `ShimmerButton`, `NumberTicker`).
- Candidate Profile center (`/dashboard/profile`) & ReportLab PDF evaluation report exporter (`GET /api/interview/session/<id>/pdf`).
