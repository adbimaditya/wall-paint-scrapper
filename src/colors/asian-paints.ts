/* eslint-disable no-undef */

import type { Page } from '@playwright/test';
import ora from 'ora';

import type { NormalizeColorArgs } from '../libs/args.ts';
import { ASIAN_PAINTS_FILE_PATH } from '../libs/constants.ts';
import { writeFileAsync } from '../libs/file.ts';
import { closeBrowser, createBrowser } from '../libs/playwright.ts';
import type { Color } from '../libs/types.ts';
import {
  getUniqueColors,
  isElementExists,
  normalizeColor,
  rgbStyleToRgb,
  rgbToHexCode,
} from '../libs/utils.ts';

const URL = 'https://www.asianpaints.co.id/ba/home/catalogue/colour-catalogue.html';

async function loadColors(page: Page) {
  const loadButton = page.getByRole('button', { name: 'MUAT LEBIH BANYAK' });

  do {
    await loadButton.click();
  } while (await isElementExists(loadButton));
}

async function scrapColors(page: Page) {
  const colors: Color[] = [];
  const palettes = await page
    .locator('li.color-catalogue-revamp-list--cardList.js-colorCatRevampCardList')
    .all();

  for (const palette of palettes) {
    const banner = palette.locator('.color-catalogue-revamp-list--card');
    const rgbStyle = await banner.evaluate((element) =>
      window.getComputedStyle(element).getPropertyValue('background-color'),
    );

    const color: NormalizeColorArgs = {
      name: (
        (await palette.locator('.color-catalogue-revamp-list--colorTitle').textContent()) as string
      )
        .trim()
        .split(/\s+/g)
        .join(' '),
      code: (await palette
        .locator('.color-catalogue-revamp-list--colorCode')
        .textContent()) as string,
      hexCode: rgbToHexCode(rgbStyleToRgb(rgbStyle)),
    };

    colors.push(normalizeColor(color));
  }

  return colors;
}

export default async function scrapAsianPaintsColors() {
  const spinner = ora('Scraping Asian Paints colors...').start();

  const { browser, page } = await createBrowser();

  await page.goto(URL);
  await loadColors(page);

  const colors = await scrapColors(page);

  await writeFileAsync(ASIAN_PAINTS_FILE_PATH, getUniqueColors(colors));
  await closeBrowser(browser);

  spinner.succeed('Scrap Asian Paints colors completed successfully.');
}
