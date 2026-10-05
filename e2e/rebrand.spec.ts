import { test, expect } from '@playwright/test';

test('Prisma hero remains readable and usable across short, narrow and zoomed viewports', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1, name: 'Wills Group of Company' });
  await expect(heading).toBeVisible();
  await expect(page.locator('#hero video')).toHaveCount(0);
  await expect(page.locator('#hero nav')).toHaveCount(0);
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    const geometry = await page.locator('#hero').evaluate(section => {
      const frame = section.querySelector('.prisma-hero-frame')!.getBoundingClientRect();
      const heading = section.querySelector('h1')!.getBoundingClientRect();
      const details = section.querySelector('.prisma-hero-details')!.getBoundingClientRect();
      const buttons = [...section.querySelectorAll('a')].map(link => link.getBoundingClientRect().toJSON());
      return { frame: frame.toJSON(), heading: heading.toJSON(), details: details.toJSON(), buttons };
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(geometry.frame.left).toBe(0);
    expect(geometry.frame.width).toBe(width);
    expect(await page.locator('.prisma-hero-frame').evaluate(el => getComputedStyle(el).borderTopLeftRadius)).toBe('0px');
    if (width >= 1024) expect(geometry.heading.right).toBeLessThanOrEqual(geometry.details.left);
    else expect(geometry.heading.bottom).toBeLessThanOrEqual(geometry.details.top);
    for (const button of geometry.buttons) {
      expect(button.width).toBeGreaterThanOrEqual(44);
      expect(button.height).toBeGreaterThanOrEqual(44);
      expect(button.left).toBeGreaterThanOrEqual(geometry.frame.left);
      expect(button.right).toBeLessThanOrEqual(geometry.frame.right);
      expect(button.bottom).toBeLessThanOrEqual(geometry.frame.bottom);
    }
    expect(await page.locator('.prisma-word').evaluate(word => getComputedStyle(word).transform)).toBe('none');
  }
  expect(requests.filter(url => /\.mp4(?:\?|$)/.test(url))).toHaveLength(0);
  expect(requests.filter(url => /prisma-motion-features.*\.js/.test(url))).toHaveLength(0);
  await page.setViewportSize({ width: 1280, height: 900 });
  // CSS zoom exercises text/layout reflow at the equivalent 640px viewport.
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  for (const link of await page.locator('#hero a').all()) await expect(link).toBeVisible();
});

