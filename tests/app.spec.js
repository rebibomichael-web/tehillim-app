const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('opens in Hebrew, right to left', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#s1')).toBeVisible();
  await expect(page.locator('#s1 .ttl')).toHaveText('פְּרָטֵי הַנִּפְטָר/ת');
  await expect(page.locator('#name')).toHaveAttribute('placeholder', 'דָּוִד יָעִישׁ');
});

test('requires a Hebrew name and a gender', async ({ page }) => {
  await page.locator('#next1').click();
  await expect(page.locator('#e-name')).toHaveText('שדה חובה');
  await expect(page.locator('#e-gender')).toHaveText('בחרו מין (choose gender)');
  await expect(page.locator('#s2')).toBeHidden();

  await page.locator('#name').fill('David');
  await expect(page.locator('#e-name')).toHaveText('אותיות עבריות בלבד (Hebrew letters only)');
});

test('spells a name with final letters folded, nikud ignored', async ({ page }) => {
  const folded = await page.evaluate(() => window.__thl.letters('ךםןףץ'));
  expect(folded).toEqual(['כ', 'מ', 'נ', 'פ', 'צ']);
  const bila = await page.evaluate(() => window.__thl.letters('בֵּילָא בְּרָכָה'));
  expect(bila).toEqual(['ב', 'י', 'ל', 'א', 'ב', 'ר', 'כ', 'ה']);
  const empty = await page.evaluate(() => window.__thl.valid('', true));
  expect(empty).toBe('שדה חובה');
});

test('builds the masculine booklet, title excluded from the spelling', async ({ page }) => {
  await page.locator('#title').fill('הָרַב');
  await page.locator('#name').fill('דָּוִד יָעִישׁ');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await page.locator('#father').fill('יוֹסֵף');
  await page.locator('#mother').fill('אֶסְתֵּר');
  await page.locator('#next1').click();

  await expect(page.locator('#s2')).toBeVisible();
  await page.locator('.opt', { hasText: 'עם שם האב' }).click();
  await expect(page.locator('.opt.sel .cnt')).toHaveText('13 אותיות');
  await page.locator('#next2').click();

  await expect(page.locator('#s3')).toBeVisible();
  await expect(page.locator('.cover .lil')).toHaveText('לְעִלּוּי נִשְׁמַת');
  await expect(page.locator('.cover .big')).toHaveText('הָרַב דָּוִד יָעִישׁ בֶּן יוֹסֵף');
  await expect(page.locator('.seq')).toHaveText('ד ו ד י ע י ש ב נ י ו ס פ');
  await expect(page.locator('#book')).toContainText('שֶׁהָלַךְ לְעוֹלָמוֹ');
  await expect(page.locator('#book')).toContainText('תִּשְׁכַּב בְּשָׁלוֹם');
  await expect(page.locator('#book')).toContainText('וּזְכוּתוֹ');
  await expect(page.locator('#book')).toContainText('אֶסְתֵּר');
  await expect(page.locator('.ltr')).toHaveCount(17);
  await expect(page).toHaveTitle('תהילים — הָרַב דָּוִד יָעִישׁ בֶּן יוֹסֵף');

  const jumpCount = await page.locator('#jump option').count();
  expect(jumpCount).toBeGreaterThan(2);
});

test('uses feminine grammar and repeats a letter that appears twice', async ({ page }) => {
  await page.locator('#name').fill('בֵּילָא בְּרָכָה');
  await page.getByRole('button', { name: 'נְקֵבָה' }).click();
  await page.locator('#next1').click();
  await page.locator('#next2').click();

  await expect(page.locator('.seq')).toHaveText('ב י ל א ב ר כ ה');
  const bets = await page.locator('.ltr', { hasText: /^ב$/ }).count();
  expect(bets).toBe(2);
  await expect(page.locator('#book')).toContainText('שֶׁהָלְכָה לְעוֹלָמָהּ');
  await expect(page.locator('#book')).toContainText('תִּשְׁכְּבִי בְּשָׁלוֹם');
  await expect(page.locator('#book')).toContainText('וּזְכוּתָהּ');
  await expect(page.locator('#book')).not.toContainText('שֶׁהָלַךְ לְעוֹלָמוֹ');
});

test('asks for a missing parent before spelling that name', async ({ page }) => {
  await page.locator('#name').fill('דָּוִד');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await page.locator('#next1').click();
  await page.locator('.opt', { hasText: 'עם שם האב' }).click();
  await expect(page.locator('#inline-father')).toBeVisible();
  await page.locator('#next2').click();
  await expect(page.locator('#s3')).toBeHidden();
  await expect(page.locator('#inline-error-father')).toHaveText('שדה חובה');

  await page.locator('#inline-father').fill('יוֹסֵף');
  await page.locator('#next2').click();
  await expect(page.locator('.cover .big')).toHaveText('דָּוִד בֶּן יוֹסֵף');
  await expect(page.locator('.seq')).toHaveText('ד ו ד ב נ י ו ס פ');
});

test('remembers the text size and the form', async ({ page }) => {
  const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim());
  expect(before).toBe('1.1');
  await page.locator('#plus').click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim())).toBe('1.2');

  await page.locator('#name').fill('דָּוִד');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await page.locator('#next1').click();
  await page.reload();

  await expect(page.locator('#name')).toHaveValue('דָּוִד');
  await expect(page.locator('#gender button.sel')).toHaveAttribute('data-g', 'm');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim())).toBe('1.2');
});

test('edit returns to the spelling step', async ({ page }) => {
  await page.locator('#name').fill('דָּוִד');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await page.locator('#next1').click();
  await page.locator('#next2').click();
  await page.locator('#edit').click();
  await expect(page.locator('#s2')).toBeVisible();
  await page.locator('#back2').click();
  await expect(page.locator('#s1')).toBeVisible();
});

test('manifest, icons, and guarded service worker are served', async ({ page }) => {
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('manifest.webmanifest');
  const manifestRes = await page.request.get(href);
  expect(manifestRes.ok()).toBeTruthy();
  const manifest = await manifestRes.json();
  expect(manifest.name).toBe('תהילים לעילוי נשמה');
  expect(manifest.short_name).toBe('תהילים');
  expect(manifest.dir).toBe('rtl');
  expect(manifest.lang).toBe('he');
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('./');
  expect(manifest.scope).toBe('./');

  for (const icon of manifest.icons) {
    const iconRes = await page.request.get(icon.src);
    expect(iconRes.ok(), icon.src).toBeTruthy();
    const bytes = await iconRes.body();
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  }

  const swRes = await page.request.get('sw.js');
  expect(swRes.ok()).toBeTruthy();
  const swText = await swRes.text();
  expect(swText).toContain('only-if-cached');
  expect(swText).toContain("request.method !== 'GET'");
  expect(swText).toContain('url.origin !== self.location.origin');

  const scope = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
      });
    }
    return ready.scope;
  });
  expect(scope).toBe('http://127.0.0.1:4173/');
});

test('works offline after the service worker is installed', async ({ page, context }) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
      });
    }
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#name')).toBeVisible();
  await expect(page.locator('#s1 .ttl')).toHaveText('פְּרָטֵי הַנִּפְטָר/ת');
});
