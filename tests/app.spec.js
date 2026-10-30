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
  await expect(page.locator('#s1 .ttl .he')).toHaveText('לְעִלּוּי נִשְׁמַת');
  await expect(page.locator('#s1 .ttl .gloss')).toHaveText('In Memory Of');
  await expect(page.locator('#name')).toHaveAttribute('placeholder', 'דָּוִד יָעִישׁ');
  await expect(page.locator('#s1 .en')).toHaveCount(0);
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('label[for="title"] .gloss')).toHaveText('Title (optional, e.g. HaRav)');
  await expect(page.locator('#father')).toBeHidden();
  await expect(page.locator('#mother')).toBeHidden();
  await expect(page.locator('#name-lab .he')).toHaveText('שם הנפטר');
  await expect(page.locator('#name-lab .gloss')).toHaveText("Deceased's Name");
  await expect(page.locator('.opt.sel')).toHaveCount(0);
  await expect(page.locator('.base .lab .he')).toHaveText('שם בלבד');
  await expect(page.locator('.base .lab .gloss')).toHaveText('Name Only');
  await expect(page.locator('.base')).toHaveJSProperty('tagName', 'DIV');
  await expect(page.locator('.opt[data-k="father"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#ver-lab .he')).toHaveText('תפילה ותהילים: בחרו נוסח');
  await expect(page.locator('#ver-lab .gloss')).toHaveText('Prayers and Tehillim: choose a version');
  await expect(page.locator('#next1 .gloss')).toHaveText('Begin Tehillim');
  await expect(page.locator('#gender button[data-g="m"] .gloss')).toHaveText('Male');
  await expect(page.locator('#gender button[data-g="f"] .gloss')).toHaveText('Female');
  await expect(page.locator('.base .cue .he')).toHaveText('0 פרקים · ~8 דקות');
  await expect(page.locator('.base .cue .gloss')).toHaveText('0 sections · ~8 min');
  await expect(page.locator('.opt[data-k="father"] .cue .he')).toHaveText('0 פרקים · ~8 דקות');
  await expect(page.locator('.opt[data-k="mother"] .cue .he')).toHaveText('0 פרקים · ~8 דקות');
  await expect(page.locator('.opt[data-k="both"] .cue .he')).toHaveText('0 פרקים · ~8 דקות');
  await expect(page.locator('.opt[data-k="both"] .cue .gloss')).toHaveText('0 sections · ~8 min');
  await expect(page.locator('.opt[data-k="father"]')).toBeEnabled();
  await expect(page.locator('.opt[data-k="mother"]')).toBeEnabled();
  await expect(page.locator('.opt[data-k="both"]')).toBeEnabled();
  await page.locator('.opt[data-k="mother"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.opt[data-k="mother"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.opt[data-k="father"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#mother')).toBeVisible();
  await page.locator('.opt[data-k="mother"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.opt[data-k="mother"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#mother')).toBeHidden();
  await expect(page.locator('#spell')).toBeHidden();
  await page.getByRole('button', { name: 'נְקֵבָה' }).click();
  await expect(page.locator('#name-lab .he')).toHaveText('שם הנפטרת');
  await expect(page.locator('#name-lab .gloss')).toHaveText("Deceased's Name");
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await expect(page.locator('#name-lab .he')).toHaveText('שם הנפטר');
});

