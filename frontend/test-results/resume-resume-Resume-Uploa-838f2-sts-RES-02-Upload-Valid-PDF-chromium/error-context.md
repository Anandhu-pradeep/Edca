# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: resume\resume.spec.ts >> Resume Upload Functional Tests >> RES-02: Upload Valid PDF
- Location: tests\resume\resume.spec.ts:54:7

# Error details

```
Error: locator.isVisible: Error: strict mode violation: getByRole('button', { name: /continue|next|skip/i }) resolved to 2 elements:
    1) <button disabled class="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none h-11 rounded-xl px-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50">…</button> aka getByRole('button', { name: 'Continue' })
    2) <button id="next-logo" aria-haspopup="menu" data-next-mark="true" aria-expanded="false" aria-label="Open Next.js Dev Tools" data-nextjs-dev-tools-button="true" aria-controls="nextjs-dev-tools-menu">…</button> aka getByRole('button', { name: 'Open Next.js Dev Tools' })

Call log:
    - checking visibility of getByRole('button', { name: /continue|next|skip/i })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as path from 'path';
  3  | import * as fs from 'fs';
  4  | import * as os from 'os';
  5  | 
  6  | test.describe('Resume Upload Functional Tests', () => {
  7  |   const validEmail = process.env.TEST_USER_EMAIL!;
  8  |   const validPassword = process.env.TEST_USER_PASSWORD!;
  9  |   let dummyPdfPath: string;
  10 |   let invalidTxtPath: string;
  11 | 
  12 |   test.beforeAll(() => {
  13 |     // Create dummy files for testing
  14 |     const tmpDir = os.tmpdir();
  15 |     dummyPdfPath = path.join(tmpDir, 'dummy_resume.pdf');
  16 |     invalidTxtPath = path.join(tmpDir, 'invalid_resume.txt');
  17 |     
  18 |     fs.writeFileSync(dummyPdfPath, 'Dummy PDF content for testing');
  19 |     fs.writeFileSync(invalidTxtPath, 'Dummy TXT content for testing');
  20 |   });
  21 | 
  22 |   test.afterAll(() => {
  23 |     // Clean up
  24 |     if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
  25 |     if (fs.existsSync(invalidTxtPath)) fs.unlinkSync(invalidTxtPath);
  26 |   });
  27 | 
  28 |   test.beforeEach(async ({ page }) => {
  29 |     // Perform login
  30 |     await page.goto('/sign');
  31 |     await page.getByPlaceholder('Enter your email').first().fill(validEmail);
  32 |     await page.getByPlaceholder('Enter your password').fill(validPassword);
  33 |     await page.getByRole('button', { name: 'Log In', exact: true }).click();
  34 |     
  35 |     // Check if redirected to dashboard or onboarding
  36 |     await expect(page).not.toHaveURL(/\/sign/);
  37 |     
  38 |     // Navigate to onboarding to access resume section
  39 |     await page.goto('/onboarding');
  40 |     
  41 |     // Wait until the step with 'Select Resume PDF' is accessible. 
  42 |     // If it's a multi-step form, we may need to click through to Step 6.
  43 |     // For a functional test, we'll try to find the drag and drop area or Next buttons.
  44 |     while (!(await page.getByText('Drag & Drop your PDF Resume here').isVisible())) {
  45 |       const nextBtn = page.getByRole('button', { name: /continue|next|skip/i });
> 46 |       if (await nextBtn.isVisible()) {
     |                         ^ Error: locator.isVisible: Error: strict mode violation: getByRole('button', { name: /continue|next|skip/i }) resolved to 2 elements:
  47 |         await nextBtn.click();
  48 |       } else {
  49 |         break; // Or fail if it can't be found
  50 |       }
  51 |     }
  52 |   });
  53 | 
  54 |   test('RES-02: Upload Valid PDF', async ({ page }) => {
  55 |     // Wait for the file chooser
  56 |     const fileChooserPromise = page.waitForEvent('filechooser');
  57 |     await page.getByText('Select Resume PDF').click();
  58 |     
  59 |     const fileChooser = await fileChooserPromise;
  60 |     await fileChooser.setFiles(dummyPdfPath);
  61 |     
  62 |     // Verify file is accepted and name appears
  63 |     await expect(page.getByText('dummy_resume.pdf')).toBeVisible({ timeout: 10000 });
  64 |   });
  65 | 
  66 |   test('RES-03: Upload Invalid File', async ({ page }) => {
  67 |     const fileChooserPromise = page.waitForEvent('filechooser');
  68 |     await page.getByText('Select Resume PDF').click();
  69 |     
  70 |     const fileChooser = await fileChooserPromise;
  71 |     await fileChooser.setFiles(invalidTxtPath);
  72 |     
  73 |     // Verify file is rejected or error message shown
  74 |     // Application shows toast or text like "Resume file must be less than 5MB." (from code, probably fails type validation earlier)
  75 |     // We expect some error or the file not to be uploaded
  76 |     // Just verify the invalid file name doesn't show up in the success state
  77 |     // Note: Depends on actual implementation of type checking
  78 |   });
  79 | 
  80 |   test('RES-04: Remove/Replace Resume', async ({ page }) => {
  81 |     // Upload first
  82 |     const fileChooserPromise = page.waitForEvent('filechooser');
  83 |     await page.getByText('Select Resume PDF').click();
  84 |     const fileChooser = await fileChooserPromise;
  85 |     await fileChooser.setFiles(dummyPdfPath);
  86 |     
  87 |     // Verify it's uploaded
  88 |     await expect(page.getByText('dummy_resume.pdf')).toBeVisible();
  89 |     
  90 |     // Remove it - checking the actual implementation, it has a reset or delete button (setScanComplete(false); setResumeFile(null);)
  91 |     // The button might have an icon or text like "Change" or "Remove"
  92 |     const removeBtn = page.getByRole('button', { name: /remove|delete|reset|trash|x/i }).last();
  93 |     if (await removeBtn.isVisible()) {
  94 |       await removeBtn.click();
  95 |       await expect(page.getByText('dummy_resume.pdf')).toBeHidden();
  96 |     }
  97 |   });
  98 | });
  99 | 
```