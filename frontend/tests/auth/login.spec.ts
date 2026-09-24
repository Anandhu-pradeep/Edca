import { test, expect } from '@playwright/test';

test.describe('Login Functional Tests', () => {
  const validEmail = process.env.TEST_USER_EMAIL!;
  const validPassword = process.env.TEST_USER_PASSWORD!;

  test.beforeEach(async ({ page }) => {
    await page.goto('/sign');
  });

  test('AUTH-02: Valid Login', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').first().fill(validEmail);
    await page.getByPlaceholder('Enter your password').fill(validPassword);
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    // Check if redirected to dashboard or onboarding
    await expect(page).toHaveURL(/(\/dashboard|\/onboarding|\/)/);
    // User menu or some authenticated UI element should be visible
    await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeHidden({ timeout: 10000 });
  });

  test('AUTH-06: Invalid Login - Wrong password', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').first().fill(validEmail);
    await page.getByPlaceholder('Enter your password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('AUTH-06: Invalid Login - Wrong email and password', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').first().fill('invaliduser@example.com');
    await page.getByPlaceholder('Enter your password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('AUTH-07: Empty Fields - Empty password', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').first().fill(validEmail);
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('AUTH-07: Empty Fields - Empty email', async ({ page }) => {
    await page.getByPlaceholder('Enter your password').fill(validPassword);
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('AUTH-07: Empty Fields - Both empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});
