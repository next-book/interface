import React from 'react';
//import { throttle } from 'lodash';

import {
  elements,
  IVisibleChunks,
  setVisibleChunks,
  clearVisibleChunks,
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
    this.realReadingZone = clipReadingZone(
      this.state.readingZone,
      findVisibleChunks(this.state.readingZone)
    );
  };

  setCroppedDisplay = () => {
    this.displayMode = Display.Cropped;
  };

  setAllLayout = () => {
    this.displayMode = Display.ShowAll;
  };

  setPaginatedMode = () => {
    document.body.classList.add('nb-paginated');
  };

  setScrollingMode = () => {
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
  visibleChunks: IVisibleChunks
): { top: number; bottom: number } {
  const { visibleChunks: chunks, cutoffs } = recursiveClipAndCheck(readingZone, visibleChunks);

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
  visibleChunks: IVisibleChunks
): {
  visibleChunks: IVisibleChunks;
  cutoffs: {
    top: { zone: number; clip: number };
    bottom: { zone: number; clip: number };
  };
} {
  const { top, bottom, all } = visibleChunks;

  const cutoffs = calcCutoffs(top, bottom, readingZone);

  if (top === null || bottom === null || all.length === 1) return { visibleChunks, cutoffs };

  // remove first chunk if it has no visible lines
  if (isCompletelyClipped(top, cutoffs.top.clip)) {
    all.shift();

    return recursiveClipAndCheck(readingZone, {
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

    return recursiveClipAndCheck(readingZone, {
      top: all[0],
      bottom: all[all.length - 1],
      all,
    });
  }

  return { visibleChunks, cutoffs };
}

function isCompletelyClipped(chunk: Element, clip: number) {
  // half line height added to account for few px differences
  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');
  return chunk.getBoundingClientRect().height <= clip + lineHeight / 2;
}

function calcCutoffs(
  topChunk: Element | null,
  bottomChunk: Element | null,
  readingZone: Sides
): {
  top: { zone: number; clip: number };
  bottom: { zone: number; clip: number };
} {
  return {
    top: calcTopCutoff(topChunk, readingZone),
    bottom: calcBottomCutoff(bottomChunk, readingZone),
  };
}

function clipChunk(chunk: Element | null, top: number, bottom: number) {
  if (chunk === null) return;

  (chunk as HTMLElement).style.clipPath = `inset(${top === 0 ? '-999' : top}px -999px ${
    bottom === 0 ? '-999' : bottom
  }px -999px)`;
}

function calcTopCutoff(chunk: Element | null, readingZone: Sides) {
  if (chunk === null) return { zone: 0, clip: 0 };

  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');

  // todo check clientRect and padding calculations and box-sizing combinations
  const rect = chunk.getBoundingClientRect();

  let y = rect[Side.Top] + getComputedStyleNumber(chunk, 'paddingTop');

  // adding half of lineHeight to account for Firefox behavior
  // (Chrome and Safari work OK without this)
  while (y + lineHeight / 2 < readingZone[Side.Top]) {
    y += lineHeight;
  }

  return { zone: y, clip: y - rect[Side.Top] };
}

function hasOrphan(chunkRect: DOMRect, readingZone: Sides, lineHeight: number) {
  if (chunkRect.bottom - chunkRect.top < lineHeight * 1.5) return false;

  const gap = chunkRect.bottom - readingZone[Side.Bottom];
  return gap > 0 && gap < 1.5 * lineHeight;
}

function isWidow(chunkRect: DOMRect, y: number, lineHeight: number) {
  if (chunkRect.bottom - chunkRect.top < lineHeight * 1.5) return false;

  const gap = y - chunkRect.top;
  return gap > 0 && gap < 1.5 * lineHeight;
}

function calcBottomCutoff(chunk: Element | null, readingZone: Sides) {
  if (chunk === null) return { zone: window.innerHeight, clip: 0 };

  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');
  const rect = chunk.getBoundingClientRect();
  let y = rect[Side.Bottom];

  while (y > readingZone[Side.Bottom]) y -= lineHeight;
  if (hasOrphan(rect, readingZone, lineHeight)) y -= lineHeight;
  if (isWidow(rect, y, lineHeight)) y -= lineHeight;

  return { zone: y, clip: rect[Side.Bottom] - y };
}

function getComputedStyleNumber(el: Element, attr: 'lineHeight' | 'paddingTop'): number {
  const style = window.getComputedStyle(el);
  return parseInt(style[attr], 10);
}

enum Gate {
  Unopened,
  Open,
  Closed,
}

function findVisibleChunks(readingZone: Sides): IVisibleChunks {
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
        isChunkOnTopEdge(chunk, prevChunk, lineHeight, readingZone[Side.Top])) ||
      (insideRange.length === 0 &&
        isChunkInside(chunk, readingZone[Side.Top], readingZone[Side.Bottom]))
    ) {
      gate = isChunkOnBottomEdge(chunk, nextChunk, lineHeight, readingZone[Side.Bottom])
        ? Gate.Closed
        : Gate.Open;
      insideRange.push(chunk);
    } else if (
      gate === Gate.Open &&
      isChunkOnBottomEdge(chunk, nextChunk, lineHeight, readingZone[Side.Bottom])
    ) {
      gate = Gate.Closed;
      insideRange.push(chunk);
    } else if (gate === Gate.Open) insideRange.push(chunk);
  }

  // remove last item if it’s a heading
  const lastItem = insideRange.pop();
  if (lastItem && (insideRange.length === 0 || !isHeading(lastItem))) insideRange.push(lastItem);

  const top = insideRange[0] || null;
  const bottom = insideRange[insideRange.length - 1] || null;

  return { top, bottom, all: insideRange };
}

function hasClippedImages(chunk: Element, zoneBottom: number) {
  return [...chunk.querySelectorAll('img')].some(img => {
    const rect = img.getBoundingClientRect();
    return rect.top > zoneBottom || rect.bottom > zoneBottom;
  });
}

function isHeading(chunk: Element) {
  return /^[hH][1-6]$/.test(chunk.tagName);
}

function isChunkOnTopEdge(chunk: Element, prevChunk: Element, lineHeight: number, top: number) {
  const range = {
    top: prevChunk?.getBoundingClientRect().bottom || chunk.getBoundingClientRect().top,
    bottom: chunk.getBoundingClientRect().bottom,
  };

  return (range.top < top && range.bottom > top) || (range.top > top && range.top < top);
}

function isChunkInside(chunk: Element, top: number, bottom: number) {
  const range = {
    top: chunk.getBoundingClientRect().top,
    bottom: chunk.getBoundingClientRect().bottom,
  };

  return (range.top > top && range.top < bottom) || (range.bottom > top && range.bottom < bottom);
}

function isChunkOnBottomEdge(
  chunk: Element,
  nextChunk: Element,
  lineHeight: number,
  bottom: number
) {
  const range = {
    top: chunk.getBoundingClientRect().top + lineHeight,
    bottom: nextChunk?.getBoundingClientRect().top || chunk.getBoundingClientRect().bottom,
  };

  return (
    (range.top < bottom && range.bottom > bottom) || (range.top > bottom && range.top < bottom)
  );
}
