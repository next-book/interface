import React from 'react';

import {
  elements,
  IVisibleChunks,
  setVisibleChunks,
  clearVisibleChunks,
  showAllChunks,
  setDomFn,
  role,
} from '../doc-info';
import { trackScroll } from './research/tracker';
import { DocRole } from '@next-book/publisher';

enum Side {
  Bottom = 'bottom',
  Top = 'top',
}

enum Display {
  Cropped,
  ShowAll,
}

export type Sides = {
  [Side.Top]: number;
  [Side.Bottom]: number;
};

enum ReadingMode {
  Scrolling,
  Paginated,
}

interface IProps {}

export interface IState {
  windowHeight: number | null;
  zonePadding: Sides;
  readingZone: Sides;
}

export class Pagination extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      windowHeight: null,
      zonePadding: { [Side.Top]: 48, [Side.Bottom]: 48 },
      readingZone: { [Side.Top]: 0, [Side.Bottom]: 0 },
    };
  }

  displayMode: Display = Display.Cropped;
  readingMode: ReadingMode = ReadingMode.Paginated;
  realReadingZone: Sides | null = null;

  setSizes = () => {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    this.setState(
      {
        ...this.state,
        windowHeight,
        readingZone: {
          [Side.Top]: this.state.zonePadding[Side.Top],
          [Side.Bottom]: windowHeight - this.state.zonePadding[Side.Bottom],
        },
      },
      this.cropDisplay
    );
  };

  cropDisplay = () => {
    if (role === DocRole.Break || role === DocRole.Cover) {
      elements.chunks.forEach(c => c.classList.add('visible'));
      return;
    }

    if (this.state.windowHeight === null) return;

    clearVisibleChunks();

    // clip reading zone
    if (window.visualViewport.scale === 1)
      this.realReadingZone = clipReadingZone(
        this.state.readingZone,
        this.readingMode,
        findVisibleChunks(this.state.readingZone, this.readingMode)
      );
    else showAllChunks();
  };

  setCroppedDisplay = () => {
    this.displayMode = Display.Cropped;
  };

  setAllLayout = () => {
    this.displayMode = Display.ShowAll;
  };

  setPaginatedMode = () => {
    this.readingMode = ReadingMode.Paginated;
    document.body.classList.add('nb-paginated');
  };

  setScrollingMode = () => {
    this.readingMode = ReadingMode.Scrolling;
    document.body.classList.remove('nb-paginated');
  };

  refreshLayout = () => {
    switch (this.displayMode) {
      case Display.Cropped:
        document.body.classList.add('nb-cropped');
        this.cropDisplay();
        break;
      case Display.ShowAll:
        document.body.classList.remove('nb-cropped');
        clearVisibleChunks();
        break;
    }
  };

  getScrollHandler = (() => {
    let timer: number | null = null;
    let lastRefresh: number = new Date().getTime();
    let eventCount: number = 0;

    return (): void => {
      if (timer !== null) clearTimeout(timer);

      eventCount = eventCount + 1;

      if (eventCount > 2) this.setAllLayout();

      if (eventCount > 5) {
        this.setScrollingMode();
        trackScroll();
      }

      if (new Date().getTime() - lastRefresh > 100) {
        lastRefresh = new Date().getTime();
        this.refreshLayout();
      }

      timer = window.setTimeout(() => {
        if (eventCount > 1 || this.displayMode === Display.ShowAll) {
          this.setCroppedDisplay();
          this.refreshLayout();
        }

        eventCount = 0;
      }, 150);
    };
  })();

  getScrollStep = (): number | null => {
    if (this.state.windowHeight === null) return null;

    return (
      (this.realReadingZone === null ? 80 : this.realReadingZone[Side.Bottom]) -
      this.state.zonePadding[Side.Top] -
      5
    );
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler, { passive: true });
    setDomFn('getScrollStep', this.getScrollStep);
    setDomFn('setCroppedDisplay', this.setCroppedDisplay);
    setDomFn('setPaginatedMode', this.setPaginatedMode);

    window.addEventListener('resize', this.setSizes);

    window.requestAnimationFrame(() => {
      this.setSizes();
      this.setCroppedDisplay();
      this.setPaginatedMode();
      this.refreshLayout();
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler);
    window.removeEventListener('resize', this.setSizes);
  }

  render() {
    return null;
  }
}

