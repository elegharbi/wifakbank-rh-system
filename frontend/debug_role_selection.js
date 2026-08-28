const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to role-selection...');
  await page.goto('http://localhost:4200/role-selection', { waitUntil: 'networkidle2' });

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'role-selection-screenshot.png' });
  console.log('Screenshot saved.');

  await browser.close();
})();
