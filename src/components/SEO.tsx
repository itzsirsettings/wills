import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '../config';
import { brand, mediaPath } from '../lib/brand';

const SITE_ORIGIN = brand.siteUrl || window.location.origin;
const SITE_NAME = brand.name;
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}${mediaPath("0067")}`;
const DEFAULT_OG_IMAGE_ALT = 'Wills Group of Company ornamental entrance gate';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  keywords?: string;
  noIndex?: boolean;
}

const SEO = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  ogType = 'website',
  keywords,
  noIndex = false,
}: SEOProps) => {
  const { pathname } = useLocation();
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const currentUrl = `${SITE_ORIGIN}${normalizedPath}`;

  useEffect(() => {
    const finalTitle = title ? `${title} | ${brand.name}` : siteConfig.title;
    document.title = finalTitle;

    const finalDescription = description || siteConfig.description;
    const finalCanonical = canonical || currentUrl;
    const finalOgTitle = ogTitle || finalTitle;
    const finalOgDescription = ogDescription || finalDescription;
    const robotsContent = noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    updateMetaTag('name', 'description', finalDescription);
    updateMetaTag('name', 'robots', robotsContent);
    updateMetaTag('property', 'og:description', finalOgDescription);
    updateMetaTag('name', 'twitter:description', finalOgDescription);

    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute('href', finalCanonical);
    } else {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      linkCanonical.setAttribute('href', finalCanonical);
      document.head.appendChild(linkCanonical);
    }

    updateMetaTag('property', 'og:title', finalOgTitle);
    updateMetaTag('property', 'og:url', finalCanonical);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', SITE_NAME);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:image:alt', ogImageAlt);

    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', finalOgTitle);
    removeMetaTag('name', 'twitter:site');
    updateMetaTag('name', 'twitter:image', ogImage);
    updateMetaTag('name', 'twitter:image:alt', ogImageAlt);
  }, [
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogImageAlt,
    ogType,
    keywords,
    noIndex,
    currentUrl,
  ]);

  return null;
};

function updateMetaTag(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}

function removeMetaTag(attr: 'name' | 'property', key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

export default SEO;
