import { test, expect } from '@playwright/test';

test('hero actions and ten-second slideshow work on mobile', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-04T12:00:00Z') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.hero-current-image')).toBeVisible();
  await page.clock.pauseAt(new Date('2026-10-04T12:01:00Z'));
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  const toggle = page.locator('.hero-motion-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-label', 'Play hero slideshow');
  await page.keyboard.press('Enter');
  await expect(page.locator('.hero-motion-toggle')).toHaveAttribute('aria-label', 'Pause hero slideshow');
  await page.locator('.hero-motion-toggle').evaluate(button => (button as HTMLButtonElement).blur());
  await page.mouse.move(0, 0);
  const initialImage = await page.locator('.hero-current-image').getAttribute('alt');
  await page.clock.runFor(9_999);
  await expect(page.locator('.hero-current-image')).toHaveAttribute('alt', initialImage!);
  await page.clock.runFor(1);
  await expect(page.locator('.hero-current-image')).not.toHaveAttribute('alt', initialImage!);
  const nextImage = await page.locator('.hero-current-image').getAttribute('alt');
  await page.locator('#hero').getByRole('button', { name: 'Pause hero slideshow', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.clock.runFor(30_000);
  await expect(page.locator('.hero-current-image')).toHaveAttribute('alt', nextImage!);
  await page.locator('.hero-motion-toggle').evaluate(button => (button as HTMLButtonElement).blur());
  await expect(page.locator('.hero-controls')).toHaveCount(0);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    for (const control of await page.locator('#hero a').all()) {
      const bounds = (await control.boundingBox())!;
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.locator('#hero').getByRole('link', { name: 'Explore the designs', exact: true }).click();
  await expect(page).toHaveURL(/#gallery$/);
  await page.clock.runFor(1000);
  await expect(page.getByRole('heading', { name: 'Find your next entrance.' })).toBeVisible();
  await page.locator('#hero').getByRole('link', { name: 'Plan your project', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await page.clock.runFor(1000);
  await expect(page.getByRole('heading', { name: 'Tell us what you have in mind.' })).toBeVisible();
});

test('navigation pins after services and returns to normal at the top', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.locator('.landing-header');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(header).not.toHaveClass(/is-pinned/);
    await page.locator('#services').evaluate(section => scrollTo({ top: section.getBoundingClientRect().top + scrollY + 100, behavior: 'instant' }));
    await expect(header).not.toHaveClass(/is-pinned/);
    await page.locator('#services').evaluate(section => scrollTo({ top: section.getBoundingClientRect().bottom + scrollY + 1, behavior: 'instant' }));
    await expect(header).toHaveClass(/is-pinned/);
    expect((await header.boundingBox())!.y).toBe(0);
    expect(await page.locator('.interiors-copy').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});

test('all 33 mobile gallery cards stick below the header and remain interactive', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  const cards = page.locator('.project-tile');
  await expect(cards).toHaveCount(33);
  await expect(page.getByRole('button', { name: 'View all 33 designs' })).toHaveCount(0);
  const pinTop = await page.locator('.header-inner').evaluate(element => element.getBoundingClientRect().height + 12);
  for (const index of [0, 1, 16, 32]) {
    await cards.nth(index).evaluate((card, pinTop) => scrollTo({ top: (card as HTMLElement).offsetTop + document.querySelector('.project-grid')!.getBoundingClientRect().top + scrollY - pinTop + (card === document.querySelector('.project-tile:last-child') ? 0 : 60), behavior: 'instant' }), pinTop);
    await expect.poll(async () => (await cards.nth(index).boundingBox())!.y).toBeCloseTo(pinTop, 0);
  }
  await cards.nth(32).click();
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText('Ornamental gate design');
  await page.keyboard.press('Escape');
  await expect(cards.nth(32)).toBeFocused();
  await page.locator('.gallery-filters').getByRole('button', { name: /^Doors/ }).click();
  await expect(cards).toHaveCount(13);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(cards).toHaveCount(8);
  expect(await cards.first().evaluate(card => getComputedStyle(card).position)).toBe('relative');
});

test('policy links open dedicated pages and retain navigation on mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  await page.getByRole('navigation', { name: 'Legal and privacy information' }).getByRole('link', { name: 'Privacy Policy', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
  for (const [route, title] of [
    ['/privacy-policy', 'Privacy Policy'],
    ['/terms-of-use', 'Terms of Use'],
    ['/cookie-policy', 'Cookie Policy'],
    ['/security', 'Security & Privacy Requests'],
  ]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.locator('.policy-eyebrow')).toHaveCount(0);
    await expect(page).toHaveTitle(`${title} | Wills Group of Company`);
    await expect(page.getByRole('navigation', { name: 'Policies and website information' }).getByRole('link', { name: title, exact: true })).toHaveAttribute('aria-current', 'page');
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  }
  await page.getByRole('complementary').getByRole('button', { name: 'Cookie settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Cookie consent' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  await page.getByRole('navigation', { name: 'Legal and privacy information' }).getByRole('link', { name: 'Terms of Use', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of Use' })).toBeFocused();
  await page.getByRole('link', { name: 'Contact Wills', exact: true }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.getByRole('heading', { name: 'Tell us what you have in mind.' })).toBeVisible();
});

test('interior captions, descriptions and alternative text use design concept wording', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  await expect(page.locator('#hero').getByRole('link', { name: 'Explore the designs', exact: true })).toHaveAttribute('href', '#gallery');
  await expect(page.locator('#hero').getByRole('link', { name: 'Plan your project', exact: true })).toHaveAttribute('href', '#contact');
  await expect(page.locator('.hero-controls')).toHaveCount(0);
  await expect(page.locator('.hero-slide-caption')).toHaveCount(0);
  await page.getByRole('button', { name: 'View Living room interior design concept', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Interior design concept. Discuss your layout, materials and finishing requirements with Wills Group.')).toBeVisible();
  const publicText = await page.locator('body').innerText();
  const imageText = await page.locator('img').evaluateAll(images => images.map(image => image.alt).join(' '));
  expect(`${publicText} ${imageText}`).not.toMatch(/ai[ -]?generated/i);
});

test('responsive corners, gallery controls and navigation work across viewport sizes', async ({ page, browser }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  for (const [width, height] of [[320, 812], [375, 812], [430, 932], [768, 1024], [820, 1180], [1024, 768], [1440, 900], [1920, 1080], [844, 390]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await page.locator('.header-logo').evaluate(el => Math.abs(el.getBoundingClientRect().x + el.getBoundingClientRect().width / 2 - innerWidth / 2))).toBeLessThan(1);
    const badCorners = await page.locator('button, input, select, textarea, [class*="rounded"], .header-quote, .wills-button, .project-image, .floating-whatsapp').evaluateAll(elements => elements.filter(el => getComputedStyle(el).borderTopLeftRadius !== '12px').map(el => el.className));
    expect(badCorners).toEqual([]);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'View Living room interior design concept', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('Living room');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('heading')).toHaveText('Bedroom');
  await dialog.getByRole('button', { name: 'Next design', exact: true }).click();
  await expect(dialog.getByRole('heading')).toHaveText('Fitted kitchen');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('heading')).toHaveText('Bedroom');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'View Living room interior design concept', exact: true })).toBeFocused();
  await page.locator('#services').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }));
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services', exact: true })).toHaveAttribute('aria-current', 'location');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.floating-whatsapp').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const touchPage = await touchContext.newPage();
    await touchPage.goto('/');
    await touchPage.getByRole('button', { name: 'Got it', exact: true }).tap({ timeout: 20_000 });
    await touchPage.getByRole('button', { name: 'View Living room interior design concept', exact: true }).tap();
    const photo = touchPage.locator('.lightbox-photo');
    await expect(photo).toBeVisible();
    const bounds = (await photo.boundingBox())!;
    const session = await touchContext.newCDPSession(touchPage);
    const y = bounds.y + bounds.height / 2;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width * .8, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: bounds.x + bounds.width * .5, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: bounds.x + bounds.width * .2, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(touchPage.getByRole('dialog').getByRole('heading')).toHaveText('Bedroom');
  } finally { await touchContext.close(); }
});

