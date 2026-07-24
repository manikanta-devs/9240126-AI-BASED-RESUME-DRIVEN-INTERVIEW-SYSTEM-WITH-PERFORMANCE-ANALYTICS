import { test, expect } from '@playwright/test';

test('AI Interview Full Flow Test', async ({ page }) => {
  test.setTimeout(150000);
  // 1. Navigate to Landing Page
  await page.goto('/');

  // Register and Login to get a real signed JWT
  const apiContext = page.request;
  const ts = Date.now();
  const username = `candidate_${ts}`;
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

  // Verify Landing Page loaded
  await expect(page.locator('h1')).toContainText(/Ace Your Next/);

  // 2. Click "Start Interview" to navigate to Interview Page
  await page.click('text=Start Interview');

  // Verify we are on the Interview Page Setup
  await expect(page).toHaveURL(/\/dashboard\/interview/);
  
  // Use specific heading locator to avoid strict mode violations during transition
  await expect(page.getByRole('heading', { name: 'Mock Interview' })).toBeVisible();

  // 3. Configure the Interview
  // Select Target Role: Product Manager (to test custom role selection)
  await page.click('button:has-text("Product Manager")');

  // Select Difficulty Level: Easy
  await page.click('button:has-text("Fundamental concepts")');

  // Select Interview Format: Text
  await page.click('button:has-text("Type your answers")');

  // Adjust number of questions to 3
  const slider = page.locator('input[type="range"]');
  await slider.fill('3');

  // Wait a moment for react state updates
  await page.waitForTimeout(500);

  // 4. Start the Interview (generate questions)
  await page.click('button:has-text("Start Text Interview")');

  // Wait for the interview phase to transition
  await expect(page.locator('text=AI Text Interview')).toBeVisible({ timeout: 60000 });

  // Get total questions dynamically from the page text
  const total = 3;

  // Loop through all questions dynamically
  for (let i = 1; i <= total; i++) {
    // Check if the text interview cockpit is visible
    await expect(page.locator('text=AI Text Interview')).toBeVisible();

    // Type the answer
    await page.fill('textarea[placeholder="Type your answer here..."]', `This is my comprehensive answer for mock question number ${i}. I will structure my approach, handle product trade-offs, and outline metrics to track performance.`);

    // Click Submit Answer
    await page.click('button:has-text("Submit Answer")');

    // Wait for evaluation overlay to finish and disappear
    await expect(page.locator('text=Evaluating your response...')).not.toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(1000);
  }

  // Click End button to conclude interview session
  await page.click('button:has-text("End")');

  // 5. Verify results page loads
  await expect(page).toHaveURL(/\/dashboard\/results/);
  // Expect to see Candidate name (default is Candidate) on the results header card
  await expect(page.getByRole('heading', { name: /Candidate/ }).first()).toBeVisible({ timeout: 10000 });
});

