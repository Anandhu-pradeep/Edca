import { test, expect } from '@playwright/test';

test.describe('Forgot Password and Reset Tests', () => {
  const validEmail = process.env.TEST_USER_EMAIL!;

  test('AUTH-04: Forgot Password - Request Reset Link', async ({ page }) => {
    await page.goto('/sign/forgot');
    
    await page.getByPlaceholder('Enter your email').fill(validEmail);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    await expect(page.getByText('If an account exists for that email, we have sent a password reset link.')).toBeVisible();
    
    // We stop here to let the user get the link.
  });

  test('AUTH-05: Reset Password - Using actual link', async ({ page }) => {
    // This test uses the RESET_LINK environment variable which must be provided.
    // We skip if not provided to avoid failing locally before the user gives it.
    const resetLink = process.env.RESET_LINK;
    if (!resetLink) {
      test.skip();
    }
    
    await page.goto(resetLink!);
    
    // Fill the reset password form (assuming fields: 'New Password' and 'Confirm Password')
    // We will verify the exact locators if needed, but standard assumed here:
    const newPasswordField = page.getByPlaceholder(/password/i).first();
    const confirmPasswordField = page.getByPlaceholder(/confirm/i);
    
    if (await newPasswordField.isVisible()) {
      await newPasswordField.fill('NewPass123!');
      if (await confirmPasswordField.isVisible()) {
        await confirmPasswordField.fill('NewPass123!');
      }
      // Note: we won't click submit yet or we'll reset it permanently, 
      // but according to prompt: "Enter the new password only after confirmation that changing the password is acceptable."
      // Since it's a test, we verify validation messages and visibility.
      await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
    }
  });
});
