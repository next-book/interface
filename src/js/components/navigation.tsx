import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { throttle } from 'lodash';
import keycode from 'keycode';

import { withTranslation, WithTranslation } from 'react-i18next';

import docInfo, { setLastScrollStep, lastScrollStep, domFns } from '../doc-info';
import { DocRole } from './manifest/reducer';
import { initSwipeNav } from '../swipe-nav';
import { NavBar } from './nav-bar';
import { TopBar } from './top-bar';
import { Pagination } from './pagination';
import { Sequential } from './seq-return';
import { getScrollRatio } from './position';
import { reducer, IPosition, IDocMap } from './position/reducer';
import { IState as IManifest, IDocument } from './manifest/reducer';

export enum Direction {
  Back = 'back',
  Forward = 'forward',
}

export interface IProps extends WithTranslation {
  manifest: IManifest;
  keyboardNav: boolean;
  invisibleNav: boolean;
  scrollRatio: number;
  position: IPosition | null;
  sequentialPosition: IPosition | null;
  readingOrder: string[];
  documents: IDocMap;
  sequential: Sequential;
  setScrollRatio(scrollRatio: number): void;
  setReadingOrder(documents: IDocument[]): void;
}

export class Navigation extends React.Component<IProps> {
  setScrollRatio = () => {
    this.props.setScrollRatio(getScrollRatio());
  };

  getScrollHandler = () => {
    const t2 = throttle(this.setScrollRatio, 100, { leading: true });

    return function throttled() {
      t2();
    };
  };

  getPrevChapterLink = () => {
    const links = docInfo.links;
    const position = this.props.position;

    if (docInfo.role === DocRole.Chapter && position !== null) {
      if (this.props.readingOrder.indexOf(position.file) === 0) {
        return links.colophon ? links.colophon : links.index;
      }
      const prev = this.props.documents[position.file].prev;
      return prev ? `${prev}#chapter-end` : null;
    } else if (docInfo.role === DocRole.Colophon) return links.index;
    else return null;
  };

  getNextChapterLink = () => {
    const role = docInfo.role;
    const position = this.props.position;

    if (role === DocRole.Chapter && position !== null) {
      const next = this.props.documents[position.file].next;
      return next || null;
    } else if (role === DocRole.Colophon || role === DocRole.Index) {
      const next = this.props.readingOrder[0];
      return next || null;
    } else return null;
  };

  handleKeyboardNav = (event: KeyboardEvent) => {
    if (document.activeElement !== document.body || document.activeElement === null) return;

    const selection = window.getSelection();
    if (event.shiftKey === true && selection !== null && !selection.isCollapsed) return;

    switch (keycode(event)) {
      case 'left':
        return this.goBack(event, false);
      case 'right':
        return this.goForward(event, false);
      default:
        return;
    }
  };

  handleSwipeNav = (event: TouchEvent, dir: Direction) => {
    if (dir === Direction.Forward) {
      this.goForward(event, false);
    } else if (dir === Direction.Back) {
      this.goBack(event, false);
    }
  };

