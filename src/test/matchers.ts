export function isInTheDocument(element: Element | null): boolean {
  return element !== null && element instanceof Element && element.parentNode !== null;
}

export function hasAttribute(element: Element | null, name: string, value?: string): boolean {
  if (!element?.hasAttribute) return false;
  const hasAttr = element.hasAttribute(name);
  if (value === undefined) return hasAttr;
  return element.getAttribute(name) === value;
}

export function hasClass(element: Element | null, ...classNames: string[]): boolean {
  if (!element?.classList) return false;
  return classNames.every((cn) => element.classList.contains(cn));
}

export function hasTextContent(element: Element | null, text: string | RegExp): boolean {
  if (!element) return false;
  const textContent = element.textContent?.trim() ?? '';
  if (text instanceof RegExp) {
    return text.test(textContent);
  }
  return textContent.includes(text);
}

export function isVisible(element: Element | null): boolean {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return !(style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0');
}

export function isDisabled(element: HTMLButtonElement | null): boolean {
  return element?.disabled === true;
}

export function isEnabled(element: HTMLButtonElement | null): boolean {
  return element?.disabled === false;
}