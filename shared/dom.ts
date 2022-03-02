import { DocRole } from '@next-book/publisher/shared/manifest';

export enum StateClass {
  Ready = 'nb-ready',
}

export enum FootnotesClass {
  Wrapper = 'footnotes'
}

export enum CropClass {
  Wrapper = 'nb-cropped',
  Visible = 'visible'
}

export enum PaginationClass {
  Forward = 'step-forward',
  Back = 'step-back'
}

export enum ComponentClass {
  Annotations = 'nb-annotations',
  Navigation = 'nb-navigation',
  Position = 'nb-position',
  Manifest = 'nb-manifest',
  Peeks = 'nb-peeks',
  Trace = 'nb-trace',
  Offline = 'nb-offline',
  Controls = 'nb-controls',
  Config = 'nb-config',
  Onboarding = 'nb-onboarding',
  Research = 'nb-research',
}

export enum MetaName {
  Order = 'nb-order',
  DocRole = 'nb-role',
  Identifier = 'nb-identifier',
}

export enum ResearchMetaName {
  Text = 'nb-research',
  Orgs = 'nb-research-orgs',
  GA = 'nb-research-ga',
}

export enum GaugeAttr {
  /** Number of characters provided by gauge */
  Chars = 'data-nb-chars',
  /** Number of words provided by gauge */
  Words = 'data-nb-words',
}

export enum LinkRel {
  Index = 'index',
  Self = 'self',
  Prev = 'prev',
  Publication = 'publication',
  Next = 'next',
  Colophon = 'colophon',
  License = 'license'
}

type HTMLCustomMetaElement = Omit<HTMLMetaElement, 'name' | 'content'>;
type HTMLCustomLinkElement = Omit<HTMLLinkElement, 'rel' | 'href'>;
type HTMLCustomHtmlElement = Omit<HTMLHtmlElement, 'lang'>;

// renamed literals help with finding functions that operate with same values
export type OrderLike = string; 
export type Identifier = string;
export type LanguageCode = string;
type LinkUrl = string;

export interface MetaOrderElement extends HTMLCustomMetaElement {
  name: MetaName.Order;
  /** The OrderLike is a string that contains number to be parsed */
  content: OrderLike;
  getAttribute(qualifiedName: 'content'): OrderLike | null;
}

export interface MetaDocRoleElement extends HTMLCustomMetaElement {
  name: MetaName.DocRole;
  content: DocRole;
  getAttribute(qualifiedName: 'content'): DocRole | null;
}

export interface MetaIdentifierElement extends HTMLCustomMetaElement {
  name: MetaName.Identifier;
  content: Identifier;
  getAttribute(qualifiedName: 'content'): Identifier | null;
}

export interface ResearchMetaElement extends HTMLCustomMetaElement {
  name: ResearchMetaName;
  content: string;
  getAttribute(qualifiedName: 'content'): string | null;
}

export interface LinkElement extends HTMLCustomLinkElement {
  rel: LinkRel;
  href: LinkUrl;
  getAttribute(qualifiedName: 'href'): LinkUrl | null;
}

export interface LangElement extends HTMLCustomHtmlElement {
  lang: LanguageCode;
  getAttribute(qualifiedName: 'lang'): LanguageCode | null;
}

export interface BodyElement extends HTMLBodyElement {
  [GaugeAttr.Chars]: string;
  [GaugeAttr.Words]: string;
  getAttribute(qualifiedName: GaugeAttr): string | null;
}
