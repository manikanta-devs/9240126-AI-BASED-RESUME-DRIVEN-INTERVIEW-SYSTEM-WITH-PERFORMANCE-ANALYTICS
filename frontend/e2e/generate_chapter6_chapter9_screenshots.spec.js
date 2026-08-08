import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ch6Dir = path.resolve('docs/test-reports/screenshots/chapter_6');
const ch9Dir = path.resolve('docs/test-reports/screenshots/chapter_9');

if (!fs.existsSync(ch6Dir)) fs.mkdirSync(ch6Dir, { recursive: true });
if (!fs.existsSync(ch9Dir)) fs.mkdirSync(ch9Dir, { recursive: true });

test('Generate Chapter 6 and Chapter 9 Documentation Screenshots', async ({ page, request }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 1280, height: 800 });

  const username = `docuser_${Date.now()}`;
  const password = 'DocPassword123!';

  console.log('1. Registering documentation candidate via API...');
  await request.post('http://localhost:5000/api/auth/register', {
    data: { username, password, full_name: 'Manikanta Dev' }
  });

  const loginRes = await request.post('http://localhost:5000/api/auth/login', {
    data: { username, password }
  });
  const { token } = await loginRes.json();

  // Create completed sessions for analytics & reports
  await request.post('http://localhost:5000/api/interview/complete', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      role: 'software_engineer',
      interview_type: 'video',
      total_questions: 5,
      overall_score: 91,
      technical_score: 94,
      clarity_score: 88,
      completeness_score: 90,
      voice_metrics: { filler_words: 1, wpm: 145, clarity: 90 },
      emotion_metrics: { eye_contact_score: 94, posture_score: 90, emotion_label: "Confident" },
      answers: [
        { question_text: "Explain microservice architecture trade-offs", answer_text: "Microservices improve fault isolation and scaling but increase deployment complexity.", evaluation: { score: 94, feedback: "Excellent architectural breakdown" } }
      ]
    }
  });

  // CHAPTER 9: 1. System Home Page (Landing Page)
  console.log('Capturing System Home Page...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch9Dir, '01_system_home_page.png') });

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

  // CHAPTER 6: 2. Resume Upload Interface & CHAPTER 9: 3. Resume Analysis Module (Upload State)
  console.log('Capturing Resume Upload Interface...');
  await page.goto('http://localhost:5173/dashboard/resume');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '02_resume_upload_interface.png') });

  // Analyze Resume Text to generate Result & Study Roadmap
  await page.fill('input[placeholder="Enter candidate name..."]', 'Manikanta Dev');
  await page.locator('button:has-text("Paste Text")').first().click();
  await page.fill(
    'textarea[placeholder="Paste raw resume text details here..."]',
    'Manikanta Dev is a Senior Software Engineer with 5 years experience in React, Python, Flask, Node.js, PostgreSQL, Docker, and AWS. Built scalable AI interview systems and performance analytics pipelines.'
  );
  await page.click('button:has-text("Analyze Text")');
  await page.waitForTimeout(3000);

  // CHAPTER 6: 3. Resume Analysis Result & CHAPTER 9: 3. Resume Analysis Module (Scored State)
  console.log('Capturing Resume Analysis Result...');
  await page.screenshot({ path: path.join(ch6Dir, '03_resume_analysis_result.png') });
  await page.screenshot({ path: path.join(ch9Dir, '03_resume_analysis_module.png') });

  // CHAPTER 6: 5. Personalized Study Roadmap
  console.log('Capturing Personalized Study Roadmap...');
  await page.screenshot({ path: path.join(ch6Dir, '05_personalized_study_roadmap.png') });

  // CHAPTER 6: 4. AI Coach Dashboard
  console.log('Capturing AI Coach Dashboard...');
  await page.goto('http://localhost:5173/dashboard/coach');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '04_ai_coach_dashboard.png') });

  // CHAPTER 6: 6. Quiz Practice Dashboard
  console.log('Capturing Quiz Practice Dashboard...');
  await page.goto('http://localhost:5173/dashboard/quiz');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '06_quiz_practice_dashboard.png') });

  // Start Quiz to capture Performance Report
  await page.locator('button:has-text("Initialize arena")').first().click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Assessment")');
  await page.waitForTimeout(1000);

  // CHAPTER 6: 7. Quiz Performance Report
  console.log('Capturing Quiz Performance Report...');
  await page.screenshot({ path: path.join(ch6Dir, '07_quiz_performance_report.png') });

  // CHAPTER 6: 8. AI Mock Interview Interface & CHAPTER 9: 4. AI Mock Interview Module
  console.log('Capturing AI Mock Interview Interface...');
  await page.goto('http://localhost:5173/dashboard/interview');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ch6Dir, '08_ai_mock_interview_interface.png') });
  await page.screenshot({ path: path.join(ch9Dir, '04_ai_mock_interview_module.png') });

  // CHAPTER 9: 5. Live Interview and AI Evaluation (1080p Video Stage)
  console.log('Capturing Live Interview and AI Evaluation...');
  await page.goto('http://localhost:5173/dashboard/video-interview');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ch9Dir, '05_live_interview_and_ai_evaluation.png') });

  // CHAPTER 6: 10. Performance Analytics Dashboard & CHAPTER 9: 6. Performance Analytics Dashboard
  console.log('Capturing Performance Analytics Dashboard...');
  await page.goto('http://localhost:5173/dashboard/analytics');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ch6Dir, '10_performance_analytics_dashboard.png') });
  await page.screenshot({ path: path.join(ch9Dir, '06_performance_analytics_dashboard.png') });

  // CHAPTER 6: 9. Interview Performance Report & CHAPTER 9: 7. Final Interview Report
  console.log('Capturing Final Interview Report...');
  await page.screenshot({ path: path.join(ch6Dir, '09_interview_performance_report.png') });
  await page.screenshot({ path: path.join(ch9Dir, '07_final_interview_report.png') });

  console.log('🎉 All Chapter 6 & Chapter 9 Documentation Screenshots Captured Successfully!');
});