  handleInvisibleNav = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      isInPaginationRect(Direction.Forward, event.clientX, event.clientY) &&
      target.tagName != 'A' &&
      target.tagName != 'BUTTON' &&
      target.tagName != 'INPUT' &&
      target.tagName != 'LABEL' &&
      !target.classList.contains('ui-target') &&
      target.closest('A') === null &&
      target.closest('LABEL') === null &&
      target.closest('.ui-target') === null
    ) {
      return this.goForward(event);
    }
  };

  goForward = (event: MouseEvent | TouchEvent | KeyboardEvent, showButtons?: boolean) => {
    event.preventDefault();

    if (this.props.position === null || !this.props.position.chapterEnd) {
      const step = domFns.getScrollStep();
      pageForward(step, showButtons);
      setLastScrollStep(step ? [Direction.Forward, step] : null);
      domFns.setPaginatedMode();
    } else {
      const next = this.getNextChapterLink();
      if (next) window.location.assign(next);
    }
  };

  goBack = (event: MouseEvent | TouchEvent | KeyboardEvent, showButtons?: boolean) => {
    event.preventDefault();

    if (this.props.position === null || !this.props.position.chapterStart) {
      const step =
        lastScrollStep !== null && lastScrollStep[0] !== Direction.Back
          ? lastScrollStep[1]
          : domFns.getScrollStep();
      pageBack(step, showButtons);
      setLastScrollStep(step ? [Direction.Back, step] : null);
      domFns.setPaginatedMode();
    } else {
      const prev = this.getPrevChapterLink();
      if (prev) window.location.assign(prev);
    }
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());
    if (this.props.keyboardNav) {
      document.body.addEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.invisibleNav) {
      document.body.addEventListener('mousedown', this.handleInvisibleNav);
    }
    initSwipeNav(this.handleSwipeNav);

    this.props.setReadingOrder(this.props.manifest.documents);
    this.props.setScrollRatio(getScrollRatio());
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
    if (this.props.keyboardNav) {
      document.body.removeEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.invisibleNav) {
      document.body.removeEventListener('mousedown', this.handleInvisibleNav);
    }
  }

  render() {
    const ro = this.props.readingOrder;
    if (ro.length === 0) return null;

    const pos = this.props.position;
    const chapter = pos !== null ? this.props.documents[pos.file] : null;

    const { totalWords } = this.props.documents[ro[ro.length - 1]];

    return (
      <nav>
        <Pagination />
        <NavBar
          docRole={docInfo.role}
          readingOrder={ro}
          documents={this.props.documents}
          chapter={chapter}
          scrollRatio={this.props.scrollRatio}
          totalWords={totalWords}
        />
        {docInfo.role !== DocRole.Index && chapter && (
          <TopBar title={this.props.manifest.title} chapter={chapter} />
        )}
      </nav>
    );
  }
}

function displayPagination(dir: Direction, showButtons?: boolean) {
  document.body.classList.add(`nb-paginated-${dir}`);
  window.setTimeout(() => document.body.classList.remove(`nb-paginated-${dir}`), 300);

  if (showButtons) {
    document.body.classList.add(`nb-paginated-button-${dir}`);
    window.setTimeout(() => document.body.classList.remove(`nb-paginated-button-${dir}`), 300);
  }
}

function isInPaginationRect(dir: Direction, x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const rectW = w * 0.05 + 24;
  const margin = 2;

  if ((x > margin && x < margin + rectW) || (x < w - margin && x > w - margin - rectW)) {
    const forwardTop = h * 0.25;
    const forwardH = h * 0.5;

    if (y > forwardTop && y < forwardTop + forwardH)
      return dir === Direction.Forward ? true : false;
  }

  return false;
}

function pageForward(step: number | null, showButtons?: boolean) {
  if (step === null) return;
  window.scrollTo(window.scrollX, window.scrollY + step);
  displayPagination(Direction.Forward, showButtons);
}

function pageBack(step: number | null, showButtons?: boolean) {
  if (step === null) return;
  window.scrollTo(window.scrollX, window.scrollY - step);
  displayPagination(Direction.Back, showButtons);
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    keyboardNav: state.config.keyboardNav,
    invisibleNav: state.config.invisibleNav,
    readingOrder: state.position.readingOrder,
    documents: state.position.documents,
    position: state.position.position,
    scrollRatio: state.position.scrollRatio,
    sequential: state.position.sequential,
    sequentialPosition: state.position.sequentialPosition,
    manifest: state.manifest,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setScrollRatio: reducer.setScrollRatio,
      setReadingOrder: reducer.setReadingOrder,
    },
    dispatch
  );
};

export default withTranslation('navigation')(
  connect(mapStateToProps, mapDispatchToProps)(Navigation)
);
