import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const screenshotDir = path.resolve('docs/test-reports/screenshots/test_run');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test('Comprehensive Full App Test Run: Dashboard, Resume, 3 Interview Types & Analytics', async ({ page, request }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1280, height: 800 });

  const username = `testrun_${Date.now()}`;
  const password = 'TestPassword123!';

  console.log('1. Registering test user via API...');
  const regRes = await request.post('http://localhost:5000/api/auth/register', {
    data: { username, password, full_name: 'Alex Mercer' }
  });
  expect(regRes.status()).toBe(201);

  const loginRes = await request.post('http://localhost:5000/api/auth/login', {
    data: { username, password }
  });
  const { token } = await loginRes.json();
  expect(token).toBeTruthy();

  // Create mock interview sessions for all 3 formats (Typed, Voice, Video) so Analytics has data for all 3
  console.log('2. Creating mock sessions for Typed, Voice, and Video interview analytics...');
  
  // Typed Session
  await request.post('http://localhost:5000/api/interview/complete', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      role: 'software_engineer',
      interview_type: 'typed',
      total_questions: 3,
      overall_score: 88,
      technical_score: 90,
      clarity_score: 85,
      completeness_score: 88,
      answers: [
        { question_text: "Explain React Virtual DOM", answer_text: "Virtual DOM is a lightweight copy of the real DOM in memory.", evaluation: { score: 90, feedback: "Great explanation" } }
      ]
    }
  });

  // Voice Session
  await request.post('http://localhost:5000/api/interview/complete', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      role: 'software_engineer',
      interview_type: 'voice',
      total_questions: 3,
      overall_score: 82,
      technical_score: 85,
      clarity_score: 80,
      completeness_score: 80,
      voice_metrics: { filler_words: 2, wpm: 140, clarity: 85 },
      answers: [
        { question_text: "Describe a difficult bug", answer_text: "I used chrome devtools heap snapshot to debug memory leaks.", evaluation: { score: 85, feedback: "Clear voice response" } }
      ]
    }
  });

  // Video Session
  await request.post('http://localhost:5000/api/interview/complete', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      role: 'software_engineer',
      interview_type: 'video',
      total_questions: 3,
      overall_score: 92,
      technical_score: 94,
      clarity_score: 90,
      completeness_score: 92,
      emotion_metrics: { eye_contact_score: 92, posture_score: 88, emotion_label: "Confident" },
      answers: [
        { question_text: "How do you handle high pressure outages?", answer_text: "I prioritize service restoration, failover replicas, and post-mortem analysis.", evaluation: { score: 94, feedback: "Excellent posture and eye contact" } }
      ]
    }
  });

  console.log('3. Authenticating browser & opening Dashboard...');
  await page.goto('http://localhost:5173/auth');
  await page.evaluate(({ token, username }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }, { token, username });

  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '01_dashboard_overview.png') });

  console.log('4. Testing Resume Analysis Page...');
  await page.goto('http://localhost:5173/dashboard/resume');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '02_resume_analysis.png') });

  console.log('5. Testing Typed Text Interview Mode...');
  await page.goto('http://localhost:5173/dashboard/interview');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '03_interview_typed_setup.png') });

  console.log('6. Testing 3D Virtual Video Interview Mode...');
  await page.goto('http://localhost:5173/dashboard/video-interview');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotDir, '04_video_interview_room.png') });

  console.log('7. Testing System Design Studio...');
  await page.goto('http://localhost:5173/dashboard/system-design');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '05_system_design_studio.png') });

  console.log('8. Testing Communication Coach Page...');
  await page.goto('http://localhost:5173/dashboard/coach');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '06_communication_coach.png') });

  console.log('9. Testing Quiz Practice Page...');
  await page.goto('http://localhost:5173/dashboard/quiz');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '07_quiz_practice.png') });

  console.log('10. Testing Analytics Dashboard (Typed, Voice & Video Sessions)...');
  await page.goto('http://localhost:5173/dashboard/analytics');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotDir, '08_analytics_dashboard_3_formats.png') });

  console.log('11. Testing Candidate Profile Center...');
  await page.goto('http://localhost:5173/dashboard/profile');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '09_candidate_profile.png') });

  console.log('🎉 Comprehensive End-to-End Test Run Completed Successfully!');
});
