const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to register...');
  await page.goto('http://localhost:4200/register', { waitUntil: 'networkidle2' });

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'register-screenshot.png' });
  console.log('Screenshot saved.');

  await browser.close();
})();
