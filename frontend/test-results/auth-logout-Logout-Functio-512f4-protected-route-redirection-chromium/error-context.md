# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\logout.spec.ts >> Logout Functional Tests >> AUTH-03: Logout and protected route redirection
- Location: tests\auth\logout.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('header button').filter({ has: locator('img') }).first()
    - locator resolved to <button class="w-8 h-8 rounded-[10px] liquid-glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer overflow-hidden shadow-sm ml-1">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - element is not visible
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - main [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e5]:
        - generic [ref=f1e6]: "01"
        - generic [ref=f1e7]:
          - heading "Identity & Validation" [level=2] [ref=f1e8]
          - paragraph [ref=f1e9]: Customize your profile appearance and reserve your EDCA username.
      - generic [ref=f1e10]:
        - generic [ref=f1e11]:
          - generic [ref=f1e12] [cursor=pointer]: AP
          - generic [ref=f1e19]: Profile Picture
          - generic [ref=f1e20]: Click circle or camera icon to change
        - generic [ref=f1e22]:
          - generic [ref=f1e23]:
            - generic [ref=f1e24]: EDCA Username *
            - generic [ref=f1e25]: Lowercase alphanumeric & underscores
          - generic [ref=f1e26]:
            - generic: "@"
            - textbox "anandhu_dev" [ref=f1e27]
    - generic [ref=f1e31]:
      - generic "Click to expand validation details" [ref=f1e32] [cursor=pointer]
      - button "Continue" [disabled]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=f1e40] [cursor=pointer]
  - alert [ref=f1e44]
  - generic [aria-hidden] [ref=f1e45]: "0"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Logout Functional Tests', () => {
  4  |   const validEmail = process.env.TEST_USER_EMAIL!;
  5  |   const validPassword = process.env.TEST_USER_PASSWORD!;
  6  | 
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // Perform login
  9  |     await page.goto('/sign');
  10 |     await page.getByPlaceholder('Enter your email').first().fill(validEmail);
  11 |     await page.getByPlaceholder('Enter your password').fill(validPassword);
  12 |     await page.getByRole('button', { name: 'Log In', exact: true }).click();
  13 |     
  14 |     // Wait for successful login (URL shouldn't be /sign)
  15 |     await expect(page).not.toHaveURL(/\/sign/);
  16 |   });
  17 | 
  18 |   test('AUTH-03: Logout and protected route redirection', async ({ page }) => {
  19 |     // Ensure we are on the dashboard or similar protected route
  20 |     await page.goto('/dashboard');
  21 |     
  22 |     // Find the profile button and click it to open the menu
  23 |     // The profile button contains an image with alt text set to the username (or default).
  24 |     // Let's use a selector that targets a button containing an img
  25 |     const profileButton = page.locator('header button').filter({ has: page.locator('img') }).first();
> 26 |     await profileButton.click();
     |                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  27 |     
  28 |     // Click the Sign out button
  29 |     await page.getByRole('button', { name: 'Sign out' }).click();
  30 |     
  31 |     // Verify redirection to unauthenticated page, typically /sign or /
  32 |     await expect(page).toHaveURL(/(\/sign|\/)/);
  33 |     
  34 |     // Attempt to access a protected page
  35 |     await page.goto('/dashboard');
  36 |     
  37 |     // Verify redirection back to /sign or /
  38 |     await expect(page).toHaveURL(/(\/sign|\/)/);
  39 |   });
  40 | });
  41 | 
```