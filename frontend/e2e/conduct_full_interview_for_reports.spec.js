import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ch6Dir = path.resolve('docs/test-reports/screenshots/chapter_6');
const ch9Dir = path.resolve('docs/test-reports/screenshots/chapter_9');
const docsRootDir = path.resolve('docs');
const localScreenshotsCh6 = path.resolve('docs/screenshots/chapter_6');
const localScreenshotsCh9 = path.resolve('docs/screenshots/chapter_9');

[ch6Dir, ch9Dir, docsRootDir, localScreenshotsCh6, localScreenshotsCh9].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

test('Conduct Full Interview & Generate Rich Populated Performance Reports', async ({ page, request }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 1536, height: 864 });

  const username = `candidate_${Date.now()}`;
  const password = 'PassWord123!';
  const candidateName = 'Jane Doe';

  console.log('1. Registering candidate and authenticating...');
  await request.post('http://localhost:5000/api/auth/register', {
    data: { username, password, full_name: candidateName }
  });

  const loginRes = await request.post('http://localhost:5000/api/auth/login', {
    data: { username, password }
  });
  const { token } = await loginRes.json();

  // Create populated interview session with high scores via API
  console.log('2. Creating completed mock interview session with high scores...');
  await request.post('http://localhost:5000/api/interview/complete', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      role: 'software_engineer',
      interview_type: 'video',
      total_questions: 5,
      overall_score: 88,
      technical_score: 92,
      clarity_score: 86,
      completeness_score: 88,
      voice_metrics: { filler_words: 2, wpm: 142, clarity: 88 },
      emotion_metrics: { eye_contact_score: 94, posture_score: 90, emotion_label: "Confident" },
      answers: [
        { question_text: "Explain how you design a resilient microservices architecture.", answer_text: "Situation: At my previous company, our monolith faced high latency during peak traffic.\nTask: Break down monolith into decoupled microservices.\nAction: Implemented API Gateway, Redis caching, gRPC inter-service communication, and PostgreSQL read-replicas.\nResult: Reduced API response latency by 65% and achieved 99.99% uptime.", evaluation: { score: 94, feedback: "Outstanding STAR structure and solid architectural trade-off analysis." } },
        { question_text: "How do you handle a production database deadlock scenario?", answer_text: "Isolated queries via pg_stat_activity, optimized locking order, added query timeouts, and introduced exponential backoff retry logic.", evaluation: { score: 90, feedback: "Great database performance debugging technique." } },
        { question_text: "Describe a conflict with a team member and how you resolved it.", answer_text: "Discussed architectural preferences openly, conducted a quick benchmark benchmark test, and agreed on data-backed metrics.", evaluation: { score: 85, feedback: "Strong interpersonal communication and team collaboration skills." } }
      ]
    }
  });

  // Also submit completed quiz session
  await request.post('http://localhost:5000/api/quiz/submit', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      category: 'python',
      score: 90,
      total: 5,
      correct: 4,
      answers: [
        { question_id: 'q1', is_correct: true },
        { question_id: 'q2', is_correct: true },
        { question_id: 'q3', is_correct: true },
        { question_id: 'q4', is_correct: true },
        { question_id: 'q5', is_correct: false }
      ]
    }
  });

  // Authenticate browser session
  await page.goto('http://localhost:5173/auth');
  await page.evaluate(({ token, username }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }, { token, username });

  // 1. Capture Active Interview Interface
  console.log('3. Capturing AI Mock Interview Interface...');
  await page.goto('http://localhost:5173/dashboard/interview');
  await page.waitForTimeout(1500);

  const mockInterviewPaths = [
    path.join(ch6Dir, '08_ai_mock_interview_interface.png'),
    path.join(ch9Dir, '04_ai_mock_interview_module.png'),
    path.join(docsRootDir, '08_ai_mock_interview_interface.png'),
    path.join(docsRootDir, '04_ai_mock_interview_module.png'),
    path.join(localScreenshotsCh6, '08_ai_mock_interview_interface.png'),
    path.join(localScreenshotsCh9, '04_ai_mock_interview_module.png')
  ];

  for (const p of mockInterviewPaths) {
    await page.screenshot({ path: p });
  }

  // 2. Capture Populated Performance Analytics Dashboard
  console.log('4. Capturing Populated Performance Analytics Dashboard...');
  await page.goto('http://localhost:5173/dashboard/analytics');
  await page.waitForTimeout(2000);

  const analyticsPaths = [
    path.join(ch6Dir, '10_performance_analytics_dashboard.png'),
    path.join(ch9Dir, '06_performance_analytics_dashboard.png'),
    path.join(docsRootDir, '10_performance_analytics_dashboard.png'),
    path.join(docsRootDir, '06_performance_analytics_dashboard.png'),
    path.join(localScreenshotsCh6, '10_performance_analytics_dashboard.png'),
    path.join(localScreenshotsCh9, '06_performance_analytics_dashboard.png')
  ];

  for (const p of analyticsPaths) {
    await page.screenshot({ path: p });
  }

  // 3. Capture Populated Interview Performance Report / Final Interview Report
  console.log('5. Capturing Populated Interview Performance Report...');
  // Click on the completed session card to view report details
  const sessionCard = page.locator('.cursor-pointer').first();
  if (await sessionCard.isVisible()) {
    await sessionCard.click();
    await page.waitForTimeout(1000);
  }

  const reportPaths = [
    path.join(ch6Dir, '09_interview_performance_report.png'),
    path.join(ch9Dir, '07_final_interview_report.png'),
    path.join(docsRootDir, '09_interview_performance_report.png'),
    path.join(docsRootDir, '07_final_interview_report.png'),
    path.join(localScreenshotsCh6, '09_interview_performance_report.png'),
    path.join(localScreenshotsCh9, '07_final_interview_report.png')
  ];

  for (const p of reportPaths) {
    await page.screenshot({ path: p });
  }

  // 4. Capture Populated Quiz Performance Report
  console.log('6. Capturing Populated Quiz Performance Report...');
  await page.goto('http://localhost:5173/dashboard/quiz');
  await page.waitForTimeout(1500);

  const quizPaths = [
    path.join(ch6Dir, '07_quiz_performance_report.png'),
    path.join(docsRootDir, '07_quiz_performance_report.png'),
    path.join(localScreenshotsCh6, '07_quiz_performance_report.png')
  ];

  for (const p of quizPaths) {
    await page.screenshot({ path: p });
  }

  console.log('🎉 Completed Full Interview & Successfully Regenerated All Populated Performance Reports!');
});
