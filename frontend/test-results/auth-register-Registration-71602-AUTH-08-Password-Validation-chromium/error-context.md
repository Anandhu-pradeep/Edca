# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\register.spec.ts >> Registration Functional Tests >> AUTH-08: Password Validation
- Location: tests\auth\register.spec.ts:30:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Register Here' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Back to Home" [ref=e6] [cursor=pointer]:
      - /url: /
    - generic [ref=e9]:
      - generic [ref=e11]:
        - heading "Log In" [level=3] [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e14]:
            - text: Email
            - textbox "Enter your email" [ref=e16]
          - generic [ref=e20]:
            - generic [ref=e21]:
              - generic [ref=e22]: Password
              - link "Forgot?" [ref=e23] [cursor=pointer]:
                - /url: /sign/forgot
            - generic [ref=e24]:
              - textbox "Enter your password" [ref=e25]
              - button [ref=e26]
          - button "Log In" [ref=e30]
        - generic [ref=e31]:
          - generic [ref=e32]: Or log in with
          - link "Google" [ref=e38] [cursor=pointer]:
            - /url: http://localhost:8080/oauth2/authorization/google
      - generic [ref=e45]:
        - heading "Welcome!" [level=2] [ref=e46]
        - paragraph [ref=e47]: Log in to access your dashboard, connect with recruiters, and practice AI interviews.
        - generic [ref=e48]:
          - paragraph [ref=e49]: Don't have an account?
          - button "Register" [ref=e50]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e56] [cursor=pointer]
  - alert [ref=e60]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Registration Functional Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/sign');
  6  |     // Switch to register view
> 7  |     await page.getByRole('button', { name: 'Register Here' }).click();
     |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   });
  9  | 
  10 |   test('AUTH-01: Register form validations', async ({ page }) => {
  11 |     // Empty email
  12 |     await page.getByRole('button', { name: 'Continue', exact: true }).click();
  13 |     await expect(page.getByText('Invalid email address')).toBeVisible();
  14 | 
  15 |     // Invalid email
  16 |     await page.getByPlaceholder('Enter your email').last().fill('invalid-email');
  17 |     await page.getByRole('button', { name: 'Continue', exact: true }).click();
  18 |     await expect(page.getByText('Invalid email address')).toBeVisible();
  19 | 
  20 |     // The user mentioned we don't need to fully test OTP flow if not possible, but we can test up to OTP send
  21 |     const testEmail = 'testregister@example.com';
  22 |     await page.getByPlaceholder('Enter your email').last().fill(testEmail);
  23 |     await page.getByRole('button', { name: 'Continue', exact: true }).click();
  24 | 
  25 |     // Expect OTP view to appear
  26 |     await expect(page.getByRole('heading', { name: 'Check Email' })).toBeVisible();
  27 |     await expect(page.getByPlaceholder('123456')).toBeVisible();
  28 |   });
  29 | 
  30 |   test('AUTH-08: Password Validation', async ({ page }) => {
  31 |     // To test password validation, we'd normally need to pass OTP.
  32 |     // However, since we can't automate OTP without a real service or mock,
  33 |     // we might mark full registration as NOT EXECUTED for the password part,
  34 |     // or test if there is client-side validation visible in the DOM.
  35 |     // Since we are blackbox testing without OTP bypass, we will mark the deeper parts of registration as Blocked/Not Executed if we can't reach them.
  36 |     test.info().annotations.push({ type: 'issue', description: 'Requires OTP bypass to test password validation form fully.' });
  37 |   });
  38 | });
  39 | 
```