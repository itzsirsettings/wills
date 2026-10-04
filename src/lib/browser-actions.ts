interface MailtoOptions {
  subject?: string;
  body?: string;
}

export function createMailtoHref(to: string, options: MailtoOptions = {}) {
  const queryParts: string[] = [];

  if (options.subject) {
    queryParts.push(`subject=${encodeURIComponent(options.subject)}`);
  }

  if (options.body) {
    queryParts.push(`body=${encodeURIComponent(options.body)}`);
  }

  return `mailto:${to}${queryParts.length > 0 ? `?${queryParts.join('&')}` : ''}`;
}

export function openMailto(to: string, options: MailtoOptions = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(createMailtoHref(to, options));
}

export function splitPhoneNumbers(phoneValue: string) {
  return phoneValue
    .split(',')
    .map((phoneNumber) => phoneNumber.trim())
    .filter(Boolean);
}

export function createTelHref(phoneNumber: string) {
  return `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
}
