import { test, expect } from '@playwright/test';

test('AI Interview Full Flow Test', async ({ page }) => {
  // 1. Navigate to Landing Page
  await page.goto('/');

  // Set mock token in localStorage
  await page.evaluate(() => {
    localStorage.setItem('token', 'token_Candidate');
    localStorage.setItem('username', 'Candidate');
  });

  // Verify Landing Page loaded
  await expect(page.locator('h1')).toContainText('AstraPrep AI');

  // 2. Click "Start AI Interview" to navigate to Interview Page
  await page.click('text=Start AI Interview');

  // Verify we are on the Interview Page Setup
  await expect(page).toHaveURL(/\/dashboard\/interview/);
  
  // Use specific heading locator to avoid strict mode violations during transition
  await expect(page.getByRole('heading', { name: 'Configure Your Interview' })).toBeVisible();

  // 3. Configure the Interview
  // Select Target Role: Product Manager (to test custom role selection)
  await page.click('button:has-text("Product Manager")');

  // Select Difficulty Level: Easy
  await page.click('button:has-text("Fundamental concepts")');

  // Select Interview Format: Text
  await page.click('button:has-text("Typed answers with AI scoring")');

  // Adjust number of questions to 3
  const slider = page.locator('input[type="range"]');
  await slider.fill('3');

  // Wait a moment for react state updates
  await page.waitForTimeout(500);

  // 4. Start the Interview (generate questions)
  await page.click('button:has-text("Start Interview")');

  // Wait for the interview phase to transition (Wait for "Question 1 of 3" to be visible)
  await expect(page.locator('text=Question 1 of 3')).toBeVisible({ timeout: 15000 });

  // Loop through 3 questions
  for (let i = 1; i <= 3; i++) {
    // Check if the current question text is visible
    await expect(page.locator(`text=Question ${i} of 3`)).toBeVisible();

    // Type the answer
    await page.fill('textarea[placeholder="Type your answer here..."]', `This is my comprehensive answer for mock question number ${i}. I will structure my approach, handle product trade-offs, and outline metrics to track performance.`);

    // Click Submit Answer
    await page.click('button:has-text("Submit Answer")');

    // Wait for the evaluation to finish and display
    await expect(page.locator('text=Evaluation')).toBeVisible({ timeout: 35000 });

    // Click Next or Results
    if (i < 3) {
      // Find and click the Next button
      await page.click('button:has-text("Next")');
    } else {
      // Find and click the Results button
      await page.click('button:has-text("Results")');
    }
  }

  // 5. Verify results page loads
  await expect(page).toHaveURL(/\/dashboard\/results/);
  // Expect to see Candidate name (default is Candidate) on the results header card
  await expect(page.getByRole('heading', { name: 'Candidate' })).toBeVisible({ timeout: 10000 });
});
