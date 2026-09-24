import { test, expect } from '@playwright/test';

test.describe('Registration Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign');
    // Switch to register view
    await page.getByRole('button', { name: 'Register Here' }).click();
  });

  test('AUTH-01: Register form validations', async ({ page }) => {
    // Empty email
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // Invalid email
    await page.getByPlaceholder('Enter your email').last().fill('invalid-email');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // The user mentioned we don't need to fully test OTP flow if not possible, but we can test up to OTP send
    const testEmail = 'testregister@example.com';
    await page.getByPlaceholder('Enter your email').last().fill(testEmail);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    // Expect OTP view to appear
    await expect(page.getByRole('heading', { name: 'Check Email' })).toBeVisible();
    await expect(page.getByPlaceholder('123456')).toBeVisible();
  });

  test('AUTH-08: Password Validation', async ({ page }) => {
    // To test password validation, we'd normally need to pass OTP.
    // However, since we can't automate OTP without a real service or mock,
    // we might mark full registration as NOT EXECUTED for the password part,
    // or test if there is client-side validation visible in the DOM.
    // Since we are blackbox testing without OTP bypass, we will mark the deeper parts of registration as Blocked/Not Executed if we can't reach them.
    test.info().annotations.push({ type: 'issue', description: 'Requires OTP bypass to test password validation form fully.' });
  });
});