test('explains the parent-name choice', async ({ page }) => {
  const info = page.locator('#info');
  const box = await info.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(info).toHaveAttribute('aria-label', 'הסבר: שם האב או שם האם');
  await expect(page.locator('#info-pop')).toBeHidden();

  await info.click();
  await expect(page.locator('#info-pop')).toBeVisible();
  await expect(page.locator('#info')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#info-title')).toHaveText('שם האב או שם האם?');
  await expect(page.locator('.info-he p').nth(0)).toHaveText('אשכנזים: שם האב. לפי גשר החיים (ח״א פרק ל״א), אשכנזים מזכירים את הנפטר בשם אביו.');
  await expect(page.locator('.info-he p').nth(1)).toHaveText('ספרדים: שם האם. ספרדים מזכירים בשם אמו, על פי הזוהר (כף החיים או״ח רפ״ד:ל״ז).');
  await expect(page.locator('.info-he p').nth(2)).toHaveText('שני ההורים: יש קהילות המזכירות את שניהם (בצל החכמה ח״ג צ״א).');
  await expect(page.locator('.info-he .info-sum')).toHaveText('לפרק קי״ט עצמו, גשר החיים מביא רק את אותיות שם הנפטר ואותיות נשמה. לכן כל אפשרות כאן כשרה; נהגו כמנהג משפחתכם.');
  await expect(page.locator('.info-en h2')).toHaveText("Father's or mother's name?");
  await expect(page.locator('.info-en p').nth(0)).toHaveText("Ashkenazim: father's name. Gesher HaChaim (I:31) says Ashkenazim name the deceased with the father's name.");
  await expect(page.locator('.info-en p').nth(1)).toHaveText("Sephardim: mother's name. Sephardim use the mother's name, based on the Zohar (Kaf HaChaim 284:37).");
  await expect(page.locator('.info-en p').nth(2)).toHaveText('Both parents: some communities name both (Betzel HaChochma III:91).');
  await expect(page.locator('.info-en .info-sum')).toHaveText("For Psalm 119 itself, Gesher HaChaim lists only the letters of the name and נשמה. So any option here is fine; follow your family's custom.");

  await page.keyboard.press('Escape');
  await expect(page.locator('#info-pop')).toBeHidden();
  await expect(page.locator('#info')).toHaveAttribute('aria-expanded', 'false');

  await info.click();
  await page.locator('#info-x').click();
  await expect(page.locator('#info-pop')).toBeHidden();

  await info.click();
  await page.locator('#info-pop').click({ position: { x: 8, y: 8 } });
  await expect(page.locator('#info-pop')).toBeHidden();
});

test('requires a Hebrew name and a gender', async ({ page }) => {
  await page.locator('#next1').click();
  await expect(page.locator('#e-name .he')).toHaveText('שדה חובה');
  await expect(page.locator('#e-name .gloss')).toHaveText('Required');
  await expect(page.locator('#e-gender .he')).toHaveText('בחרו זכר או נקבה');
  await expect(page.locator('#e-gender .gloss')).toHaveText('Choose male or female');
  await expect(page.locator('#s3')).toBeHidden();

  await page.locator('#name').fill('David');
  await expect(page.locator('#e-name .he')).toHaveText('אותיות עבריות בלבד');
  await expect(page.locator('#e-name .gloss')).toHaveText('Hebrew letters only');
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
  await expect(page.locator('#name-lab .he')).toHaveText('שם הנפטר');
  await expect(page.locator('.base .cue .he')).toHaveText('7 פרקים · ~15 דקות');
  await expect(page.locator('.opt[data-k="father"] .cue .he')).toHaveText('7 פרקים · ~15 דקות');
  await expect(page.locator('.opt[data-k="mother"] .cue .he')).toHaveText('7 פרקים · ~15 דקות');
  await expect(page.locator('.opt[data-k="both"] .cue .he')).toHaveText('7 פרקים · ~15 דקות');
  await page.locator('.opt[data-k="both"]').click();
  await expect(page.locator('#father')).toBeVisible();
  await expect(page.locator('#mother')).toBeVisible();
  await page.locator('#father').fill('יוֹסֵף');
  await page.locator('#mother').fill('אֶסְתֵּר');

  await expect(page.locator('.base .lab .he')).toHaveText('שם בלבד');
  await expect(page.locator('.opt[data-k="father"] .lab .he')).toHaveText('+ שם האב');
  await expect(page.locator('.opt[data-k="mother"] .lab .he')).toHaveText('+ שם האם');
  await expect(page.locator('.opt[data-k="both"] .lab .he')).toHaveText('+ שני ההורים');
  await expect(page.locator('.base .cue .he')).toHaveText('7 פרקים · ~15 דקות');
  await expect(page.locator('.opt[data-k="father"] .cue .he')).toHaveText('11 פרקים · ~18 דקות');
  await expect(page.locator('.opt[data-k="mother"] .cue .he')).toHaveText('11 פרקים · ~18 דקות');
  await expect(page.locator('.opt[data-k="both"] .cue .he')).toHaveText('15 פרקים · ~22 דקות');
  const cueStyle = await page.locator('.opt[data-k="both"] .cue .he').evaluate((el) => {
    const cs = getComputedStyle(el);
    const rgb = cs.color.match(/\d+/g).map(Number);
    const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const L = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
    const rowEl = el.closest('.opt');
    const lab = rowEl.querySelector('.lab .he').getBoundingClientRect();
    const gloss = rowEl.querySelector('.lab .gloss').getBoundingClientRect();
    const cue = el.getBoundingClientRect();
    const row = rowEl.getBoundingClientRect();
    const labMid = lab.top + lab.height / 2;
    const cueMid = cue.top + cue.height / 2;
    return {
      size: parseFloat(cs.fontSize),
      contrast: 1.05 / (L + 0.05),
      labelOneLine: lab.height < 36,
      glossBelow: gloss.top >= lab.bottom - 3,
      inside: cue.left >= row.left - 1 && cue.right <= row.right + 1,
      sameLine: Math.abs(labMid - cueMid) < 12,
      pageOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    };
  });
  expect(cueStyle.size).toBeGreaterThanOrEqual(16);
  expect(cueStyle.contrast).toBeGreaterThanOrEqual(4.5);
  expect(cueStyle.labelOneLine).toBe(true);
  expect(cueStyle.glossBelow).toBe(true);
  expect(cueStyle.inside).toBe(true);
  expect(cueStyle.sameLine).toBe(true);
  expect(cueStyle.pageOverflow).toBe(true);
  await expect(page.locator('.fsbar')).toBeHidden();
  const cue = page.locator('.opt[data-k="both"] .cue .he');
  await cue.scrollIntoViewIfNeeded();
  const cueClear = await cue.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const node = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return node === el || !!(node && el.contains(node));
  });
  expect(cueClear).toBe(true);
  await expect(page.locator('.opt')).toHaveCount(3);
  await expect(page.locator('.base')).toHaveCount(1);
  await expect(page.locator('.opt', { hasText: 'דָּוִד' })).toHaveCount(0);

  const selectedBg = await page.locator('.opt.sel').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(selectedBg).toBe('rgb(255, 255, 255)');

  await page.locator('.opt[data-k="father"]').click();
  await expect(page.locator('#spell')).toHaveText('דָּוִד יָעִישׁ בֶּן יוֹסֵף');
  await expect(page.locator('#spell')).toHaveCount(1);
  await page.locator('#next1').click();

  await expect(page.locator('#s3')).toBeVisible();
  await expect(page.locator('.cover .lil')).toHaveText('לְעִלּוּי נִשְׁמַת');
  await expect(page.locator('.cover .big')).toHaveText('הָרַב דָּוִד יָעִישׁ בֶּן יוֹסֵף');
  await expect(page.locator('.seq')).toHaveText('ד ו ד י ע י ש י ו ס פ');
  await expect(page.locator('.cover .big')).toContainText('בֶּן');
  await expect(page.locator('#book')).toContainText('שֶׁהָלַךְ לְעוֹלָמוֹ');
  await expect(page.locator('#book')).toContainText('תִּשְׁכַּב בְּשָׁלוֹם');
  await expect(page.locator('#book')).toContainText('וּזְכוּתוֹ');
  await expect(page.locator('#book')).toContainText('אֶסְתֵּר');
  await expect(page.locator('.ltr')).toHaveCount(15);
  await expect(page).toHaveTitle('תהילים — הָרַב דָּוִד יָעִישׁ בֶּן יוֹסֵף');

  const jumpCount = await page.locator('#jump option').count();
  expect(jumpCount).toBeGreaterThan(2);
});

