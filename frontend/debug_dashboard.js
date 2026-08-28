const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to login...');
  await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle2' });

  // Try to login as HR
  await page.type('input[name="username"]', 'rh_user');
  await page.type('input[name="password"]', 'rh_user123');
  await page.click('button[type="submit"]');

  console.log('Clicked login, waiting for navigation...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Navigation wait timeout', e.message));

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved.');

  await browser.close();
})();
