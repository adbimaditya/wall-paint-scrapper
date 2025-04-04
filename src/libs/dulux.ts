import type { NormalizeColorArgs } from './args.ts';
import { DULUX_FILE_PATH } from './constants.ts';
import { writeFileAsync } from './file.ts';
import { closeBrowser, createBrowser } from './playwright.ts';
import type { Color } from './types.ts';
import { getUniqueColors, normalizeColor } from './utils.ts';

const URL = 'https://www.dulux.co.id/id/palet-warna';

export default async function scrapDuluxColors() {
  const { browser, page } = await createBrowser();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.getByRole('dialog').getByRole('button', { name: 'Reject All' }).click();

  const links = await page.locator('.a20-color-box').all();
  const colors: Color[] = [];

  for (const link of links.slice(1)) {
    const palettes = await page.locator('.item.related-item-color').all();
    const colorsInList: Color[] = [];

    for (const palette of palettes) {
      const colorPalette = palette.locator('.m7-color-card');
      const color: NormalizeColorArgs = {
        name: (await colorPalette.getAttribute('data-label')) as string,
        hexCode: (await colorPalette.getAttribute('data-hex')) as string,
      };

      colorsInList.push(normalizeColor(color));
    }

    colors.push(...colorsInList);

    await link.click();

    const id = (await link.getAttribute('data-id')) as string;
    const url = `**/h_${encodeURIComponent(id.charAt(0).toUpperCase() + id.slice(1))}`;

    await page.waitForURL(url);
  }

  await writeFileAsync(DULUX_FILE_PATH, getUniqueColors(colors));

  await closeBrowser(browser);
}
