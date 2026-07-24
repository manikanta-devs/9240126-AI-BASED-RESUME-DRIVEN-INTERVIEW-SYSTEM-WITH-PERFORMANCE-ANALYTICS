import { test, expect } from '@playwright/test';

test('AI Interview System Comprehensive E2E Test', async ({ page }) => {
  // 1. Navigate to Landing Page
  await page.goto('/');

  // Register and Login to get a real signed JWT
  const apiContext = page.request;
  const ts = Date.now();
  const username = `janedoe_${ts}`;
  const password = 'TestPassword123!';

  await apiContext.post('http://localhost:5000/api/auth/register', {
    data: { username, password }
  });

  const loginRes = await apiContext.post('http://localhost:5000/api/auth/login', {
    data: { username, password }
  });
  const { token } = await loginRes.json();

  // Set signed token in localStorage
  await page.evaluate(({ token, username }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }, { token, username });

  // Reload to reflect localstorage state in React
  await page.reload();

  await expect(page.locator('h1')).toContainText('Ace Your Next');

  // Click "Start Interview" or "Open Dashboard" to navigate to dashboard overview
  await page.locator('text=Open Dashboard').or(page.locator('text=Start Interview')).first().click();
  await expect(page).toHaveURL(/\/dashboard/);

  // 2. Verify Resume Page
  await page.click('text=Resume Analysis');
  await expect(page).toHaveURL(/\/dashboard\/resume/);
  await page.waitForTimeout(1000); // let page animation settle

  // Fill candidate name
  await page.fill('input[placeholder="Enter candidate name..."]', 'Jane Doe');

  // Switch tab to Paste Text
  await page.locator('button:has-text("Paste Text")').first().click();

  await page.fill(
    'textarea[placeholder="Paste raw resume text details here..."]',
    'Jane Doe is a Software Engineer with 5 years of experience in JavaScript, React, Tailwind CSS, Node.js, and Python. She builds scalable, premium user interfaces and optimizes web application load times.'
  );

  // Trigger analysis
  await page.click('button:has-text("Analyze Text")');

  // Wait for resume analysis to complete
  await expect(page.locator('text=Executive Summary')).toBeVisible({ timeout: 45000 });

  // Paste a job description to test 2027 Job Match (must be >= 80 characters to enable button)
  await page.fill(
    'textarea[placeholder="Paste the target job description details here to run ATS correlation audit..."]',
    'Looking for a Frontend Web Developer with professional experience in React, JavaScript, HTML, CSS, and Tailwind CSS. The candidate will build high fidelity UI components, optimize bundle sizes, and collaborate with product teams.'
  );

  // Click Run Fit Audit
  await page.click('button:has-text("Run Fit Audit")');

  // Wait for job match analysis to complete
  await expect(page.locator('text=Job Match Index')).toBeVisible({ timeout: 45000 });

  // 3. Verify Quiz Practice Page
  await page.click('text=Quiz Practice');
  await expect(page).toHaveURL(/\/dashboard\/quiz/);
  await page.waitForTimeout(1000); // let page animation settle

  // Open quiz setup modal and click Start Assessment
  await page.locator('button:has-text("Initialize arena")').first().click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Assessment")');

  // Wait for the quiz screen to load
  await expect(page.locator('text=Question 1 of')).toBeVisible({ timeout: 35000 });

  // Answer the questions
  for (let i = 1; i <= 5; i++) {
    // Select Option 1 (using keyboard key '1')
    await page.keyboard.press('1');
    await page.waitForTimeout(200);

    // Click Submit Answer
    await page.click('button:has-text("Submit Answer")');
    
    // Wait for Next Question or Finish Drill button to appear
    const nextBtn = page.locator('button:has-text("Next Question"), button:has-text("Finish Drill")').first();
    await expect(nextBtn).toBeVisible({ timeout: 15000 });
    await nextBtn.click();
    await page.waitForTimeout(400);
  }

  // Quiz completion should load
  await expect(page.locator('text=Quiz completed')).toBeVisible({ timeout: 35000 });
  await page.click('button:has-text("Take another quiz")');

  // 4. Verify Coach Page
  await page.click('a[href="/dashboard/coach"]');
  await expect(page).toHaveURL(/\/dashboard\/coach/);
  await page.waitForTimeout(1000); // let page animation settle
  await expect(page.locator('text=Interactive Guideline Center')).toBeVisible({ timeout: 10000 });

  // 5. Verify Analytics Page
  await page.click('a[href="/dashboard/analytics"]');
  await expect(page).toHaveURL(/\/dashboard\/analytics/);
  await page.waitForTimeout(1000); // let page animation settle
  await expect(page.getByRole('heading', { name: 'Performance Analytics' }).first()).toBeVisible({ timeout: 10000 });

  // 6. Test Theme Toggle (Dark/Light mode)
  // Default app theme is dark mode
  await expect(page.locator('html')).toHaveClass(/dark/);

  // Switch to Light Mode
  await page.click('button:has-text("Light Mode")');
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  // Switch back to Dark Mode
  await page.click('button:has-text("Dark Mode")');
  await expect(page.locator('html')).toHaveClass(/dark/);
});
