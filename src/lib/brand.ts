const clean = (value: string | undefined) => value?.trim() || '';

export const brand = {
  name: 'Wills Group of Company',
  fullName: 'Wills Group of Company',
  description: 'Doors, gates, custom metalwork and interiors. Explore Wills Group of Company designs and prepare a quote for your space.',
  email: clean(import.meta.env.VITE_BUSINESS_EMAIL),
  phone: clean(import.meta.env.VITE_BUSINESS_PHONE),
  whatsapp: (clean(import.meta.env.VITE_BUSINESS_WHATSAPP) || '2347057450799').replace(/\D/g, ''),
  address: clean(import.meta.env.VITE_BUSINESS_ADDRESS),
  siteUrl: (clean(import.meta.env.VITE_PUBLIC_SITE_URL) || 'https://wills-production-beec.up.railway.app').replace(/\/$/, ''),
  logo: '/media/wills/wills-group-logo.png',
};

export const mediaPath = (number: string, small = false) =>
  `/media/wills/IMG-20261003-WA${number}${small ? '-640' : ''}.webp`;

const videoOrigin = clean(import.meta.env.VITE_VIDEO_ORIGIN).replace(/\/$/, '');
export const videoPath = (number: string) => `${videoOrigin}/media/wills/VID-20261003-WA${number}.mp4`;
