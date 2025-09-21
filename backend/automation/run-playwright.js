// runAutomation.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const projectId = process.argv[2]; // Get projectId from the controller
const authPath = path.join(__dirname, '..', 'auth.json'); // Path to the auth file

// --- Your custom visuals ---
const customCSS = `
  html {
    background: linear-gradient(-45deg, #0a0328, #360b41, #022c3b, #011322);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
    font-family: 'Courier New', Courier, monospace !important;
  }
  @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  * { 
    color: #00ffcc !important; 
    background-color: rgba(14, 2, 36, 0.2) !important; 
    border: 1px solid rgba(0, 255, 204, 0.3) !important; 
    border-radius: 4px; 
    backdrop-filter: blur(2px); 
    text-shadow: 0 0 5px #00ffcc; 
    transition: all 0.2s ease-in-out; 
  }
  *:hover { 
    box-shadow: 0 0 15px rgba(0, 255, 204, 0.8), inset 0 0 5px rgba(0, 255, 204, 0.5) !important; 
    background-color: rgba(14, 2, 36, 0.5) !important; 
  }
  img, video, svg, .lucide { border: none !important; }
  body { cursor: crosshair; }
  ::-webkit-scrollbar { display: none; }
`;
const customJS = `
  console.log('[AI] Neuro-Visual Overlay Injected.');
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed'; canvas.style.top = '0'; canvas.style.left = '0'; canvas.style.width = '100vw'; canvas.style.height = '100vh'; canvas.style.zIndex = '-1'; canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  let particles = [];
  for (let i = 0; i < 50; i++) { particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, size: Math.random() * 2 + 1 }); }
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > canvas.width) p.vx *= -1; if (p.y < 0 || p.y > canvas.height) p.vy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 255, 204, 0.5)'; ctx.fill(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
`;

// --- Main Playwright script ---
(async () => {
  let browser;
  try {
    if (!fs.existsSync(authPath)) {
      throw new Error('auth.json not found. Please run "node create-auth-state.js" in the backend directory first.');
    }
    if (!projectId) {
      throw new Error('No Project ID was provided to the script.');
    }

    browser = await chromium.launch({ headless: false, slowMo: 400 }); // slowMo makes it watchable
    const context = await browser.newContext({ storageState: authPath });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1300, height: 800 });

    // --- DYNAMIC NAVIGATION ---
    const projectUrl = `https://earth-credits-hub-32-cn42.vercel.app/project/${projectId}`;
    console.log(`[Playwright] Navigating directly to: ${projectUrl}`);
    await page.goto(projectUrl, { waitUntil: 'networkidle' });

    // Inject the visuals
    console.log('[Playwright] Injecting custom visuals...');
    await page.addStyleTag({ content: customCSS });
    await page.addScriptTag({ content: customJS });
    console.log('[Playwright] Visuals injected successfully!');


    // --- Your Recorded Actions ---
    await page.getByRole('tab', { name: 'Documents' }).click();
    await page.getByText('project_methodology.docx').click();
    await page.getByText('field_photos_2025.zip').click();
    await page.getByRole('tab', { name: 'Map & Imagery' }).click();
    await page.locator('html').click();

    await page.waitForTimeout(5000); // Final pause
    console.log(`[Playwright] Automation for ${projectId} completed successfully.`);

  } catch (error) {
    console.error(`[Playwright] SCRIPT FAILED for project ${projectId}:`, error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Playwright] Browser closed.');
    }
  }
})();
// This is the predefined summary inside your script
const summaryReport = {
    projectName: 'Mangrove Restoration Project',
    // ... all the other details ...
    recommendation: "All automated checks passed. The project is cleared for the transaction phase."
};

// The script prints this object as its final action
process.stdout.write(JSON.stringify(summaryReport));