function clipReadingZone(
  readingZone: Sides,
  readingMode: ReadingMode,
  visibleChunks: IVisibleChunks
): { top: number; bottom: number } {
  const { visibleChunks: chunks, cutoffs } = recursiveClipAndCheck(
    readingZone,
    readingMode,
    visibleChunks
  );

  if (chunks.top !== null && chunks.top === chunks.bottom)
    clipChunk(chunks.top, cutoffs.top.clip, cutoffs.bottom.clip);
  else {
    clipChunk(chunks.top, cutoffs.top.clip, 0);
    clipChunk(chunks.bottom, 0, cutoffs.bottom.clip);
  }

  window.requestAnimationFrame(() => {
    if (chunks.all !== null) chunks.all.forEach(c => c.classList.add('visible'));
  });

  setVisibleChunks(chunks);

  return {
    top: cutoffs.top.zone,
    bottom: cutoffs.bottom.zone,
  };
}

function recursiveClipAndCheck(
  readingZone: Sides,
  readingMode: ReadingMode,
  visibleChunks: IVisibleChunks
): {
  visibleChunks: IVisibleChunks;
  cutoffs: {
    top: { zone: number; clip: number };
    bottom: { zone: number; clip: number };
  };
} {
  const { top, bottom, all } = visibleChunks;

  const cutoffs = calcCutoffs(top, bottom, readingZone, readingMode);

  if (top === null || bottom === null || all.length === 1) return { visibleChunks, cutoffs };

  if (readingMode === ReadingMode.Paginated) {
    // remove first chunk if it has no visible lines
    if (isCompletelyClipped(top, cutoffs.top.clip)) {
      all.shift();

      return recursiveClipAndCheck(readingZone, readingMode, {
        top: all[0],
        bottom: all[all.length - 1],
        all,
      });
    }

    //  remove last chunk if it has no visible lines, is a heading or contains clipped images
    if (
      isCompletelyClipped(bottom, cutoffs.bottom.clip) ||
      isHeading(bottom) ||
      hasClippedImages(bottom, cutoffs.bottom.zone)
    ) {
      all.pop();

      return recursiveClipAndCheck(readingZone, readingMode, {
        top: all[0],
        bottom: all[all.length - 1],
        all,
      });
    }
  }

  return { visibleChunks, cutoffs };
}

function getContentVerticals(el: Element) {
  const rect = el.getBoundingClientRect();
  const paddingTop = getComputedStyleNumber(el, 'paddingTop');
  const paddingBottom = getComputedStyleNumber(el, 'paddingBottom');

  return {
    top: rect.top + paddingTop,
    bottom: rect.bottom - paddingBottom,
    height: rect.height - paddingTop - paddingBottom,
  };
}

function isCompletelyClipped(chunk: Element, clip: number) {
  // half line height added to account for few px differences
  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');
  return getContentVerticals(chunk).height <= clip + lineHeight / 2;
}

function calcCutoffs(
  topChunk: Element | null,
  bottomChunk: Element | null,
  readingZone: Sides,
  readingMode: ReadingMode
): {
  top: { zone: number; clip: number };
  bottom: { zone: number; clip: number };
} {
  return {
    top: calcTopCutoff(topChunk, readingZone, readingMode),
    bottom: calcBottomCutoff(bottomChunk, readingZone, readingMode),
  };
}

function clipChunk(chunk: Element | null, top: number, bottom: number) {
  if (chunk === null) return;

  (chunk as HTMLElement).style.clipPath = `inset(${top === 0 ? '-999' : top}px -999px ${
    bottom === 0 ? '-999' : bottom
  }px -999px)`;
}

