import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
export function browserOptions() {
  if (process.env.CI) return {};
  const supplied = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (supplied) return { executablePath: supplied };
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache).filter(x => x.startsWith('chromium-')).sort().reverse()) {
      const file = join(cache, dir, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      if (existsSync(file)) return { executablePath: file };
    }
  }
  return {};
}
