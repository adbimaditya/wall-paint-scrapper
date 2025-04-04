import type { BrowserContextOptions, LaunchOptions } from '@playwright/test';
import type { Color } from './types.ts';

export type CreateBrowserArgs = {
  launchOptions?: LaunchOptions;
  browserContextOptions?: BrowserContextOptions;
};

export type NormalizeColorArgs = Omit<Color, 'id'>;
