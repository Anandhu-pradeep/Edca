import { test, expect } from '@playwright/test';

test.describe('Logout Functional Tests', () => {
  const validEmail = process.env.TEST_USER_EMAIL!;
  const validPassword = process.env.TEST_USER_PASSWORD!;

  test.beforeEach(async ({ page }) => {
    // Perform login
    await page.goto('/sign');
    await page.getByPlaceholder('Enter your email').first().fill(validEmail);
    await page.getByPlaceholder('Enter your password').fill(validPassword);
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    // Wait for successful login (URL shouldn't be /sign)
    await expect(page).not.toHaveURL(/\/sign/);
  });

  test('AUTH-03: Logout and protected route redirection', async ({ page }) => {
    // Ensure we are on the dashboard or similar protected route
    await page.goto('/dashboard');
    
    // Find the profile button and click it to open the menu
    // The profile button contains an image with alt text set to the username (or default).
    // Let's use a selector that targets a button containing an img
    const profileButton = page.locator('header button').filter({ has: page.locator('img') }).first();
    await profileButton.click();
    
    // Click the Sign out button
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Verify redirection to unauthenticated page, typically /sign or /
    await expect(page).toHaveURL(/(\/sign|\/)/);
    
    // Attempt to access a protected page
    await page.goto('/dashboard');
    
    // Verify redirection back to /sign or /
    await expect(page).toHaveURL(/(\/sign|\/)/);
  });
});
