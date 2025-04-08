/* eslint-disable no-undef */

import type { Page } from '@playwright/test';
import ora from 'ora';

import type { NormalizeColorArgs } from '../libs/args.ts';
import { JOTUN_FILE_PATH } from '../libs/constants.ts';
import { writeFileAsync } from '../libs/file.ts';
import { closeBrowser, createBrowser } from '../libs/playwright.ts';
import type { Color } from '../libs/types.ts';
import {
  getUniqueColors,
  isFirstIteration,
  normalizeColor,
  rgbStyleToRgb,
  rgbToHexCode,
} from '../libs/utils.ts';

const URLS = [
  'https://www.jotun.com/id-id/decorative/interior/colours/find-your-colour',
  'https://www.jotun.com/id-id/decorative/exterior/colours/find-your-exterior-colour',
];

async function isAllColorsReady(page: Page) {
  const colorsDisplayLabel = await page
    .locator('p.tw-font-sans.tw-text-sm.tw-text-left.tw-text-grey-70')
    .textContent();

  if (!colorsDisplayLabel) {
    return false;
  }

  const matches = colorsDisplayLabel.match(/\d+/g);

  if (!matches) {
    return false;
  }

  const [current, total] = matches;

  return current === total;
}

async function fetchColors(page: Page) {
  do {
    const loadButton = page.getByRole('button', { name: 'Muat lebih banyak' });

    await loadButton.waitFor({ state: 'attached' });
    await loadButton.click();

    const loadStatus = page.getByRole('status');

    if (await loadStatus.isVisible()) {
      await loadStatus.waitFor({ state: 'hidden' });
    }
  } while (!(await isAllColorsReady(page)));
}

export default async function scrapJotunColors() {
  const spinner = ora('Scraping Jotun colors...').start();

  const { browser, page } = await createBrowser();

  const colors: Color[] = [];

  for (const [index, url] of URLS.entries()) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (isFirstIteration(index)) {
      await page.getByRole('region').getByRole('button', { name: 'Reject All' }).click();
    }

    await fetchColors(page);

    const colorsInPage: Color[] = [];
    const path = url.split('/')[5];
    const palettes = await page
      .locator(
        `a[href^="/id-id/decorative/${path}/colours"][class="tw-relative tw-flex tw-h-full tw-flex-col"]`,
      )
      .all();

    for (const palette of palettes) {
      const banner = palette.locator('div.tw-absolute.tw-h-full.tw-w-full.tw-bg-center').first();
      const rgbStyle = await banner.evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('background-color'),
      );

      const color: NormalizeColorArgs = {
        name: (await palette
          .locator('span.tw-font-sans.tw-text-xl.tw-font-light.tw-capitalize')
          .textContent()) as string,
        code: (await palette
          .locator('label.tw-font-sans.tw-text-xs.tw-block.tw-text-grey-70')
          .textContent()) as string,
        hexCode: rgbToHexCode(rgbStyleToRgb(rgbStyle)),
      };

      colorsInPage.push(normalizeColor(color));
    }

    colors.push(...colorsInPage);
  }

  await writeFileAsync(JOTUN_FILE_PATH, getUniqueColors(colors));

  await closeBrowser(browser);

  spinner.succeed('Scrap Jotun colors completed successfully.');
}