test('uses feminine grammar and repeats a letter that appears twice', async ({ page }) => {
  await page.locator('#name').fill('בֵּילָא בְּרָכָה');
  await page.getByRole('button', { name: 'נְקֵבָה' }).click();
  await expect(page.locator('#name-lab .he')).toHaveText('שם הנפטרת');
  await expect(page.locator('.base .cue .he')).toHaveText('8 פרקים · ~16 דקות');
  await expect(page.locator('.opt[data-k="mother"] .cue .he')).toHaveText('8 פרקים · ~16 דקות');
  await expect(page.locator('.opt[data-k="both"] .cue .he')).toHaveText('8 פרקים · ~16 דקות');
  await page.locator('#next1').click();

  await expect(page.locator('.seq')).toHaveText('ב י ל א ב ר כ ה');
  const bets = await page.locator('.ltr', { hasText: /^ב$/ }).count();
  expect(bets).toBe(2);
  await expect(page.locator('#book')).toContainText('שֶׁהָלְכָה לְעוֹלָמָהּ');
  await expect(page.locator('#book')).toContainText('תִּשְׁכְּבִי בְּשָׁלוֹם');
  await expect(page.locator('#book')).toContainText('וּזְכוּתָהּ');
  await expect(page.locator('#book')).not.toContainText('שֶׁהָלַךְ לְעוֹלָמוֹ');
});

