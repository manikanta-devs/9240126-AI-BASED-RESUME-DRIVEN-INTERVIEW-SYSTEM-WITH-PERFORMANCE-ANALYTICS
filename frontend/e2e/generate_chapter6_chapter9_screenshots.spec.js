import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ch6Dir = path.resolve('docs/test-reports/screenshots/chapter_6');
const ch9Dir = path.resolve('docs/test-reports/screenshots/chapter_9');
const docsRootDir = path.resolve('docs');

if (!fs.existsSync(ch6Dir)) fs.mkdirSync(ch6Dir, { recursive: true });
if (!fs.existsSync(ch9Dir)) fs.mkdirSync(ch9Dir, { recursive: true });

test('Generate Chapter 6 and Chapter 9 Documentation Screenshots - Full Widescreen UI', async ({ page, request }) => {
  test.setTimeout(300000);
  // Full 16:9 widescreen viewport for complete sidebar + content capture
  await page.setViewportSize({ width: 1536, height: 864 });

  const username = `docuser_${Date.now()}`;
  const password = 'DocPassword123!';

  console.log('1. Registering documentation candidate via API...');
  await request.post('http://localhost:5000/api/auth/register', {
    data: { username, password, full_name: 'Jane Doe' }
  });

  const loginRes = await request.post('http://localhost:5000/api/auth/login', {
    data: { username, password }
  });
  const { token } = await loginRes.json();

  // Create complete interview session records for rich analytics & radar charts
  await request.post('http://localhost:5000/api/interview/complete', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      role: 'software_engineer',
      interview_type: 'video',
      total_questions: 5,
      overall_score: 88,
      technical_score: 90,
      clarity_score: 86,
      completeness_score: 88,
      voice_metrics: { filler_words: 2, wpm: 140, clarity: 86 },
      emotion_metrics: { eye_contact_score: 92, posture_score: 88, emotion_label: "Confident" },
      answers: [
        { question_text: "Explain React Virtual DOM and reconciliation algorithm", answer_text: "Virtual DOM is an in-memory representation of real DOM elements. React uses diffing to update minimal nodes efficiently.", evaluation: { score: 90, feedback: "Excellent technical explanation" } },
        { question_text: "Describe a high-pressure system outage you resolved", answer_text: "Analyzed memory heap dumps, isolated memory leaks in connection pool, and deployed hotfix within 15 minutes.", evaluation: { score: 86, feedback: "Great STAR response" } }
      ]
    }
  });

  // CHAPTER 9: 1. System Home Page (Landing Page)
  console.log('Capturing System Home Page...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch9Dir, '01_system_home_page.png') });
  await page.screenshot({ path: path.join(docsRootDir, '01_system_home_page.png') });

  // Authenticate browser session
  await page.goto('http://localhost:5173/auth');
  await page.evaluate(({ token, username }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }, { token, username });

  // CHAPTER 6: 1. Dashboard Module & CHAPTER 9: 2. User Dashboard
  console.log('Capturing Dashboard Module...');
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ch6Dir, '01_dashboard_module.png') });
  await page.screenshot({ path: path.join(ch9Dir, '02_user_dashboard.png') });
  await page.screenshot({ path: path.join(docsRootDir, '01_dashboard_module.png') });
  await page.screenshot({ path: path.join(docsRootDir, '02_user_dashboard.png') });

  // CHAPTER 6: 2. Resume Upload Interface
  console.log('Capturing Resume Upload Interface...');
  await page.goto('http://localhost:5173/dashboard/resume');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '02_resume_upload_interface.png') });
  await page.screenshot({ path: path.join(docsRootDir, '02_resume_upload_interface.png') });

  // Analyze Resume Text to generate Result & Study Roadmap
  await page.fill('input[placeholder="Enter candidate name..."]', 'Jane Doe');
  await page.locator('button:has-text("Paste Text")').first().click();
  await page.fill(
    'textarea[placeholder="Paste raw resume text details here..."]',
    'Jane Doe is a Senior Product Manager & Full Stack Software Engineer with 6 years experience in React, Python, Flask, Node.js, PostgreSQL, Docker, and AWS. Built scalable AI interview systems and performance analytics pipelines.'
  );
  await page.click('button:has-text("Analyze Text")');
  await page.waitForTimeout(3000);

  // CHAPTER 6: 3. Resume Analysis Result & CHAPTER 9: 3. Resume Analysis Module
  console.log('Capturing Resume Analysis Result...');
  await page.screenshot({ path: path.join(ch6Dir, '03_resume_analysis_result.png') });
  await page.screenshot({ path: path.join(ch9Dir, '03_resume_analysis_module.png') });
  await page.screenshot({ path: path.join(docsRootDir, '03_resume_analysis_result.png') });
  await page.screenshot({ path: path.join(docsRootDir, '03_resume_analysis_module.png') });

  // CHAPTER 6: 5. Personalized Study Roadmap
  console.log('Capturing Personalized Study Roadmap...');
  await page.screenshot({ path: path.join(ch6Dir, '05_personalized_study_roadmap.png') });
  await page.screenshot({ path: path.join(docsRootDir, '05_personalized_study_roadmap.png') });

  // CHAPTER 6: 4. AI Coach Dashboard
  console.log('Capturing AI Coach Dashboard...');
  await page.goto('http://localhost:5173/dashboard/coach');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '04_ai_coach_dashboard.png') });
  await page.screenshot({ path: path.join(docsRootDir, '04_ai_coach_dashboard.png') });

  // CHAPTER 6: 6. Quiz Practice Dashboard
  console.log('Capturing Quiz Practice Dashboard...');
  await page.goto('http://localhost:5173/dashboard/quiz');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '06_quiz_practice_dashboard.png') });
  await page.screenshot({ path: path.join(docsRootDir, '06_quiz_practice_dashboard.png') });

  // Start Quiz to capture Performance Report
  await page.locator('button:has-text("Initialize arena")').first().click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Assessment")');
  await page.waitForTimeout(1000);

  // CHAPTER 6: 7. Quiz Performance Report
  console.log('Capturing Quiz Performance Report...');
  await page.screenshot({ path: path.join(ch6Dir, '07_quiz_performance_report.png') });
  await page.screenshot({ path: path.join(docsRootDir, '07_quiz_performance_report.png') });

  // CHAPTER 6: 8. AI Mock Interview Interface & CHAPTER 9: 4. AI Mock Interview Module
  console.log('Capturing AI Mock Interview Interface...');
  await page.goto('http://localhost:5173/dashboard/interview');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '08_ai_mock_interview_interface.png') });
  await page.screenshot({ path: path.join(ch9Dir, '04_ai_mock_interview_module.png') });
  await page.screenshot({ path: path.join(docsRootDir, '08_ai_mock_interview_interface.png') });
  await page.screenshot({ path: path.join(docsRootDir, '04_ai_mock_interview_module.png') });

  // CHAPTER 9: 5. Live Interview and AI Evaluation (1080p Video Stage)
  console.log('Capturing Live Interview and AI Evaluation...');
  await page.goto('http://localhost:5173/dashboard/video-interview');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ch9Dir, '05_live_interview_and_ai_evaluation.png') });
  await page.screenshot({ path: path.join(docsRootDir, '05_live_interview_and_ai_evaluation.png') });

  // CHAPTER 6: 10. Performance Analytics Dashboard & CHAPTER 9: 6. Performance Analytics Dashboard
  console.log('Capturing Performance Analytics Dashboard...');
  await page.goto('http://localhost:5173/dashboard/analytics');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ch6Dir, '10_performance_analytics_dashboard.png') });
  await page.screenshot({ path: path.join(ch9Dir, '06_performance_analytics_dashboard.png') });
  await page.screenshot({ path: path.join(docsRootDir, '10_performance_analytics_dashboard.png') });
  await page.screenshot({ path: path.join(docsRootDir, '06_performance_analytics_dashboard.png') });

  // CHAPTER 6: 9. Interview Performance Report & CHAPTER 9: 7. Final Interview Report
  console.log('Capturing Final Interview Report...');
  await page.screenshot({ path: path.join(ch6Dir, '09_interview_performance_report.png') });
  await page.screenshot({ path: path.join(ch9Dir, '07_final_interview_report.png') });
  await page.screenshot({ path: path.join(docsRootDir, '09_interview_performance_report.png') });
  await page.screenshot({ path: path.join(docsRootDir, '07_final_interview_report.png') });

  console.log('🎉 Full Widescreen Browser UI Screenshots Captured Successfully!');
});
