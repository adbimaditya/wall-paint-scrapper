import ora from 'ora';

import type { NormalizeColorArgs } from '../libs/args.ts';
import { NIPPON_PAINT_FILE_PATH } from '../libs/constants.ts';
import { writeFileAsync } from '../libs/file.ts';
import { closeBrowser, createBrowser } from '../libs/playwright.ts';
import type { Color } from '../libs/types.ts';
import { getUniqueColors, normalizeColor } from '../libs/utils.ts';

const URL = 'https://nipponpaint.com.sg/colours/find-your-colour';

export default async function scrapNipponPaintColors() {
  const spinner = ora('Scraping Nippon Paint colors...').start();

  const { browser, page } = await createBrowser();

  await page.goto(URL, { waitUntil: 'networkidle' });

  const links = await page.locator('.container-fluid > ul > li > a').all();

  const paths: string[] = [];

  for (const link of links) {
    const url = (await link.getAttribute('href')) as string;
    const path = url.replace(URL, '').replace('/', '');

    paths.push(path);
  }

  const colors: Color[] = [];

  for (const path of paths) {
    await page.goto(`${URL}/${path}`, { waitUntil: 'networkidle' });

    const colorsInPage: Color[] = [];
    const palettes = await page.locator('.card').all();

    for (const palette of palettes) {
      const color: NormalizeColorArgs = {
        name: (await palette.locator('.card-title a').textContent()) as string,
        code: (await palette.locator('.card-body p').nth(1).textContent()) as string,
        hexCode: `#${((await palette.locator('.card-image > img').getAttribute('class')) as string)
          .split(' ')[1]
          .replace('ci_', '')}`,
      };

      colorsInPage.push(normalizeColor(color));
    }

    colors.push(...colorsInPage);
  }

  await writeFileAsync(NIPPON_PAINT_FILE_PATH, getUniqueColors(colors));

  await closeBrowser(browser);

  spinner.succeed('Scrap Nippon Paint colors completed successfully.');
}
