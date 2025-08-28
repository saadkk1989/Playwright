import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  reporter: [
    ['html', { 
      outputFolder: 'my-reports',
      open: 'never' // Optional: prevent auto-opening browser
    }]
  ],
  use: {
    // Force system Chrome instead of bundled Chromium
    channel: 'chrome',
    // Essential stability args
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions'
      ],
      headless: false
    },
    // Screenshot configuration
    screenshot: 'only-on-failure',
    // Optional: add video recording on failure
    video: 'retain-on-failure',
    // Optional: add trace collection
    trace: 'retain-on-failure'
  }
});