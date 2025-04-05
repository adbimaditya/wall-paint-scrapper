import { randomUUID } from 'crypto';

import type { NormalizeColorArgs } from './args.ts';
import type { Color } from './types.ts';

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

export function getUniqueColors(colors: Color[]) {
  return colors.filter(
    (color, index, self) =>
      self.findIndex(
        (c) => c.name === color.name && c.code === color.code && c.hexCode === color.hexCode,
      ) === index,
  );
}
