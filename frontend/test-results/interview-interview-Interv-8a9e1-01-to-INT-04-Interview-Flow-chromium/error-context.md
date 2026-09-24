# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interview\interview.spec.ts >> Interview Functional Tests >> INT-01 to INT-04: Interview Flow
- Location: tests\interview\interview.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Interviews' })
    - locator resolved to <button title="Interviews" class="w-full flex items-center py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap group px-0 justify-center text-muted-foreground hover:bg-secondary/60 hover:text-foreground">…</button>
  - attempting click action
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
  3  | test.describe('Interview Functional Tests', () => {
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
  14 |     // Wait for successful login
  15 |     await expect(page).not.toHaveURL(/\/sign/);
  16 |   });
  17 | 
  18 |   test('INT-01 to INT-04: Interview Flow', async ({ page }) => {
  19 |     // 1. Navigate to dashboard or interviews tab
  20 |     await page.goto('/dashboard');
  21 |     
  22 |     // Switch to Interviews tab if necessary
  23 |     const interviewsTab = page.getByRole('button', { name: 'Interviews' });
  24 |     if (await interviewsTab.isVisible()) {
> 25 |       await interviewsTab.click();
     |                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  26 |     }
  27 |     
  28 |     // 2. Start Interview (INT-01)
  29 |     // The exact button text could vary (Start Interview, Practice Now, Join Room, etc.)
  30 |     const startBtn = page.getByRole('button', { name: /start|join|practice/i }).first();
  31 |     if (await startBtn.isVisible()) {
  32 |       await startBtn.click();
  33 |       
  34 |       // Wait for navigation to interview room
  35 |       await expect(page).toHaveURL(/\/interview\//);
  36 |       
  37 |       // INT-02 & INT-03: Camera and Microphone Permission
  38 |       // Since we use fake-media-stream in playwright config, they should be automatically granted.
  39 |       // We check if the interview UI/video element is visible.
  40 |       const videoElement = page.locator('video').first();
  41 |       if (await videoElement.isVisible()) {
  42 |         await expect(videoElement).toBeVisible();
  43 |       }
  44 |       
  45 |       // INT-04: End Interview
  46 |       const endBtn = page.getByRole('button', { name: /end|leave|finish/i }).first();
  47 |       if (await endBtn.isVisible()) {
  48 |         await endBtn.click();
  49 |         
  50 |         // Wait for redirect to dashboard or results page
  51 |         await expect(page).not.toHaveURL(/\/interview\//);
  52 |       }
  53 |     } else {
  54 |       test.info().annotations.push({ type: 'issue', description: 'Could not find a Start Interview button on the dashboard.' });
  55 |     }
  56 |   });
  57 | });
  58 | 
```