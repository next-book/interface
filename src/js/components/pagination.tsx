import React from 'react';
import { throttle } from 'lodash';
import docInfo from '../doc-info';
import { DocRole } from './manifest-reducer';

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
  barHeight: Sides | null;
  windowHeight: number | null;
  zonePadding: Sides;
  readingZone: Sides;
  lastScrollStart: number | null;
}

export class Pagination extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      barHeight: null,
      windowHeight: null,
      zonePadding: { [Side.Top]: 18, [Side.Bottom]: 48 },
      readingZone: { [Side.Top]: 0, [Side.Bottom]: 0 },
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
      this.setPaddings
    );
  };

  setPaddings = () => {
    if (this.state.windowHeight === null) return;

    this.setState({
      ...this.state,
      barHeight: {
        [Side.Top]: calcCutoff(Side.Top, this.state.readingZone),
        [Side.Bottom]: this.state.windowHeight - calcCutoff(Side.Bottom, this.state.readingZone),
      },
    });
  };

  collapseBars = () => {
    if (this.state.barHeight === null) return;
    const ms = new Date().getTime();

    if (this.state.lastScrollStart === null) {
      this.setState({ ...this.state, lastScrollStart: ms });
      return;
    }

    if (ms - this.state.lastScrollStart < 150) return;

    if (ms - this.state.lastScrollStart < 250) {
      this.setState({ ...this.state, barHeight: null, lastScrollStart: null });
      return;
    }

    this.setState({ ...this.state, lastScrollStart: null });
  };

  displayPaginated = () => {
    this.collapseBars();

    if (this.state.barHeight !== null) document.body.classList.add('paginated');
    else document.body.classList.remove('paginated');
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
      this.state.windowHeight -
      this.state.zonePadding[Side.Top] -
      (this.state.barHeight === null ? 80 : this.state.barHeight[Side.Bottom]) -
      5
    );
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());
    this.props.setScrollStepGetter(this.getScrollStep);
    this.props.setPaddingsSetter(this.setPaddings);

    window.addEventListener('resize', this.setSizes);

    window.requestAnimationFrame(() => {
      this.setSizes();
      document.body.classList.add('paginated');
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
    window.removeEventListener('resize', this.setSizes);
  }

  render() {
    const bottom = this.state.barHeight ? this.state.barHeight[Side.Bottom] : null;
    const top = this.state.barHeight ? this.state.barHeight[Side.Top] : null;

    return (
      docInfo.role === DocRole.Chapter && (
        <>
          <div
            id="pagination__bottom"
            style={bottom !== null ? { height: `${bottom}px` } : {}}
            className={bottom === null ? 'pagination__bottom--collapsed' : ''}
          />
          <div id="pagination__top" style={top !== null ? { height: `${top}px` } : { height: 0 }} />
        </>
      )
    );
  }
}

function calcCutoff(from: Side, readingZone: Sides) {
  const el =
    from === Side.Top
      ? getFirstVisibleChunk(readingZone[from])
      : getLastVisibleChunk(readingZone[from]);

  if (el === null) return from === Side.Top ? 0 : window.innerHeight;

  const lineHeight = getComputedStyleNumber(el, 'lineHeight');
  const rect = el.getBoundingClientRect();
  let y = rect[from];

  if (from === Side.Top) {
    y += getComputedStyleNumber(el, 'paddingTop');

    // adding half of lineHeight to account for Firefox behavior
    // (Chrome and Safari work OK without this)
    while (y + lineHeight / 2 < readingZone[from]) {
      y += lineHeight;
    }
  } else if (from === Side.Bottom) {
    while (y > readingZone[from]) {
      y -= lineHeight;
    }

    if (y - 1.5 * lineHeight < rect[Side.Top]) {
      // cut off one-liners to prevent widows
      y = rect[Side.Top];
    } else if (y + 1.5 * lineHeight > rect[Side.Bottom]) {
      // cut a line from n+1 long paragraph to prevent orphans
      y -= lineHeight;
    }
  }

  return y;
}

function getComputedStyleNumber(el: Element, attr: 'lineHeight' | 'paddingTop'): number {
  const style = window.getComputedStyle(el);
  return parseInt(style[attr], 10);
}

function getFirstVisibleChunk(edge: number) {
  for (let chunk of [...document.querySelectorAll('.chunk')]) {
    const rect = chunk.getBoundingClientRect();
    const range = getComputedStyleNumber(chunk, 'lineHeight');

    if (
      (rect.top < edge && rect.bottom > edge + range) ||
      (rect.top > edge && rect.top < edge + range)
    )
      return chunk;
  }
  return null;
}

function getLastVisibleChunk(edge: number) {
  for (let chunk of [...document.querySelectorAll('.chunk')].reverse()) {
    const rect = chunk.getBoundingClientRect();
    const range = getComputedStyleNumber(chunk, 'lineHeight');

    if (
      (rect.top < edge + range && rect.bottom > edge) ||
      (rect.bottom < edge && rect.bottom > edge + range)
    )
      return chunk;
  }
  return null;
}