function calcNestedTopCutoff(
  el: Element,
  readingZone: Sides,
  readingMode: ReadingMode
): { zone: number; clip: number } | null {
  return [...el.querySelectorAll('p, li, dd, dt')]
    .filter(el => window.getComputedStyle(el).display === 'block')
    .filter((el, index, els) => isElementOnTopEdge(el, els[index - 1], readingZone[Side.Top]))
    .map(el => calcTopCutoff(el, readingZone, readingMode, true))
    .reduce((acc: { zone: number; clip: number } | null, cutoff) => {
      if (cutoff.zone === null) return acc;
      if (acc === null) return cutoff;

      if (cutoff.clip > acc.clip) acc = { ...cutoff };
      return acc;
    }, null);
}

function calcTopCutoff(
  chunk: Element | null,
  readingZone: Sides,
  readingMode: ReadingMode,
  skipBlockCheck: boolean = false
) {
  if (chunk === null || readingMode === ReadingMode.Scrolling) return { zone: 0, clip: 0 };
  const verticals = getContentVerticals(chunk);

  if (!skipBlockCheck) {
    const nestedCutoff = calcNestedTopCutoff(chunk, readingZone, readingMode);
    if (nestedCutoff !== null)
      return { zone: nestedCutoff.zone, clip: nestedCutoff.zone - verticals[Side.Top] };
  }

  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');

  let y = verticals[Side.Top];

  // adding half of lineHeight to account for Firefox behavior
  // (Chrome and Safari work OK without this)
  while (y + lineHeight / 2 < readingZone[Side.Top]) {
    y += lineHeight;
  }

  return { zone: y, clip: y - verticals[Side.Top] };
}

function hasOrphan(
  verticals: ReturnType<typeof getContentVerticals>,
  readingZone: Sides,
  lineHeight: number
) {
  if (verticals.bottom - verticals.top < lineHeight * 1.5) return false;

  const gap = verticals.bottom - readingZone[Side.Bottom];
  return gap > 0 && gap < 1.5 * lineHeight;
}

function isWidow(verticals: ReturnType<typeof getContentVerticals>, y: number, lineHeight: number) {
  if (verticals.bottom - verticals.top < lineHeight * 1.5) return false;

  const gap = y - verticals.top;
  return gap > 0 && gap < 1.5 * lineHeight;
}

function calcNestedBottomCutoff(
  el: Element,
  readingZone: Sides,
  readingMode: ReadingMode
): { zone: number; clip: number } | null {
  return [...el.querySelectorAll('p, li, dd, dt')]
    .filter(el => window.getComputedStyle(el).display === 'block')
    .filter((el, index, els) => isElementOnBottomEdge(el, els[index + 1], readingZone[Side.Bottom]))
    .map(el => calcBottomCutoff(el, readingZone, readingMode, true))
    .reduce((acc: { zone: number; clip: number } | null, cutoff) => {
      if (cutoff.zone === null) return acc;
      if (acc === null) return cutoff;

      if (cutoff.clip > acc.clip) acc = { ...cutoff };
      return acc;
    }, null);
}

function calcBottomCutoff(
  chunk: Element | null,
  readingZone: Sides,
  readingMode: ReadingMode,
  skipBlockCheck: boolean = false
): { zone: number; clip: number } {
  if (chunk === null) return { zone: window.innerHeight, clip: 0 };
  const verticals = getContentVerticals(chunk);

  if (!skipBlockCheck) {
    const nestedCutoff = calcNestedBottomCutoff(chunk, readingZone, readingMode);
    if (nestedCutoff !== null)
      return { zone: nestedCutoff.zone, clip: verticals[Side.Bottom] - nestedCutoff.zone };
  }

  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');
  let y = verticals[Side.Bottom];

  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  while (y > windowHeight - 10) y -= lineHeight;

  if (readingMode === ReadingMode.Paginated) {
    while (y > readingZone[Side.Bottom]) y -= lineHeight;
    if (hasOrphan(verticals, readingZone, lineHeight)) y -= lineHeight;
    if (isWidow(verticals, y, lineHeight)) y -= lineHeight;
  }

  return { zone: y, clip: verticals[Side.Bottom] - y };
}

