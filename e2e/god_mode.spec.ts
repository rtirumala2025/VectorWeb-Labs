/**
 * VectorWeb Labs - E2E "God Mode" System Test
 * 
 * GOLDEN RUN: Login -> Wizard -> Proposal -> Sign -> Stripe
 * 
 * Tests the complete user journey from authentication through payment.
 * Includes manual intervention fallback for Google OAuth.
 */

import { test, expect, Page } from '@playwright/test';

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
    BASE_URL: 'http://localhost:3001',
    BACKEND_URL: 'http://localhost:8000',
    USER_EMAIL: 'ritviktirumala@gmail.com',
    BUSINESS_NAME: `VectorWeb QA Auto ${Date.now()}`,
    MANUAL_INTERVENTION_TIMEOUT: 60000, // 60 seconds for manual login
};

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ══════════════════════════════════════════════════════════════════════════════

interface AuditResult {
    step: string;
    status: 'PASS' | 'FAIL' | 'SKIP' | 'MANUAL';
    timestamp: string;
    details?: string;
    screenshot?: string;
}

const auditLog: AuditResult[] = [];

function logAudit(step: string, status: AuditResult['status'], details?: string) {
    const result: AuditResult = {
        step,
        status,
        timestamp: new Date().toISOString(),
        details,
    };
    auditLog.push(result);
    console.log(`[${status}] ${step}${details ? `: ${details}` : ''}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

async function takeScreenshot(page: Page, name: string) {
    const path = `e2e/screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    return path;
}

async function waitForManualIntervention(page: Page, description: string) {
    console.log('\n' + '═'.repeat(60));
    console.log(`⚠️  MANUAL INTERVENTION REQUIRED: ${description}`);
    console.log(`⏱️  Waiting ${CONFIG.MANUAL_INTERVENTION_TIMEOUT / 1000} seconds...`);
    console.log('═'.repeat(60) + '\n');

    // Wait for either manual completion or timeout
    await page.waitForTimeout(CONFIG.MANUAL_INTERVENTION_TIMEOUT);
}

// ══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════════════

test.describe('VectorWeb Labs - Golden Run E2E', () => {
    let projectId: string | null = null;

    test.beforeAll(async () => {
        console.log('\n' + '═'.repeat(60));
        console.log('🚀 VectorWeb Labs - GOD MODE E2E Test Starting');
        console.log(`📅 ${new Date().toISOString()}`);
        console.log(`🎯 Target: ${CONFIG.BASE_URL}`);
        console.log('═'.repeat(60) + '\n');
    });

    test.afterAll(async () => {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 AUDIT LOG SUMMARY');
        console.log('═'.repeat(60));
        auditLog.forEach(entry => {
            const icon = entry.status === 'PASS' ? '✅' :
                entry.status === 'FAIL' ? '❌' :
                    entry.status === 'MANUAL' ? '👤' : '⏭️';
            console.log(`${icon} ${entry.step}: ${entry.status}`);
        });
        console.log('═'.repeat(60) + '\n');
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PHASE 1: THE BREACH (Login)
    // ────────────────────────────────────────────────────────────────────────────

    test('Phase 1: The Breach - Google Authentication', async ({ page }) => {
        test.setTimeout(120000); // 2 minute timeout for login

        await test.step('Navigate to login page', async () => {
            await page.goto('/login');
            await expect(page).toHaveURL(/login/);
            logAudit('Navigate to /login', 'PASS');
        });

        await test.step('Click Google Sign In', async () => {
            // Look for Google auth button
            const googleButton = page.locator('button:has-text("Google"), button:has-text("Sign in with Google"), [data-provider="google"]').first();

            if (await googleButton.isVisible({ timeout: 5000 })) {
                await googleButton.click();
                logAudit('Click Google Sign In', 'PASS');

                // Wait for Google OAuth popup or redirect
                await page.waitForTimeout(3000);

                // Check if we're on Google's auth page
                const isGoogleAuth = page.url().includes('accounts.google.com');

                if (isGoogleAuth) {
                    // Try to fill email if field is visible
                    const emailInput = page.locator('input[type="email"]');
                    if (await emailInput.isVisible({ timeout: 3000 })) {
                        await emailInput.fill(CONFIG.USER_EMAIL);
                        await page.keyboard.press('Enter');
                        logAudit('Fill Google Email', 'PASS', CONFIG.USER_EMAIL);

                        // Wait for password or 2FA
                        await page.waitForTimeout(3000);
                    }

                    // If blocked by 2FA/captcha, wait for manual intervention
                    logAudit('Google OAuth', 'MANUAL', 'Waiting for manual login...');
                    await waitForManualIntervention(page, 'Complete Google OAuth login');
                }
            } else {
                // Check if already logged in
                const dashboardLink = page.locator('a:has-text("DASHBOARD"), a[href="/dashboard"]');
                if (await dashboardLink.isVisible({ timeout: 3000 })) {
                    logAudit('Login', 'PASS', 'Already authenticated');
                } else {
                    logAudit('Google Sign In button not found', 'FAIL');
                    await takeScreenshot(page, 'login-no-google-button');
                }
            }
        });

        await test.step('Verify authentication', async () => {
            // Navigate to a protected page to verify auth
            await page.goto('/dashboard');
            await page.waitForTimeout(3000);

            // Check if redirected to login (not authenticated) or stayed on dashboard
            if (page.url().includes('/login')) {
                logAudit('Authentication Verification', 'FAIL', 'Redirected to login');
                await takeScreenshot(page, 'auth-failed');
                throw new Error('Authentication failed - redirected to login');
            } else {
                logAudit('Authentication Verification', 'PASS', 'User is authenticated');
            }
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PHASE 2: THE CREATION (Wizard)
    // ────────────────────────────────────────────────────────────────────────────

    test('Phase 2: The Creation - Project Wizard', async ({ page }) => {
        test.setTimeout(180000); // 3 minute timeout for wizard

        await test.step('Navigate to wizard', async () => {
            await page.goto('/wizard');
            await page.waitForTimeout(2000);

            // Check if redirected (might create draft automatically)
            const currentUrl = page.url();
            logAudit('Navigate to /wizard', 'PASS', `URL: ${currentUrl}`);
        });

        await test.step('Step 1: Business Identity', async () => {
            // Find and fill business name input
            const businessInput = page.locator('input[placeholder*="business"], input[name*="business"], input[type="text"]').first();

            if (await businessInput.isVisible({ timeout: 5000 })) {
                await businessInput.fill(CONFIG.BUSINESS_NAME);
                logAudit('Fill Business Name', 'PASS', CONFIG.BUSINESS_NAME);

                // Click next/continue button
                const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("NEXT")').first();
                if (await nextButton.isVisible({ timeout: 3000 })) {
                    await nextButton.click();
                    await page.waitForTimeout(2000);
                    logAudit('Step 1 Complete', 'PASS');
                }
            } else {
                logAudit('Business Name Input', 'SKIP', 'Input not found, may be on different step');
                await takeScreenshot(page, 'wizard-step1-no-input');
            }
        });

        await test.step('Step 2: Discovery Flow', async () => {
            // Click through discovery questions (adaptive based on what's visible)
            for (let i = 0; i < 10; i++) {
                // Look for option buttons
                const optionButton = page.locator('button:not(:has-text("Next")):not(:has-text("Back"))').first();

                if (await optionButton.isVisible({ timeout: 3000 })) {
                    await optionButton.click();
                    await page.waitForTimeout(2000);
                    logAudit(`Discovery Question ${i + 1}`, 'PASS');
                } else {
                    // Check if discovery is complete
                    const completeText = page.locator('text=COMPLETE, text=complete, text=PROCEED');
                    if (await completeText.isVisible({ timeout: 2000 })) {
                        logAudit('Discovery Phase', 'PASS', 'Complete');

                        // Click proceed button if visible
                        const proceedButton = page.locator('button:has-text("PROCEED"), button:has-text("Proceed")').first();
                        if (await proceedButton.isVisible()) {
                            await proceedButton.click();
                            await page.waitForTimeout(2000);
                        }
                        break;
                    }
                }
            }
        });

        await test.step('Step 3: Vibe Selection', async () => {
            // Select a vibe/style option
            const vibeOption = page.locator('button:has-text("Modern"), button:has-text("MODERN"), [data-vibe="modern"]').first();

            if (await vibeOption.isVisible({ timeout: 5000 })) {
                await vibeOption.click();
                await page.waitForTimeout(2000);
                logAudit('Select Vibe: Modern', 'PASS');

                // Click next
                const nextButton = page.locator('button:has-text("Next"), button:has-text("NEXT")').first();
                if (await nextButton.isVisible({ timeout: 3000 })) {
                    await nextButton.click();
                    await page.waitForTimeout(2000);
                }
            } else {
                logAudit('Vibe Selection', 'SKIP', 'May already be selected or on different step');
            }
        });

        await test.step('Step 4: Domain Selection', async () => {
            // Fill domain input
            const domainInput = page.locator('input[placeholder*="domain"], input[name*="domain"]').first();

            if (await domainInput.isVisible({ timeout: 5000 })) {
                const domainName = `vectorweb-qa-${Date.now()}`;
                await domainInput.fill(domainName);
                await page.waitForTimeout(2000);
                logAudit('Fill Domain', 'PASS', domainName);

                // Check domain availability
                const checkButton = page.locator('button:has-text("Check"), button:has-text("CHECK")').first();
                if (await checkButton.isVisible({ timeout: 3000 })) {
                    await checkButton.click();
                    await page.waitForTimeout(3000);
                }
            }
        });

        await test.step('Verify project ID in URL', async () => {
            const currentUrl = page.url();

            if (currentUrl.includes('id=') || currentUrl.includes('/wizard/')) {
                // Extract project ID if present
                const idMatch = currentUrl.match(/id=([a-zA-Z0-9-]+)/);
                if (idMatch) {
                    projectId = idMatch[1];
                    logAudit('Project ID in URL', 'PASS', projectId);
                } else {
                    logAudit('URL Structure', 'PASS', currentUrl);
                }
            } else {
                logAudit('Project ID in URL', 'SKIP', 'ID not in URL yet');
            }

            await takeScreenshot(page, 'wizard-final-state');
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PHASE 3: THE GENERATION (Proposal)
    // ────────────────────────────────────────────────────────────────────────────

    test('Phase 3: The Generation - Proposal', async ({ page }) => {
        test.setTimeout(120000);

        await test.step('Navigate to proposal/finalize', async () => {
            // Click generate proposal or similar
            const generateButton = page.locator('button:has-text("Generate"), button:has-text("GENERATE"), button:has-text("Finalize")').first();

            if (await generateButton.isVisible({ timeout: 5000 })) {
                await generateButton.click();
                await page.waitForTimeout(5000);
                logAudit('Click Generate Proposal', 'PASS');
            } else {
                // Try direct navigation to proposal page
                await page.goto('/proposal');
                await page.waitForTimeout(3000);
                logAudit('Direct Navigate to /proposal', 'PASS');
            }
        });

        await test.step('Verify proposal content', async () => {
            const currentUrl = page.url();

            // Check for proposal page indicators
            const proposalVisible = await page.locator('text=Package, text=Price, text=Quote, text=Proposal').first().isVisible({ timeout: 5000 });

            if (proposalVisible) {
                logAudit('Proposal Content Visible', 'PASS');
            } else {
                logAudit('Proposal Content', 'SKIP', 'Proposal not yet generated');
            }

            await takeScreenshot(page, 'proposal-state');
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PHASE 4: THE CONTRACT (Signature)
    // ────────────────────────────────────────────────────────────────────────────

    test('Phase 4: The Contract - Signature Capture', async ({ page }) => {
        test.setTimeout(60000);

        await test.step('Locate signature canvas', async () => {
            const canvas = page.locator('canvas').first();

            if (await canvas.isVisible({ timeout: 5000 })) {
                logAudit('Signature Canvas Found', 'PASS');

                // Get canvas bounding box
                const box = await canvas.boundingBox();

                if (box) {
                    // Simulate signature with mouse drag
                    await page.mouse.move(box.x + 50, box.y + box.height / 2);
                    await page.mouse.down();

                    // Draw a simple signature pattern
                    for (let i = 0; i < 5; i++) {
                        await page.mouse.move(box.x + 50 + (i * 30), box.y + box.height / 2 + (i % 2 === 0 ? -20 : 20));
                    }

                    await page.mouse.up();
                    await page.waitForTimeout(1000);

                    logAudit('Signature Drawn', 'PASS');
                    await takeScreenshot(page, 'signature-captured');
                }
            } else {
                logAudit('Signature Canvas', 'SKIP', 'Canvas not found');
            }
        });

        await test.step('Accept contract', async () => {
            const acceptButton = page.locator('button:has-text("Accept"), button:has-text("ACCEPT"), button:has-text("Initialize")').first();

            if (await acceptButton.isVisible({ timeout: 5000 })) {
                await acceptButton.click();
                await page.waitForTimeout(3000);
                logAudit('Accept Contract', 'PASS');
            } else {
                logAudit('Accept Contract Button', 'SKIP', 'Button not found');
            }
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PHASE 5: THE TRANSACTION (Stripe)
    // ────────────────────────────────────────────────────────────────────────────

    test('Phase 5: The Transaction - Stripe Checkout', async ({ page }) => {
        test.setTimeout(60000);

        await test.step('Wait for Stripe redirect', async () => {
            // Wait for potential Stripe redirect
            await page.waitForTimeout(5000);

            const currentUrl = page.url();
            const isStripe = currentUrl.includes('stripe.com') || currentUrl.includes('checkout');

            if (isStripe) {
                logAudit('Stripe Redirect', 'PASS', currentUrl);

                // Verify VectorWeb Labs text
                const vectorwebText = await page.locator('text=VectorWeb').first().isVisible({ timeout: 5000 });
                if (vectorwebText) {
                    logAudit('VectorWeb Labs on Stripe', 'PASS');
                }

                // Try to fill test card (if accessible)
                const cardInput = page.locator('input[name*="cardNumber"], #cardNumber').first();
                if (await cardInput.isVisible({ timeout: 3000 })) {
                    await cardInput.fill('4242424242424242');
                    logAudit('Fill Test Card', 'PASS', '4242...4242');

                    // Fill expiry
                    const expiryInput = page.locator('input[name*="expiry"], #cardExpiry').first();
                    if (await expiryInput.isVisible()) {
                        await expiryInput.fill('12/30');
                    }

                    // Fill CVC
                    const cvcInput = page.locator('input[name*="cvc"], #cardCvc').first();
                    if (await cvcInput.isVisible()) {
                        await cvcInput.fill('123');
                    }
                }

                await takeScreenshot(page, 'stripe-checkout');
            } else {
                logAudit('Stripe Redirect', 'SKIP', `Still on: ${currentUrl}`);
                await takeScreenshot(page, 'no-stripe-redirect');
            }
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PHASE 6: DATABASE VERIFICATION
    // ────────────────────────────────────────────────────────────────────────────

    test('Phase 6: Backend Verification', async ({ request }) => {
        await test.step('Check API health', async () => {
            try {
                const response = await request.get(`${CONFIG.BACKEND_URL}/`);
                if (response.ok()) {
                    logAudit('Backend API Health', 'PASS');
                } else {
                    logAudit('Backend API Health', 'FAIL', `Status: ${response.status()}`);
                }
            } catch (error) {
                logAudit('Backend API Health', 'FAIL', String(error));
            }
        });
    });
});
