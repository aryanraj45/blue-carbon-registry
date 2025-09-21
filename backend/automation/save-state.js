// saveAuthState.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to the login page and log in
  await page.goto('https://earth-credits-hub-32-cn42.vercel.app/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('verifier@example.com');
  // IMPORTANT: Use your actual password here
  await page.getByRole('textbox', { name: 'Password' }).fill('anyy'); 
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for the navigation to the dashboard to confirm login was successful
  await page.waitForURL('**/verifier-dashboard');

  // Save cookies & localStorage to a file called auth.json
  await context.storageState({ path: 'auth.json' });

  console.log('✅ Authentication state saved to auth.json');
  console.log('You can now run the main automation script.');

  await browser.close();    
})();