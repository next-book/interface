import React from 'react';
import { throttle } from 'lodash';

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
  actions: {
    showToc(): void;
  };
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
      zonePadding: { [Side.Top]: 18, [Side.Bottom]: 8 * 4 },
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
    this.setSizes();
    this.setPaddings();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
  }

  render() {
    const bottom = this.state.barHeight ? this.state.barHeight[Side.Bottom] : null;
    const top = this.state.barHeight ? this.state.barHeight[Side.Top] : null;

    return (
      <>
        <div
          id="pagination__bottom"
          style={bottom ? { height: `${bottom}px` } : {}}
          className={bottom === null ? 'pagination__bottom--collapsed' : ''}
          onClick={this.props.actions.showToc}
        />
        <div id="pagination__top" style={top ? { height: `${top}px` } : { height: 0 }} />
      </>
    );
  }
}

function calcCutoff(from: Side, readingZone: Sides) {
  const els = [...document.querySelectorAll('.chunk')].filter(el =>
    isElementOnTheEdge(el, readingZone[from])
  );

  if (!els.length) {
    if (window.scrollY > 30) return readingZone[from];
    else return from === Side.Top ? 0 : window.innerHeight;
  }

  const el = els[0];

  const cStyle = window.getComputedStyle(el);
  const lineHeight = parseInt(cStyle.lineHeight, 10);
  const rect = el.getBoundingClientRect();
  let y = rect[from];

  if (from === Side.Top) {
    y += parseInt(cStyle.paddingTop, 10);

    while (y < readingZone[from]) {
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

function isElementOnTheEdge(el: Element, edge: number) {
  var rect = el.getBoundingClientRect();

  return rect.top < edge && rect.bottom > edge;
}
