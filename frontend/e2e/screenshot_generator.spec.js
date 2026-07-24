import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Ensure screenshot directory exists
const screenshotDir = path.resolve('../docs/test-reports/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test('Generate App Screenshots', async ({ page }) => {
  test.setTimeout(180000);
  // Set viewport size for consistent, high-quality screenshots
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Navigate to Landing Page
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Ace Your Next');
  await page.screenshot({ path: path.join(screenshotDir, '01_landing_page.png') });

  // 2. Navigate to Auth Page
  await page.goto('/auth');
  await expect(page.locator('h1')).toContainText('Master Every Interview');
  await page.screenshot({ path: path.join(screenshotDir, '02_auth_page.png') });

  // 3. Register a Mock User (to view register state)
  await page.click('text=Register');
  await page.fill('#auth-username', 'screenshot_user');
  await page.fill('#auth-password', 'password123');
  await page.fill('#auth-confirm-password', 'password123');
  await page.screenshot({ path: path.join(screenshotDir, '03_auth_register.png') });

  // Register the user first via API, then log in to fetch a real JWT
  const apiContext = page.request;
  await apiContext.post('http://localhost:5000/api/auth/register', {
    data: { username: 'screenshot_user', password: 'password123' }
  });

  const loginRes = await apiContext.post('http://localhost:5000/api/auth/login', {
    data: { username: 'screenshot_user', password: 'password123' }
  });
  const { token } = await loginRes.json();

  await page.evaluate(({ token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', 'screenshot_user');
  }, { token });

  // Navigate to Dashboard
  await page.goto('/dashboard');
  await expect(page.locator('text=Logout')).toBeVisible();
  await page.waitForTimeout(1000); // Wait for animations
  await page.screenshot({ path: path.join(screenshotDir, '04_dashboard_overview.png') });

  // 5. Navigate to Resume Analysis Page
  await page.click('text=Resume Analysis');
  await expect(page).toHaveURL(/\/dashboard\/resume/);
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder="Enter candidate name..."]', 'Jane Doe');
  await page.locator('button:has-text("Paste Text")').first().click();
  await page.fill(
    'textarea[placeholder="Paste raw resume text details here..."]',
    'Jane Doe is a Senior Software Engineer with 6 years of experience in JavaScript, React, Tailwind CSS, Python, Node.js, and SQL. She designs scalable, premium frontends and optimizes cloud infrastructure.'
  );
  await page.screenshot({ path: path.join(screenshotDir, '05_resume_upload.png') });

  // 6. Run Resume Analysis
  await page.click('button:has-text("Analyze Text")');
  await expect(page.locator('text=Executive Summary')).toBeVisible({ timeout: 45000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '06_resume_score.png') });

  // 7. Run Job Match Analysis
  await page.fill(
    'textarea[placeholder="Paste the target job description details here to run ATS correlation audit..."]',
    'Looking for a Senior Frontend Web Developer with experience in React, JavaScript, HTML, CSS, and Tailwind CSS. The candidate will build high-fidelity UI components, optimize bundle sizes, and collaborate with product teams.'
  );
  await page.screenshot({ path: path.join(screenshotDir, '07_job_match_input.png') });
  await page.click('button:has-text("Run Fit Audit")');
  await expect(page.locator('text=Job Match Index')).toBeVisible({ timeout: 45000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '08_job_match_result.png') });

  // 8. Navigate to Quiz Practice Page
  await page.click('text=Quiz Practice');
  await expect(page).toHaveURL(/\/dashboard\/quiz/);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '09_quiz_setup.png') });

  // 9. Start and Take Quiz
  await page.locator('button:has-text("Initialize arena")').first().click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Assessment")');
  await expect(page.locator('text=Question 1 of')).toBeVisible({ timeout: 35000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '10_quiz_active.png') });

  // Answer the 5 questions
  for (let i = 1; i <= 5; i++) {
    await page.keyboard.press('1');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Submit Answer")');
    const nextBtn = page.locator('button:has-text("Next Question"), button:has-text("Finish Drill")').first();
    await expect(nextBtn).toBeVisible({ timeout: 15000 });
    await nextBtn.click();
    await page.waitForTimeout(400);
  }

  // Quiz completion screen
  await expect(page.locator('text=Quiz completed')).toBeVisible({ timeout: 35000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '11_quiz_result.png') });

  // 10. Navigate to Coach Page
  await page.click('a[href="/dashboard/coach"]');
  await expect(page).toHaveURL(/\/dashboard\/coach/);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '12_speaking_drills.png') });

  // 11. Navigate to Analytics Page
  await page.click('a[href="/dashboard/analytics"]');
  await expect(page).toHaveURL(/\/dashboard\/analytics/);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '13_analytics_dashboard.png') });

  // 12. Test Theme Toggle (Light Mode)
  await page.click('button:has-text("Light Mode")');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '14_light_mode_dashboard.png') });

  // Switch back to dark mode for the rest of the screenshots
  await page.click('button:has-text("Dark Mode")');
  await expect(page.locator('html')).toHaveClass(/dark/);

  // 13. Navigate to Mock Interview Setup
  await page.click('nav >> text=Interview');
  await expect(page).toHaveURL(/\/dashboard\/interview/);
  await page.waitForTimeout(1000);
  
  // Configure
  await page.click('button:has-text("Product Manager")');
  await page.click('button:has-text("Fundamental concepts")');
  await page.click('button:has-text("Type your answers")');
  const slider = page.locator('input[type="range"]');
  await slider.fill('3');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '15_interview_setup.png') });

  // 14. Start Interview & Take Question 1 Screenshot
  await page.click('button:has-text("Start Text Interview")');

  await expect(page.locator('text=AI Text Interview')).toBeVisible({ timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '16_interview_active.png') });

  const total = 3;

  // Type answer and submit to show evaluation screen screenshot
  await page.fill('textarea[placeholder="Type your answer here..."]', 'This is my detailed product manager answer. I will define the product strategy, identify the target user segments, establish KPIs, and prioritize features based on user value and implementation effort.');
  await page.screenshot({ path: path.join(screenshotDir, '17_interview_active_typed.png') });
  
  await page.click('button:has-text("Submit Answer")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '18_interview_evaluation.png') });
  await expect(page.locator('text=Evaluating your response...')).not.toBeVisible({ timeout: 60000 });

  // Loop through remaining questions dynamically to reach results
  for (let i = 2; i <= total; i++) {
    await page.fill('textarea[placeholder="Type your answer here..."]', `This is my structured answer for question ${i}. We analyze the user feedback, build a prototype, gather user metrics, and iterate rapidly.`);
    await page.click('button:has-text("Submit Answer")');
    await expect(page.locator('text=Evaluating your response...')).not.toBeVisible({ timeout: 60000 });
  }

  // Click End and take screenshot of results screen
  await page.click('button:has-text("End")');
  await expect(page).toHaveURL(/\/dashboard\/results/);
  await page.waitForTimeout(1500); // let the results chart load and animate
  await page.screenshot({ path: path.join(screenshotDir, '19_interview_results.png') });
});
