import { DocRole } from './components/manifest-reducer';

function getValue(selector: string, attrName: string) {
  const el = document.querySelector(selector);
  return el !== null ? el.getAttribute(attrName) : null;
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

  const number = value !== null ? parseInt(value, 10) : 0;
  return number >= 0 ? number : null;
}

const docInfo = {
  languageCode: getValue('html', 'lang'),
  role: getRole(),
  order: getOrder(),
  links: {
    index: getValue('link[rel="index"]', 'href'),
    license: getValue('link[rel="license"]', 'href'),
    publication: getValue('link[rel="publication"]', 'href'),
    manifest: getValue('link[rel="publication"]', 'href'),
    prev: getValue('link[rel="prev"]', 'href'),
    next: getValue('link[rel="next"]', 'href'),
  },
};

export default docInfo;