import type { Locator } from '@playwright/test';
import { randomUUID } from 'crypto';

import type { NormalizeColorArgs } from './args.ts';
import type { Color, Result, RGB } from './types.ts';

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export async function isElementExists(locator: Locator) {
  const { data } = await tryCatch(locator.isVisible());

  return Boolean(data);
}

export function capitalize(words: string) {
  return words
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function normalizeColor({ name, code, hexCode }: NormalizeColorArgs): Color {
  return {
    id: randomUUID(),
    name: capitalize(name),
    code: code && capitalize(code),
    hexCode: hexCode.toUpperCase(),
  };
}

export function numberToHexadecimal(value: number) {
  return value.toString(16);
}

export function getUniqueColors(colors: Color[]) {
  return colors.filter(
    (color, index, self) =>
      self.findIndex(
        (c) => c.name === color.name && c.code === color.code && c.hexCode === color.hexCode,
      ) === index,
  );
}

export function rgbStyleToRgb(rgbStyle: string): RGB {
  const [r, g, b] = rgbStyle
    .replace('rgb(', '')
    .replace(')', '')
    .split(', ')
    .map((hex) => Number(hex));

  return { r, g, b };
}

export function rgbToHexCode({ r, g, b }: RGB) {
  return `#${numberToHexadecimal(r)}${numberToHexadecimal(g)}${numberToHexadecimal(b)}`;
}

export function isFirstIteration(index: number) {
  return index === 0;
}
