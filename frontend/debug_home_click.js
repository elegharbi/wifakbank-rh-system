const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to home...');
  await page.goto('http://localhost:4200/home', { waitUntil: 'networkidle2' });

  console.log('Clicking Se connecter...');
  await page.click('a[routerLink="/role-selection"]');

  console.log('Waiting for navigation...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.log('Wait timeout', e.message));

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'home-click-screenshot.png' });
  console.log('Screenshot saved.');

  await browser.close();
})();
