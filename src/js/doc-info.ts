import { DocRole } from '@next-book/publisher/shared/manifest';
import { Direction } from './components/navigation';
import { TagClass, FootnotesClass, CropClass, PaginationClass, MetaDocRoleElement, MetaOrderElement, MetaIdentifierElement, ResearchMetaElement, LangElement, BodyElement, GaugeAttr, LinkElement, LinkRel, ResearchMetaName, MetaName, getIdeaId } from '@next-book/publisher/shared/dom';

export let lastScrollStep: [Direction, number] | null = null;

export function setLastScrollStep(step: [Direction, number] | null) {
  lastScrollStep = step;
}

function getGaugeData(attrName: GaugeAttr) {
  const el = document.querySelector<BodyElement>('body');
  const value = el?.getAttribute(attrName);
  return value ? parseInt(value, 10) : null;
}

function getRole() {
  const el = document.querySelector<MetaDocRoleElement>(`meta[name="${MetaName.DocRole}"]`);
  const value = el?.getAttribute('content');
  if (value === DocRole.Chapter) return DocRole.Chapter;
  if (value === DocRole.Break) return DocRole.Break;
  if (value === DocRole.Cover) return DocRole.Cover;
  if (value === DocRole.Colophon) return DocRole.Colophon;
  else return DocRole.Other;
}

function getOrder() {
  const el = document.querySelector<MetaOrderElement>(`meta[name="${MetaName.Order}"]`);
  const value = el?.getAttribute('content');
  return value ? parseInt(value, 10) : null;
}

function getLinkRel(rel: LinkRel) {
  const el = document.querySelector<LinkElement>(`link[rel="${rel}"]`);
  const value = el?.getAttribute('href');
  return value || null;
}

function getResearchParam(name: ResearchMetaName) {
  const el = document.querySelector<ResearchMetaElement>(`meta[name="${name}"]`);
  const value = el?.getAttribute('content');
  return value || null;
}

export const languageCode = document.querySelector<LangElement>('html')?.getAttribute('lang') || null;

export const role = getRole();

export const identifier = document.querySelector<MetaIdentifierElement>(`meta[name="${MetaName.Identifier}"]`)?.getAttribute('content') || null;;

export const order = getOrder();

export const totals = {
  words: getGaugeData(GaugeAttr.Words),
  chars: getGaugeData(GaugeAttr.Chars),
};

export const links = {
  index: getLinkRel(LinkRel.Index),
  self: getLinkRel(LinkRel.Self) || 'null.html',
  manifest: getLinkRel(LinkRel.Publication),
  prev: getLinkRel(LinkRel.Prev),
  next: getLinkRel(LinkRel.Next),
  colophon: getLinkRel(LinkRel.Colophon),
  license: getLinkRel(LinkRel.License),
};

function getChunks(): Element[] {
  return [...document.querySelectorAll(`main .${TagClass.Chunk}`)].filter(
    chunk => chunk.closest(`.${FootnotesClass.Wrapper}`) === null
  );
}

export const domFns: {
  getScrollStep: { (): number | null };
  setCroppedDisplay: { (): void };
} = {
  getScrollStep: () => null,
  setCroppedDisplay: () => null,
};

export function setDomFn(name: 'getScrollStep' | 'setCroppedDisplay', fn: any): void {
  domFns[name] = fn;
}

export type IVisibleChunks = { top: Element | null; bottom: Element | null; all: Element[] };

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
  [...document.querySelectorAll(`.${CropClass.Visible}`)].forEach(c => {
    c.classList.remove(CropClass.Visible, PaginationClass.Forward, PaginationClass.Back);
    (c as HTMLElement).style.clipPath = 'none';
  });
}

export function scrollToIdea(number: number | null) {
  if (number !== null) {
    const el = document.getElementById(getIdeaId(number));
    if (el) window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top);
  }
}

export function getResearchParams(): { text: string; orgs: string; ga: string } | null {
  const text = getResearchParam(ResearchMetaName.Text);
  const orgs = getResearchParam(ResearchMetaName.Orgs);
  const ga = getResearchParam(ResearchMetaName.GA);
  if (!text || !orgs || !ga) return null;
  return {
    text,
    orgs,
    ga,
  };
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