test('hero animation features can fail without hiding the title or project actions', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  let blockedFeatures = 0;
  await page.route('**/assets/prisma-motion-features-*.js', route => { blockedFeatures++; return route.abort(); });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Wills Group of Company' })).toBeVisible();
  const actions = page.locator('#hero a');
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all()) await expect(action).toBeVisible();
  await expect.poll(() => blockedFeatures).toBeGreaterThan(0);
  await page.locator('#hero').getByRole('link', { name: 'Plan your project', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByRole('heading', { name: 'Tell us what you have in mind.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('hero copy finishes its entrance once and retains contrast over every background', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-05T12:00:00Z') });
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  await page.goto('/');
  const word = page.locator('.prisma-word').first();
  await expect.poll(() => word.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  const contrast = await page.locator('#hero').evaluate(hero => {
    const opacityStops = (gradient: string) => [...gradient.matchAll(/rgba\(0, 0, 0, ([\d.]+)\)/g)].map(match => Number(match[1]));
    const minimumShade = Math.min(...opacityStops(getComputedStyle(hero.querySelector('.hero-shade')!).backgroundImage));
    const localShade = Math.max(...opacityStops(getComputedStyle(hero.querySelector('.prisma-hero-content')!, '::before').backgroundImage));
    const noiseOpacity = Number(getComputedStyle(hero.querySelector('.prisma-grain')!).opacity);
    // Pure white is brighter than any pixel in any slide. Bound the grain by its
    // brightest possible soft-light blend, even though it sits below the copy.
    const shadedWhite = (1 - minimumShade) * (1 - localShade);
    const brightestBackground = shadedWhite * (1 - noiseOpacity) + Math.sqrt(shadedWhite) * noiseOpacity;
    const linear = (value: number) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    const foreground = getComputedStyle(hero.querySelector('p')!).color.match(/[\d.]+/g)!.slice(0, 3).map(value => linear(Number(value) / 255));
    const foregroundLuminance = .2126 * foreground[0] + .7152 * foreground[1] + .0722 * foreground[2];
    return (foregroundLuminance + .05) / (linear(brightestBackground) + .05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.clock.pauseAt(new Date('2026-10-05T12:01:00Z'));
  const initialImage = await page.locator('.hero-current-image').getAttribute('alt');
  await page.clock.runFor(10_000);
  await expect(page.locator('.hero-current-image')).not.toHaveAttribute('alt', initialImage!);
  expect(await word.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  const primary = page.locator('#hero .prisma-primary-action');
  await primary.focus();
  expect(await primary.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
});

test('company logo appears in share metadata, browser icons and app manifest', async ({ page, request }) => {
  const sharingPath = '/media/wills/optimized/branding/company-logo-share.jpg';
  const initial = await request.get('/');
  expect(initial.ok()).toBe(true);
  const html = await initial.text();
  expect(html).toContain(sharingPath);
  expect(html).toContain('og:image:width');
  expect(html).toContain('/media/wills/optimized/branding/apple-touch-icon.png');
  await page.goto('/');
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`${sharingPath.replaceAll('.', '\\.')}$`));
  const iconPaths = await page.locator('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').evaluateAll(links => links.map(link => link.getAttribute('href')!));
  const manifest = await (await request.get('/manifest.json')).json();
  for (const asset of [sharingPath, ...iconPaths, ...manifest.icons.map((icon: { src: string }) => icon.src)]) {
    expect((await request.get(asset)).ok()).toBe(true);
  }
  await page.goto('/privacy-policy');
  await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
  await expect(page.locator('head meta[name="twitter:image"]')).toHaveAttribute('content', new RegExp(`${sharingPath.replaceAll('.', '\\.')}$`));
  await expect(page.locator('.header-logo img')).toHaveAttribute('src', '/media/wills/optimized/wills-group-logo.png');
});

test('gallery side previews stay uniform and videos load only after selection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  const videoRequests: string[] = [];
  page.on('request', request => { if (/\.mp4(?:\?|$)/.test(request.url())) videoRequests.push(request.url()); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.project-tile').first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.project-tile img').first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await page.locator('.project-tile img').first().evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/optimized\/gallery\/.*-(360|720|1080)\.avif$/);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const frames = await page.locator('.project-image').evaluateAll(images => images.filter(image => !image.closest('.sticky-scroll-center')).map(image => {
      const bounds = image.getBoundingClientRect(); return { width: bounds.width, height: bounds.height };
    }));
    for (const frame of frames) {
      expect(frame.width).toBeCloseTo(frames[0].width, 0);
      expect(frame.height).toBeCloseTo(frames[0].height, 0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  expect(videoRequests).toHaveLength(0);
  await page.getByRole('button', { name: 'Clip 01', exact: true }).click();
  await expect(page.locator('.project-video')).toHaveAttribute('poster', /^\/media\/wills\/optimized\/VID-.*\.webp$/);
  await expect.poll(() => page.locator('.project-video').evaluate(video => (video as HTMLVideoElement).readyState), { timeout: 15000 }).toBeGreaterThanOrEqual(1);
  await expect.poll(() => page.locator('.project-video').evaluate(video => (video as HTMLVideoElement).paused), { timeout: 15000 }).toBe(false);
  await expect.poll(() => page.locator('.project-video').evaluate(video => (video as HTMLVideoElement).currentTime), { timeout: 15000 }).toBeGreaterThan(0.5);
  await page.locator('.project-video').evaluate(video => (video as HTMLVideoElement).pause());
  expect(videoRequests.some(url => /optimized\/VID-.*\.mp4$/.test(url))).toBe(true);
  for (let index = 2; index <= 12; index++) {
    const name = `Clip ${String(index).padStart(2, '0')}`;
    await page.getByRole('button', { name, exact: true }).click();
    const player = page.locator('.project-video');
    await expect(player).toHaveCount(1);
    await expect(player).toHaveAttribute('aria-label', `${name} video`);
    expect(await player.evaluate(video => ({ volume: (video as HTMLVideoElement).volume, muted: (video as HTMLVideoElement).muted }))).toEqual({ volume: 0.5, muted: false });
    expect(await player.evaluate(video => Boolean(video.closest('.clipped-media-card .clipped-media-frame')))).toBe(true);
    await expect.poll(() => player.evaluate(video => (video as HTMLVideoElement).readyState), { timeout: 15000 }).toBeGreaterThanOrEqual(1);
    await expect.poll(() => player.evaluate(video => (video as HTMLVideoElement).paused), { timeout: 15000 }).toBe(false);
    await expect.poll(() => player.evaluate(video => (video as HTMLVideoElement).currentTime), { timeout: 15000 }).toBeGreaterThan(0.1);
    await player.evaluate(video => (video as HTMLVideoElement).pause());
  }
  await expect(page.locator('.project-video')).toHaveAttribute('src', /WA0093\.mp4$/);
});

test('clipped video previews adapt to screens, keyboard input and playback failures', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  const requests: string[] = [];
  page.on('request', request => { if (/\.mp4(?:\?|$)/.test(request.url())) requests.push(request.url()); });
  await page.goto('/');
  const previews = page.getByRole('region', { name: 'Choose a video', exact: true });
  const cards = previews.getByRole('button');
  await expect(cards).toHaveCount(12);
  await expect(page.locator('.project-video')).toHaveCount(0);
  await expect(page.locator('.clipped-media-definitions clipPath')).toHaveCount(3);
  expect(await page.locator('.video-library-heading').evaluate(el => getComputedStyle(el).textAlign)).toBe('center');
  for (const [width, columns] of [[320, 1], [390, 1], [768, 2], [1440, 3]]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await previews.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(columns);
    const bounds = (await cards.first().boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(await previews.locator('.clipped-media-frame').first().evaluate(el => getComputedStyle(el).clipPath)).toContain('clip-squiggle');
  }
  expect(requests).toHaveLength(0);
  await cards.first().focus();
  expect(await cards.first().evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  const player = page.locator('.project-video');
  await expect(player).toBeFocused();
  await expect(player).toHaveAttribute('controls', '');
  await expect(player).toHaveAttribute('playsinline', '');
  expect(await player.evaluate(video => ({ volume: (video as HTMLVideoElement).volume, muted: (video as HTMLVideoElement).muted }))).toEqual({ volume: 0.5, muted: false });
  expect(await player.evaluate(video => Boolean(video.closest('.clipped-media-card .clipped-media-frame')))).toBe(true);
  await expect.poll(() => player.evaluate(video => (video as HTMLVideoElement).readyState), { timeout: 15000 }).toBeGreaterThanOrEqual(1);
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await player.evaluate(video => scrollTo({ top: video.getBoundingClientRect().top + scrollY - document.querySelector('.header-inner')!.getBoundingClientRect().height - 16, behavior: 'instant' }));
    const geometry = await player.evaluate(video => ({ video: video.getBoundingClientRect().toJSON(), frame: video.parentElement!.getBoundingClientRect().toJSON() }));
    expect(geometry.video.width).toBeCloseTo(geometry.frame.width, 0);
    expect(geometry.video.height).toBeCloseTo(geometry.frame.height, 0);
    expect(geometry.video.bottom).toBeLessThanOrEqual(height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await player.evaluate(video => (video as HTMLVideoElement).play());
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  expect(await player.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true);
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); });
  const brokenClip = '**/VID-20261003-WA0083.mp4';
  await page.route(brokenClip, route => route.abort());
  await page.getByRole('button', { name: 'Clip 02', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('This clip could not be loaded.');
  await page.unroute(brokenClip);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect.poll(() => player.evaluate(video => (video as HTMLVideoElement).readyState), { timeout: 15000 }).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Close Clip 02', exact: true }).click();
  await expect(page.locator('.project-video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clip 02', exact: true })).toBeFocused();
});

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

test('navigation pins immediately on scroll and returns to normal at the top', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.locator('.landing-header');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(header).not.toHaveClass(/is-pinned/);
    await page.evaluate(() => scrollTo({ top: 1, behavior: 'instant' }));
    await expect(header).toHaveClass(/is-pinned/);
    expect((await header.boundingBox())!.y).toBe(0);
    await page.locator('#services').evaluate(section => scrollTo({ top: section.getBoundingClientRect().top + scrollY + 100, behavior: 'instant' }));
    await expect(header).toHaveClass(/is-pinned/);
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

test('interiors copy sticks beneath navigation while designs remain accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  await page.goto('/');
  const copy = page.locator('.interiors-copy');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(copy).toHaveClass(/is-sticky/);
    const top = await page.locator('.header-inner').evaluate(el => el.getBoundingClientRect().height + (innerWidth > 760 ? 16 : 0));
    await copy.evaluate((el, top) => scrollTo({ top: el.getBoundingClientRect().top + scrollY - top + 300, behavior: 'instant' }), top);
    await expect.poll(() => copy.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(top, 0);
    const button = copy.getByRole('link', { name: 'Discuss an interior project', exact: true });
    expect((await button.boundingBox())!.y).toBeGreaterThan(top);
    await page.getByRole('button', { name: 'View Living room interior design concept', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Living room', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }
  for (const [width, height] of [[320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await expect(copy).not.toHaveClass(/is-sticky/);
    await expect(copy.getByRole('link', { name: 'Discuss an interior project', exact: true })).toBeVisible();
  }
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
  await expect(page.locator('[aria-label="Filter designs"]')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(cards).toHaveCount(33);
  expect(await cards.first().evaluate(card => getComputedStyle(card).position)).toBe('relative');
});

test('gallery shows all designs with three varied-height sticky center images', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem('wills-group:cookie-consent', 'accepted'));
  await page.goto('/');
  await expect(page.locator('.project-tile')).toHaveCount(33);
  const center = page.locator('.sticky-scroll-center');
  await expect(center.locator('.project-tile')).toHaveCount(3);
  await expect(page.locator('[aria-label="Filter designs"]')).toHaveCount(0);
  await expect(page.locator('.project-caption')).toHaveCount(0);
  for (const image of await page.locator('.project-image img').all()) {
    expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('cover');
  }
  expect(await page.locator('.sticky-gallery-intro').evaluate(el => getComputedStyle(el).textAlign)).toBe('center');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const frames = await page.locator('.project-image').evaluateAll(images => images.filter(el => !el.closest('.sticky-scroll-center')).map(el => el.getBoundingClientRect().toJSON()));
    for (const frame of frames) expect(frame.height / frame.width).toBeCloseTo(1.25, 2);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const heights = await center.locator('.project-image').evaluateAll(images => images.map(el => el.getBoundingClientRect().height));
  expect(heights[0]).toBeGreaterThan(heights[1]);
  expect(heights[1]).toBeGreaterThan(heights[2]);
  await expect(center).toHaveClass(/is-sticky/);
  await page.locator('.project-grid').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 96 + 400, behavior: 'instant' }));
  await expect.poll(() => center.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(96, 0);
  await page.evaluate(() => scrollBy({ top: 600, behavior: 'instant' }));
  await expect.poll(() => center.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(96, 0);
  expect((await center.boundingBox())!.y + (await center.boundingBox())!.height).toBeLessThanOrEqual(900);
  const centerTitles = ['Sculpted entrance door', 'Geometric metal door', 'Gold-pattern entrance gate'];
  for (const [index, card] of (await center.locator('.project-tile').all()).entries()) {
    await card.click();
    await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(centerTitles[index]);
    await page.keyboard.press('Escape');
    await expect(card).toBeFocused();
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(center).toHaveClass(/is-sticky/);
  await page.locator('.project-grid').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 96 + 500, behavior: 'instant' }));
  await expect.poll(() => center.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(96, 0);
  await expect(center.locator('.project-tile')).toHaveCount(3);
  await expect(page.locator('.project-tile')).toHaveCount(33);
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await center.evaluate(el => getComputedStyle(el).position)).toBe('static');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(844);
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
    const badCorners = await page.locator('button, input, select, textarea, [class*="rounded"], .header-quote, .wills-button, .project-image, .floating-whatsapp').evaluateAll(elements => elements.filter(el => !el.closest('#hero') && getComputedStyle(el).borderTopLeftRadius !== '12px').map(el => el.className));
    expect(badCorners).toEqual([]);
    expect(await page.locator('.prisma-primary-action').evaluate(el => getComputedStyle(el).borderTopLeftRadius)).toBe('999px');
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
  await expect(page.getByRole('heading', { level: 1, name: 'Wills Group of Company' })).toBeVisible();
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
      const details = element.querySelector('.prisma-hero-details')!.getBoundingClientRect();
      return { bounds, heading, details, alignment: getComputedStyle(element).textAlign };
    });
    expect(layout.alignment).toBe('left');
    if (width >= 1024) expect(layout.heading.right).toBeLessThanOrEqual(layout.details.left);
    else expect(layout.heading.bottom).toBeLessThanOrEqual(layout.details.top);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('body')).not.toContainText('Thewworks');
  await expect(page.locator('[aria-label="Filter designs"]')).toHaveCount(0);
  await expect(page.locator('.project-tile')).toHaveCount(33);
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
