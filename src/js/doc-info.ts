import { DocRole } from './components/manifest/reducer';
import { Direction } from './components/navigation';

export let lastScrollStep: [Direction, number] | null = null;

export function setLastScrollStep(step: [Direction, number] | null) {
  lastScrollStep = step;
}

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

export const languageCode = getValue('html', 'lang');

export const role = getRole();

export const identifier = getValue('meta[name="identifier"]', 'content');

export const order = getOrder();

export const totals = {
  words: getNumericValue('body', 'data-nb-words'),
  chars: getNumericValue('body', 'data-nb-chars'),
};

export const links = {
  index: getValue('link[rel="index"]', 'href'),
  self: getValue('link[rel="self"]', 'href') || 'null.html',
  manifest: getValue('link[rel="publication"]', 'href'),
  prev: getValue('link[rel="prev"]', 'href'),
  next: getValue('link[rel="next"]', 'href'),
  colophon: getValue('link[rel="colophon"]', 'href'),
  license: getValue('link[rel="license"]', 'href'),
};

function getChunks(): Element[] {
  return [...document.querySelectorAll('main .chunk')].filter(
    chunk => chunk.closest('.footnotes') === null
  );
}

export const domFns: {
  getScrollStep: { (): number | null };
  clipPage: { (): void };
  setPaginatedMode: { (): void };
} = {
  getScrollStep: () => null,
  clipPage: () => null,
  setPaginatedMode: () => null,
};

export function setDomFn(name: 'clipPage' | 'getScrollStep' | 'setPaginatedMode', fn: any): void {
  domFns[name] = fn;
}

type IVisibleChunks = { top: Element | null; bottom: Element | null; all: Element[] };

export const elements: {
  chunks: Element[];
  visibleChunks: IVisibleChunks;
} = {
  chunks: getChunks(),
  visibleChunks: { top: null, bottom: null, all: [] },
};

export function setVisibleChunks(chunks: IVisibleChunks) {
  elements.visibleChunks = chunks;
}

export function clearVisibleChunks() {
  [...document.querySelectorAll('.visible')].forEach(c => {
    c.classList.remove('visible', 'step-forward', 'step-back');
    (c as HTMLElement).style.clipPath = 'none';
  });
}

export function scrollToIdea(number: number | null) {
  if (number !== null) {
    const el = document.getElementById(`idea${number}`);
    if (el) window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top);
  }
}

export default {
  languageCode,
  role,
  identifier,
  order,
  totals,
  links,
  elements,
  domFns,
};
