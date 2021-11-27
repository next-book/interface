import React from 'react';
import { throttle } from 'lodash';

import { elements, setVisibleChunks, clearVisibleChunks, setDomFn, role } from '../doc-info';
import { trackScroll } from './research/tracker';
import { DocRole } from './manifest/reducer';

enum Side {
  Bottom = 'bottom',
  Top = 'top',
}

export type Sides = {
  [Side.Top]: number;
  [Side.Bottom]: number;
};

interface IProps {}

export interface IState {
  paginatedDisplay: boolean;
  windowHeight: number | null;
  zonePadding: Sides;
  readingZone: Sides;
  realReadingZone: Sides | null;
}

export class Pagination extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      paginatedDisplay: false,
      windowHeight: null,
      zonePadding: { [Side.Top]: 48, [Side.Bottom]: 48 },
      readingZone: { [Side.Top]: 0, [Side.Bottom]: 0 },
      realReadingZone: null,
    };
  }

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
      this.clipPage
    );
  };

  clipPage = () => {
    if (role === DocRole.Break || role === DocRole.Cover) {
      elements.chunks.forEach(c => c.classList.add('visible'));
      return;
    }

    if (this.state.windowHeight === null) return;

    clearVisibleChunks();
    setVisibleChunks(findVisibleChunks(this.state.readingZone));
    const realReadingZone = clipReadingZone(this.state.readingZone);

    this.setState({
      ...this.state,
      realReadingZone,
    });
  };

  setPaginatedMode = () => {
    this.setState({
      ...this.state,
      paginatedDisplay: true,
    });
  };

  assessPagination = (() => {
    let lastTime: number = 0;
    let timer: number = 0;

    return (): boolean => {
      const now = new Date().getTime();
      const elapsed = now - lastTime;
      window.clearTimeout(timer);

      if (lastTime === 0) {
        lastTime = now;

        return this.state.paginatedDisplay;
      } else if (elapsed < 500) {
        trackScroll();
        timer = window.setTimeout(this.displayPaginated, 99);

        return false;
      } else lastTime = 0;

      return true;
    };
  })();

  displayPaginated = () => {
    if (this.assessPagination()) {
      document.body.classList.add('nb-paginated');
      this.clipPage();
      this.setState({ ...this.state, paginatedDisplay: true });
    } else {
      clearVisibleChunks();
      document.body.classList.remove('nb-paginated');
      this.setState({ ...this.state, paginatedDisplay: false });
    }
  };

  getScrollHandler = () => {
    const t3 = throttle(this.displayPaginated, 50, { leading: true });

    return function throttled() {
      t3();
    };
  };

  getScrollStep = (): number | null => {
    if (this.state.windowHeight === null) return null;

    return (
      (this.state.realReadingZone === null ? 80 : this.state.realReadingZone[Side.Bottom]) -
      this.state.zonePadding[Side.Top] -
      5
    );
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());
    setDomFn('getScrollStep', this.getScrollStep);
    setDomFn('clipPage', this.clipPage);
    setDomFn('setPaginatedMode', this.setPaginatedMode);

    window.addEventListener('resize', this.setSizes);

    window.requestAnimationFrame(() => {
      this.setPaginatedMode();
      this.setSizes();
      document.body.classList.add('nb-paginated');
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
    window.removeEventListener('resize', this.setSizes);
  }

  render() {
    return null;
  }
}

function clipReadingZone(readingZone: Sides): { top: number; bottom: number } {
  const chunks = elements.visibleChunks;
  const cutoffs = calcCutoffs(chunks.top, chunks.bottom, readingZone);

  if (chunks.top !== null && chunks.top === chunks.bottom)
    clipChunk(chunks.top, cutoffs.top.clip, cutoffs.bottom.clip);
  else {
    clipChunk(chunks.top, cutoffs.top.clip, 0);
    clipChunk(chunks.bottom, 0, cutoffs.bottom.clip);
  }

  window.requestAnimationFrame(() => {
    if (chunks.all !== null) chunks.all.forEach(c => c.classList.add('visible'));
  });

  return {
    top: cutoffs.top.zone,
    bottom: cutoffs.bottom.zone,
  };
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

  (chunk as HTMLElement).style.clipPath = `inset(${top}px 0 ${bottom}px 0)`;
}

function calcTopCutoff(chunk: Element | null, readingZone: Sides) {
  if (chunk === null) return { zone: 0, clip: 0 };

  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');
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

function findVisibleChunks(readingZone: Sides) {
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

  const top = insideRange[0];
  const bottom = insideRange[insideRange.length - 1];

  return { top, bottom, all: insideRange };
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
    top: chunk.getBoundingClientRect().top,
    bottom: nextChunk?.getBoundingClientRect().top || chunk.getBoundingClientRect().bottom,
  };

  return (
    (range.top < bottom && range.bottom > bottom) || (range.top > bottom && range.top < bottom)
  );
}