test('rebranded navigation, interiors and gallery remain functional', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  await expect(page).toHaveTitle(/Wills Group of Company/);
  await expect(page.locator('h1')).toContainText('Considered interiors.');
  await expect(page.locator('.interior-concept-grid img')).toHaveCount(6);
  for (const image of await page.locator('.interior-concept-grid img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.locator('.hero-content').evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const heading = element.querySelector('h1')!.getBoundingClientRect();
      return { center: bounds.x + bounds.width / 2, headingCenter: heading.x + heading.width / 2, alignment: getComputedStyle(element).textAlign };
    });
    expect(layout.alignment).toBe('center');
    expect(Math.abs(layout.center - layout.headingCenter)).toBeLessThan(2);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('body')).not.toContainText('Thewworks');
  await page.locator('#gallery').getByRole('button', { name: /^Interiors/ }).click();
  await expect(page.locator('.project-tile')).toHaveCount(1);
  await page.getByRole('button', { name: 'View Interior door reference Interiors', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 900 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Interiors' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.goto('/unknown-route');
  await expect(page).toHaveURL('/');
  expect(errors).toEqual([]);
});

test('project brief validates required fields and prepares an explicit WhatsApp handoff', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it', exact: true }).click({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Step 1 of 2: Your project')).toBeVisible();
  await page.getByLabel('Town / country').fill('Abuja, Nigeria');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Your name', { exact: true }).fill('Test Customer');
  await page.locator('#project-brief').getByLabel('Email', { exact: true }).fill('customer@example.com');
  await page.getByRole('button', { name: 'Prepare my brief' }).click();
  await expect(page.getByText('Nothing has been sent yet.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open WhatsApp', exact: true })).toHaveAttribute('href', /wa\.me\/2347057450799/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save project brief' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('wills-group-project-brief.txt');
  await page.getByRole('button', { name: 'Edit details' }).click();
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Test Customer');
});
