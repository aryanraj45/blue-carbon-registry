const { chromium } = require('playwright');
const path = require('path');

async function main() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('--- Please log in to your application manually in the browser window that just opened. ---');
    await page.goto('https://earth-credits-hub-32-cn42.vercel.app/login');

    console.log('Waiting for you to log in and be redirected to the dashboard...');
    await page.waitForURL('**/verifier-dashboard', { timeout: 120000 }); // Waits for 2 minutes

    // Save the entire session state (cookies, local storage, etc.)
    await context.storageState({ path: 'auth.json' });

    console.log('✅ Success! Authentication state saved to auth.json.');
    await browser.close();
}

main();