function getComputedStyleNumber(
  el: Element,
  attr: 'lineHeight' | 'paddingTop' | 'paddingBottom'
): number {
  const style = window.getComputedStyle(el);
  return parseInt(style[attr], 10);
}

enum Gate {
  Unopened,
  Open,
  Closed,
}

function findVisibleChunks(readingZone: Sides, readingMode: ReadingMode): IVisibleChunks {
  const chunks = elements.chunks;
  const insideRange = [];
  let gate = Gate.Unopened;

  for (let i = 0; i <= chunks.length - 1; i++) {
    if (gate === Gate.Closed) break;

    const chunk = chunks[i];
    const prevChunk = chunks[i - 1];
    const nextChunk = chunks[i + 1];

    const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');

    if (
      (gate === Gate.Unopened &&
        isElementOnTopEdge(chunk, prevChunk, readingZone[Side.Top], lineHeight)) ||
      (insideRange.length === 0 &&
        isElementInside(chunk, readingZone[Side.Top], readingZone[Side.Bottom]))
    ) {
      gate = isElementOnBottomEdge(chunk, nextChunk, readingZone[Side.Bottom], lineHeight)
        ? Gate.Closed
        : Gate.Open;
      insideRange.push(chunk);
    } else if (
      gate === Gate.Open &&
      isElementOnBottomEdge(chunk, nextChunk, readingZone[Side.Bottom], lineHeight)
    ) {
      gate = Gate.Closed;
      insideRange.push(chunk);
    } else if (gate === Gate.Open) insideRange.push(chunk);
  }

  if (readingMode === ReadingMode.Paginated) {
    // remove last item if it’s a heading
    const lastItem = insideRange.pop();
    if (lastItem && (insideRange.length === 0 || !isHeading(lastItem))) insideRange.push(lastItem);
  }

  const top = insideRange[0] || null;
  const bottom = insideRange[insideRange.length - 1] || null;

  return { top, bottom, all: insideRange };
}

function hasClippedImages(chunk: Element, zoneBottom: number) {
  return [...chunk.querySelectorAll('img')].some(img => {
    const verticals = getContentVerticals(img);
    return verticals.top > zoneBottom || verticals.bottom > zoneBottom;
  });
}

function isHeading(chunk: Element) {
  return /^[hH][1-6]$/.test(chunk.tagName);
}

function isElementOnTopEdge(
  el: Element,
  prevEl: Element | undefined,
  top: number,
  lineHeight: number | null = null
) {
  if (lineHeight === null) lineHeight = getComputedStyleNumber(el, 'lineHeight');

  const range = {
    top: (prevEl && getContentVerticals(prevEl).bottom) || getContentVerticals(el).top,
    bottom: getContentVerticals(el).bottom,
  };

  return (range.top < top && range.bottom > top) || (range.top > top && range.top < top);
}

function isElementInside(el: Element, top: number, bottom: number) {
  const range = {
    top: getContentVerticals(el).top,
    bottom: getContentVerticals(el).bottom,
  };

  return (range.top > top && range.top < bottom) || (range.bottom > top && range.bottom < bottom);
}

function isElementOnBottomEdge(
  el: Element,
  nextEl: Element | undefined,
  bottom: number,
  lineHeight: number | null = null
) {
  if (lineHeight === null) lineHeight = getComputedStyleNumber(el, 'lineHeight');

  const range = {
    top: getContentVerticals(el).top + lineHeight,
    bottom: (nextEl && getContentVerticals(nextEl).top) || getContentVerticals(el).bottom,
  };

  return (
    (range.top < bottom && range.bottom > bottom) || (range.top > bottom && range.top < bottom)
  );
}
