import { Page } from '@playwright/test';
import ora from 'ora';

import type { NormalizeColorArgs } from '../libs/args.ts';
import { DULUX_FILE_PATH } from '../libs/constants.ts';
import { writeFileAsync } from '../libs/file.ts';
import { closeBrowser, createBrowser } from '../libs/playwright.ts';
import type { Color } from '../libs/types.ts';
import { getUniqueColors, normalizeColor } from '../libs/utils.ts';

const URL = 'https://www.dulux.co.id/id/palet-warna';

async function scrapColors(page: Page) {
  const colors: Color[] = [];
  const links = await page.locator('.a20-color-box').all();

  for (const link of links.slice(1)) {
    const colorsInPage: Color[] = [];
    const palettes = await page.locator('.item.related-item-color').all();

    for (const palette of palettes) {
      const colorPalette = palette.locator('.m7-color-card');
      const color: NormalizeColorArgs = {
        name: (await colorPalette.getAttribute('data-label')) as string,
        hexCode: (await colorPalette.getAttribute('data-hex')) as string,
      };

      colorsInPage.push(normalizeColor(color));
    }

    colors.push(...colorsInPage);

    await link.click();

    const id = (await link.getAttribute('data-id')) as string;
    const url = `**/h_${encodeURIComponent(id.charAt(0).toUpperCase() + id.slice(1))}`;

    await page.waitForURL(url);
  }

  return colors;
}

export default async function scrapDuluxColors() {
  const spinner = ora('Scraping Dulux colors...').start();

  const { browser, page } = await createBrowser();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.getByRole('dialog').getByRole('button', { name: 'Reject All' }).click();

  const colors = await scrapColors(page);

  await writeFileAsync(DULUX_FILE_PATH, getUniqueColors(colors));
  await closeBrowser(browser);

  spinner.succeed('Scrap Dulux colors completed successfully.');
}
