import {
  chromium,
  type Browser,
  type BrowserContextOptions,
  type LaunchOptions,
} from '@playwright/test';
import type { CreateBrowserArgs } from './args.ts';

export async function createBrowser({
  launchOptions = {},
  browserContextOptions = {},
}: CreateBrowserArgs = {}) {
  const defaultLaunchOptions: LaunchOptions = {
    headless: false,
    args: ['--start-maximized'],
    ...launchOptions,
  };

  const defaultBrowserContextOptions: BrowserContextOptions = {
    viewport: null,
    ...browserContextOptions,
  };

  const browser = await chromium.launch(defaultLaunchOptions);
  const context = await browser.newContext(defaultBrowserContextOptions);
  const page = await context.newPage();

  return { browser, context, page };
}

export async function closeBrowser(browser: Browser) {
  const contexts = browser.contexts();

  for (const context of contexts) {
    const pages = context.pages();

    for (const page of pages) {
      await page.close();
    }

    await context.close();
  }

  await browser.close();
}
