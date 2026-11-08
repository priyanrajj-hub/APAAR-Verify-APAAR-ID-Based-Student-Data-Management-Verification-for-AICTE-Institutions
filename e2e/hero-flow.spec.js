const { test, expect } = require('@playwright/test');

test.describe('APAAR-Verify SIH Hero Flow Browser E2E Tests', () => {

  test('1. Landing page loads with honest branding and 4 primary tabs', async ({ page }) => {
    await page.goto('/');

    // Check prototype disclaimer
    const banner = page.locator('text=Prototype: not affiliated with MoE/AICTE. All data synthetic.');
    await expect(banner).toBeVisible();

    // Verify 4 operational tabs
    await expect(page.locator('button:has-text("Upload & Verify")')).toBeVisible();
    await expect(page.locator('button:has-text("Review Queue")')).toBeVisible();
    await expect(page.locator('button:has-text("Audit Log")')).toBeVisible();
    await expect(page.locator('button:has-text("AICTE Oversight")')).toBeVisible();

    // Verify stat cards and old 11 tabs are NOT present
    await expect(page.locator('text=THE PROBLEM IN NUMBERS')).toHaveCount(0);
    await expect(page.locator('text=Architecture')).toHaveCount(0);
  });

  test('2. One-click messy sample roster ingestion populates Review Queue with plain-language fixes', async ({ page }) => {
    await page.goto('/');

    // Click "Verify Scenario A Roster" on Sample 1 (Messy Dates & Checksums)
    const sample1Btn = page.locator('button:has-text("Verify Scenario A Roster")').first();
    await expect(sample1Btn).toBeVisible();
    await sample1Btn.click();

    // The app auto-navigates directly to the Review Queue upon verification completion
    const table = page.locator('table[aria-label="Student verification review records"]');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Check that checksum errors and suggested fixes are displayed in the queue
    await expect(page.locator('text=Correct check digit').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Audit Log tab verifies append-only SHA-256 chain and detects tamper attacks', async ({ page }) => {
    await page.goto('/');

    // Switch to Audit Log tab
    await page.locator('button:has-text("Audit Log")').click();

    // Check ledger head and verify chain button
    const verifyChainBtn = page.locator('button:has-text("Verify Chain Integrity")');
    await expect(verifyChainBtn).toBeVisible();
    await verifyChainBtn.click();
    await expect(page.locator('text=All Block Hashes Verified (Chain Intact)')).toBeVisible();

    // Simulate tamper attack
    const tamperBtn = page.locator('button:has-text("Simulate Tamper Attack")');
    await expect(tamperBtn).toBeVisible();
    await tamperBtn.click();

    // Verify tamper breach alert appears
    await expect(page.locator('text=Cryptographic Integrity Breach Detected')).toBeVisible();
  });

  test('4. Language switcher toggles Urdu and applies dir="rtl"', async ({ page }) => {
    await page.goto('/');

    // Click language switcher
    const langBtn = page.locator('button[aria-label="Select Language"]');
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // Click Urdu option
    const urduOption = page.locator('button:has-text("اردو")');
    await expect(urduOption).toBeVisible();
    await urduOption.click();

    // Verify HTML dir is set to 'rtl'
    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
  });

  test('5. Student verification dossier modal inspects 5-stage audit breakdown', async ({ page }) => {
    await page.goto('/');

    // Switch to Review Queue
    await page.locator('button:has-text("Review Queue")').click();

    // Click "Inspect" button on the first student record
    const inspectBtn = page.locator('button:has-text("Inspect")').first();
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    // Verify modal appears with 5-stage audit breakdown
    await expect(page.locator('text=Automated 5-Stage Verification Audit Breakdown')).toBeVisible();
    await expect(page.locator('text=Stage 1: Ingestion & Unicode Hygiene')).toBeVisible();
    await expect(page.locator('text=Stage 3: 12-Digit Luhn Checksum Algorithm')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Close Dossier")').click();
    await expect(page.locator('text=Automated 5-Stage Verification Audit Breakdown')).toHaveCount(0);
  });

});
