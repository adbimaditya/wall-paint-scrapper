/* eslint-disable no-undef */

import { Page } from '@playwright/test';
import ora from 'ora';

import type { NormalizeColorArgs } from '../libs/args.ts';
import { AVIAN_BRANDS_FILE_PATH } from '../libs/constants.ts';
import { writeFileAsync } from '../libs/file.ts';
import { closeBrowser, createBrowser } from '../libs/playwright.ts';
import type { Color } from '../libs/types.ts';
import { getUniqueColors, normalizeColor, rgbStyleToRgb, rgbToHexCode } from '../libs/utils.ts';

const URL = 'https://avianbrands.com/color';

async function scrapColors(page: Page) {
  const colors: Color[] = [];
  const slugs: string[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'neutral'];

  for (const slug of slugs) {
    await page.goto(`${URL}/${slug}`, { waitUntil: 'networkidle' });

    const colorsInPage: Color[] = [];
    const palettes = await page.locator('a[href^="/color"]').all();

    for (const palette of palettes) {
      const label = palette.locator('div div');
      const rgbStyle = await palette.evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('background-color'),
      );

      const color: NormalizeColorArgs = {
        name: (await label.nth(0).textContent()) as string,
        code: (await label.nth(1).textContent()) as string,
        hexCode: rgbToHexCode(rgbStyleToRgb(rgbStyle)),
      };

      colorsInPage.push(normalizeColor(color));
    }

    colors.push(...colorsInPage);
  }

  return colors;
}

export default async function scrapAvianBrandsColors() {
  const spinner = ora('Scraping Avian Brands colors...').start();

  const { browser, page } = await createBrowser();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.getByText('OK', { exact: true }).click();

  const colors = await scrapColors(page);

  await writeFileAsync(AVIAN_BRANDS_FILE_PATH, getUniqueColors(colors));
  await closeBrowser(browser);

  spinner.succeed('Scrap Avian Brands colors completed successfully.');
}
