import { brand } from './brand';
const WHATSAPP_E164_NUMBER = brand.whatsapp;

export const WHATSAPP_DISPLAY_NUMBER = '+234 705 745 0799';

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hello Wills Group of Company, I would like to discuss a doors, gates, metalwork or interiors project.';

export function buildWhatsAppUrl(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_E164_NUMBER}?text=${encodeURIComponent(message)}`;
}