test('reveals a parent field under the chosen row', async ({ page }) => {
  await page.locator('#name').fill('דָּוִד');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await expect(page.locator('#father')).toBeHidden();
  await expect(page.locator('.opt[data-k="father"]')).toBeEnabled();
  await expect(page.locator('.opt[data-k="father"] .cue .he')).toHaveText('3 פרקים · ~11 דקות');
  await expect(page.locator('.opt[data-k="mother"] .cue .he')).toHaveText('3 פרקים · ~11 דקות');
  await expect(page.locator('.opt[data-k="both"] .cue .he')).toHaveText('3 פרקים · ~11 דקות');
  await page.locator('.opt[data-k="father"]').click();
  await expect(page.locator('#father')).toBeVisible();
  await expect(page.locator('#mother')).toBeHidden();
  await page.locator('#next1').click();
  await expect(page.locator('#s3')).toBeHidden();
  await expect(page.locator('#e-father .he')).toHaveText('שדה חובה');
  await expect(page.locator('#e-father .gloss')).toHaveText('Required');

  await page.locator('#father').fill('יוֹסֵף');
  await expect(page.locator('.opt[data-k="father"] .cue .he')).toHaveText('7 פרקים · ~15 דקות');
  await expect(page.locator('#spell')).toHaveText('דָּוִד בֶּן יוֹסֵף');
  await page.locator('.opt[data-k="father"]').click();
  await expect(page.locator('.opt[data-k="father"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#father')).toBeHidden();
  await expect(page.locator('#spell')).toBeHidden();
  await page.locator('.opt[data-k="father"]').click();
  await page.locator('#next1').click();
  await expect(page.locator('.cover .big')).toHaveText('דָּוִד בֶּן יוֹסֵף');
  await expect(page.locator('.seq')).toHaveText('ד ו ד י ו ס פ');
});

test('remembers the text size and the form', async ({ page }) => {
  await expect(page.locator('.fsbar')).toBeHidden();
  const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim());
  expect(before).toBe('1.1');

  await page.locator('#name').fill('דָּוִד');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await page.locator('#next1').click();
  await expect(page.locator('.fsbar')).toBeVisible();
  await page.locator('#plus').click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim())).toBe('1.2');
  await page.reload();

  await expect(page.locator('.fsbar')).toBeHidden();
  await expect(page.locator('#name')).toHaveValue('דָּוִד');
  await expect(page.locator('#gender button.sel')).toHaveAttribute('data-g', 'm');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim())).toBe('1.2');
});

test('edit returns to the one page', async ({ page }) => {
  await page.locator('#name').fill('דָּוִד');
  await page.getByRole('button', { name: 'זָכָר' }).click();
  await page.locator('#next1').click();
  await expect(page.locator('#s3')).toBeVisible();
  await expect(page.locator('.fsbar')).toBeVisible();
  await page.locator('#edit').click();
  await expect(page.locator('#s1')).toBeVisible();
  await expect(page.locator('#s3')).toBeHidden();
  await expect(page.locator('.fsbar')).toBeHidden();
  await expect(page.locator('#name')).toHaveValue('דָּוִד');
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
  expect(swText).toContain("var CACHE = 'tehillim-v13';");
  expect(swText).toContain('self.skipWaiting()');
  expect(swText).toContain('self.clients.claim()');
  expect(swText).toContain("fetch(event.request, { cache: 'reload' })");

  const htmlRes = await page.request.get('index.html');
  expect(htmlRes.ok()).toBeTruthy();
  const html = await htmlRes.text();
  expect(html).toContain("updateViaCache: 'none'");
  expect(html).toContain('controllerchange');
  expect(html).toContain('location.reload()');

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
  await expect(page.locator('#s1 .ttl .he')).toHaveText('לְעִלּוּי נִשְׁמַת');
});
