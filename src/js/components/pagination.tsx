import React from 'react';
import { throttle } from 'lodash';
import {
  wasLastStepForward,
  wasLastStepBack,
  elements,
  setVisibleChunks,
  clearVisibleChunks,
} from '../doc-info';

enum Side {
  Bottom = 'bottom',
  Top = 'top',
}

export type Sides = {
  [Side.Top]: number;
  [Side.Bottom]: number;
};

interface IProps {
  setScrollStepGetter(fn: () => number | null): void;
  setPaddingsSetter(fn: () => void): void;
}

export interface IState {
  paginatedDisplay: boolean;
  windowHeight: number | null;
  zonePadding: Sides;
  readingZone: Sides;
  realReadingZone: Sides | null;
  lastScrollStart: number | null;
}

export class Pagination extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      paginatedDisplay: false,
      windowHeight: null,
      zonePadding: { [Side.Top]: 18, [Side.Bottom]: 48 },
      readingZone: { [Side.Top]: 0, [Side.Bottom]: 0 },
      realReadingZone: null,
      lastScrollStart: null,
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
      this.clipVisible
    );
  };

  clipVisible = () => {
    if (this.state.windowHeight === null) return;

    clearVisibleChunks();
    setVisibleChunks(
      findVisibleChunks(this.state.readingZone[Side.Top], this.state.readingZone[Side.Bottom])
    );
    const realReadingZone = clipReadingZone(this.state.readingZone);

    this.setState({
      ...this.state,
      paginatedDisplay: true,
      realReadingZone,
    });
  };

  collapseBars = () => {
    if (!this.state.paginatedDisplay) return;
    const ms = new Date().getTime();

    if (this.state.lastScrollStart === null) {
      this.setState({ ...this.state, lastScrollStart: ms });
      return;
    }

    if (ms - this.state.lastScrollStart < 150) return;

    if (ms - this.state.lastScrollStart < 250) {
      this.setState({ ...this.state, paginatedDisplay: false, lastScrollStart: null });
      return;
    }

    this.setState({ ...this.state, lastScrollStart: null });
  };

  displayPaginated = () => {
    this.collapseBars();

    if (this.state.paginatedDisplay) document.body.classList.add('nb-paginated');
    else {
      clearVisibleChunks();
      document.body.classList.remove('nb-paginated');
    }
  };

  getScrollHandler = () => {
    const t3 = throttle(this.displayPaginated, 100, { leading: true });

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
    this.props.setScrollStepGetter(this.getScrollStep);
    this.props.setPaddingsSetter(this.clipVisible);

    window.addEventListener('resize', this.setSizes);

    window.requestAnimationFrame(() => {
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
    if (chunks.all !== null)
      if (wasLastStepForward()) chunks.all.forEach(c => c.classList.add('visible', 'step-forward'));
      else if (wasLastStepBack()) chunks.all.forEach(c => c.classList.add('visible', 'step-back'));
      else chunks.all.forEach(c => c.classList.add('visible'));
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

function calcBottomCutoff(chunk: Element | null, readingZone: Sides) {
  if (chunk === null) return { zone: window.innerHeight, clip: 0 };

  const lineHeight = getComputedStyleNumber(chunk, 'lineHeight');
  const rect = chunk.getBoundingClientRect();

  let y = rect[Side.Bottom];

  while (y > readingZone[Side.Bottom]) {
    y -= lineHeight;
  }

  if (y - 1.5 * lineHeight < rect[Side.Top]) {
    // cut off one-liners to prevent widows
    y = rect[Side.Top];
  } else if (y + 1.5 * lineHeight > rect[Side.Bottom]) {
    // cut a line from n+1 long paragraph to prevent orphans
    y -= lineHeight;
  }

  return { zone: y, clip: rect[Side.Bottom] - y };
}

function getComputedStyleNumber(el: Element, attr: 'lineHeight' | 'paddingTop'): number {
  const style = window.getComputedStyle(el);
  return parseInt(style[attr], 10);
}

function findVisibleChunks(topEdge: number, bottomEdge: number) {
  let top: null | Element = null;
  let bottom: null | Element = null;
  const chunks = elements.chunks;

  for (let chunk of chunks) {
    if (top !== null && bottom !== null) break;

    const rect = chunk.getBoundingClientRect();
    const range = getComputedStyleNumber(chunk, 'lineHeight');

    if (top === null && isChunkOnTopEdge(rect, range, topEdge)) top = chunk;
    if (isChunkOnBottomEdge(rect, range, bottomEdge)) bottom = chunk;
  }

  return { top, bottom, all: getRangeOfChunks(top, bottom, chunks) };
}

function getRangeOfChunks(
  top: Element | null,
  bottom: Element | null,
  chunks: Element[]
): Element[] {
  if (chunks.length === 0) return [];

  const topNum = top === null ? 1 : getRefInt(top);
  const bottomNum = bottom === null ? getRefInt(chunks[chunks.length - 1]) : getRefInt(bottom);

  if (topNum === null || bottomNum === null) return [];

  const range = [];
  for (let i = topNum; i <= bottomNum; i++) {
    const el = document.getElementById(`chunk${i}`);
    if (el) range.push(el);
  }
  return range;
}

function getRefInt(el: Element) {
  const num = el.getAttribute('data-nb-ref-number');
  return num !== null ? parseInt(num, 10) : null;
}

function isChunkOnTopEdge(rect: DOMRect, range: number, edge: number) {
  return (
    (rect.top < edge && rect.bottom > edge + range) || (rect.top > edge && rect.top < edge + range)
  );
}

function isChunkOnBottomEdge(rect: DOMRect, range: number, edge: number) {
  return (
    (rect.top < edge + range && rect.bottom > edge) ||
    (rect.bottom < edge && rect.bottom > edge + range)
  );
}
