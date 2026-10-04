const SITE_ORIGIN = (process.env.PUBLIC_SITE_URL?.trim() || 'http://localhost:5173').replace(/\/$/, '');
const SITE_HOST = new URL(SITE_ORIGIN).hostname;
const PUBLIC_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const PRIVATE_ROBOTS = 'noindex, nofollow';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/media/wills/IMG-20261003-WA0067.webp`;
const DEFAULT_IMAGE_ALT = 'Wills Group of Company ornamental entrance gate';

interface RouteSeo {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: '/' | '/store' | string;
  ogType: 'website';
  image: string;
  imageAlt: string;
  robots: string;
}

const homeSeo = {
  title: 'Wills Group of Company | Doors, Gates, Metalwork & Interiors',
  description: 'Doors, gates, custom metalwork and interiors. Explore Wills Group of Company designs and prepare your project enquiry.',
  keywords: 'Wills Group of Company, doors, gates, metalwork, interiors, fabrication',
  canonicalPath: '/', ogType: 'website', image: DEFAULT_IMAGE, imageAlt: DEFAULT_IMAGE_ALT,
} satisfies Omit<RouteSeo, 'robots'>;
const storeSeo = {
  ...homeSeo, title: 'Wills Group of Company | Project Quote Desk', canonicalPath: '/store',
} satisfies Omit<RouteSeo, 'robots'>;

const policyMetadata: Record<string, { title: string; description: string }> = {
  '/privacy-policy': { title: 'Privacy Policy', description: 'How Wills handles website visits, project briefs and information you choose to share.' },
  '/terms-of-use': { title: 'Terms of Use', description: 'Information about using the Wills website and preparing a project enquiry.' },
  '/cookie-policy': { title: 'Cookie Policy', description: 'The browser storage used by this website and how to revisit the privacy notice.' },
  '/security': { title: 'Security & Privacy Requests', description: 'How to contact Wills about personal information or a website security concern.' },
};

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function parseRequestUrl(originalUrl: string) {
  return new URL(originalUrl || '/', SITE_ORIGIN);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLdForRoute(seo: RouteSeo) {
  const canonicalUrl = `${SITE_ORIGIN}${seo.canonicalPath}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${SITE_ORIGIN}/#organization`, name: 'Wills Group of Company', url: `${SITE_ORIGIN}/`, logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/media/wills/wills-group-logo.png` }, contactPoint: { '@type': 'ContactPoint', telephone: '+2347057450799', contactType: 'project enquiries' } },
      { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, name: 'Wills Group of Company', url: `${SITE_ORIGIN}/`, inLanguage: 'en' },
      { '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'], '@id': `${SITE_ORIGIN}/#business`, name: 'Wills Group of Company', description: seo.description, url: `${SITE_ORIGIN}/` },
      { '@type': 'WebPage', '@id': `${canonicalUrl}#webpage`, name: seo.title, description: seo.description, url: canonicalUrl, isPartOf: { '@id': `${SITE_ORIGIN}/#website` }, primaryImageOfPage: { '@type': 'ImageObject', url: seo.image } },
    ],
  };
}

function replaceOrInsertHeadTag(html: string, pattern: RegExp, replacement: string) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace(/<\/head>/i, `    ${replacement}\n  </head>`);
}

function removeHeadTag(html: string, pattern: RegExp) {
  return html.replace(pattern, '');
}

export function shouldNoIndexRequest(originalUrl: string) {
  const url = parseRequestUrl(originalUrl);
  const pathname = normalizePathname(url.pathname);

  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.svg' ||
    pathname === '/browserconfig.xml' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/media/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/assets/') ||
    pathname.endsWith('.mp4')
  ) {
    return false;
  }

  return (
    pathname.startsWith('/api') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/checkout/success' ||
    pathname === '/checkout/cancel' ||
    url.searchParams.has('reference') ||
    url.searchParams.has('trxref') ||
    (pathname !== '/' && pathname !== '/store' && !Object.hasOwn(policyMetadata, pathname))
  );
}

export function getRouteSeo(originalUrl: string): RouteSeo {
  const url = parseRequestUrl(originalUrl);
  const pathname = normalizePathname(url.pathname);
  const policy = Object.hasOwn(policyMetadata, pathname) ? policyMetadata[pathname] : undefined;
  const routeSeo = policy
    ? { ...homeSeo, title: `${policy.title} | Wills Group of Company`, description: policy.description, canonicalPath: pathname }
    : pathname === '/store' ? storeSeo : homeSeo;

  return {
    ...routeSeo,
    robots: !process.env.PUBLIC_SITE_URL || shouldNoIndexRequest(originalUrl) ? PRIVATE_ROBOTS : PUBLIC_ROBOTS,
  };
}

export function getApexRedirectUrl(hostHeader: string | undefined, originalUrl: string) {
  const host = (hostHeader || '').split(':')[0].toLowerCase();

  if (!process.env.PUBLIC_SITE_URL || host !== `www.${SITE_HOST}`) {
    return '';
  }

  return `${SITE_ORIGIN}${originalUrl || '/'}`;
}

export function injectRouteSeo(html: string, originalUrl: string) {
  const seo = getRouteSeo(originalUrl);
  const canonicalUrl = `${SITE_ORIGIN}${seo.canonicalPath === '/' ? '/' : seo.canonicalPath}`;
  const jsonLd = JSON.stringify(jsonLdForRoute(seo), null, 2).replace(/</g, '\\u003c');

  let output = html;
  output = replaceOrInsertHeadTag(output, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']keywords["'][^>]*>/i,
    `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${seo.ogType}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${seo.image}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+property=["']og:image:alt["'][^>]*>/i,
    `<meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    '<meta name="twitter:card" content="summary_large_image" />',
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name="twitter:image" content="${seo.image}" />`,
  );
  output = replaceOrInsertHeadTag(
    output,
    /<meta\s+name=["']twitter:image:alt["'][^>]*>/i,
    `<meta name="twitter:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
  );
  output = removeHeadTag(output, /\s*<meta\s+name=["']twitter:site["'][^>]*>\s*/i);
  output = replaceOrInsertHeadTag(
    output,
    /<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">\n${jsonLd}\n    </script>`,
  );

  return output;
}
