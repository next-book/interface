import { DocRole } from './components/manifest-reducer';

function getValue(selector: string, attrName: string) {
  const el = document.querySelector(selector);
  return el !== null ? el.getAttribute(attrName) : null;
}

function getNumericValue(selector: string, attrName: string) {
  const value = getValue(selector, attrName);

  return value !== null ? parseInt(value, 10) : null;
}

function getRole() {
  const value = getValue('meta[name="role"]', 'content');

  if (value === DocRole.Chapter) return DocRole.Chapter;
  if (value === DocRole.Index) return DocRole.Index;
  if (value === DocRole.Colophon) return DocRole.Colophon;
  else return DocRole.Other;
}

function getOrder() {
  const value = getValue('meta[name="order"]', 'content');

  return value !== null ? parseInt(value, 10) : null;
}

const docInfo = {
  languageCode: getValue('html', 'lang'),
  role: getRole(),
  order: getOrder(),
  totals: {
    words: getNumericValue('body', 'data-nb-words'),
    chars: getNumericValue('body', 'data-nb-chars'),
  },
  links: {
    index: getValue('link[rel="index"]', 'href'),
    self: getValue('link[rel="self"]', 'href') || 'null.html',
    manifest: getValue('link[rel="publication"]', 'href'),
    prev: getValue('link[rel="prev"]', 'href'),
    next: getValue('link[rel="next"]', 'href'),
    colophon: getValue('link[rel="colophon"]', 'href'),
    license: getValue('link[rel="license"]', 'href'),
  },
};

export default docInfo;
