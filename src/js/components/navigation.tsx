import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { throttle } from 'lodash';
import keycode from 'keycode';

import { withTranslation, WithTranslation } from 'react-i18next';

import docInfo from '../doc-info';
import { DocRole } from './manifest-reducer';
import { initSwipeNav } from '../swipe-nav';
import { NavBar } from './nav-bar';
import { TopBar } from './top-bar';
import GoTo from './go-to';
import { Pagination } from './pagination';
import { Sequential } from './seq-return';
import { reducer, IPosition, INavDocument, IDocMap, IConfig } from './position-reducer';
import { IState as IManifest, IDocument } from './manifest-reducer';
import { reducer as peeksReducer, IPeek } from './peeks-reducer';

import Toc from './toc';

export enum Direction {
  Back = 'back',
  Forward = 'forward',
}

export interface IProps extends WithTranslation {
  manifest: IManifest;
  config: IConfig;
  scrollRatio: number;
  position: IPosition | null;
  sequentialPosition: IPosition | null;
  readingOrder: string[];
  documents: IDocMap;
  sequential: Sequential;
  setScrollRatio(scrollRatio: number): void;
  setReadingOrder(documents: IDocument[]): void;
  addPeek(peek: IPeek): void;
}

export class Navigation extends React.Component<IProps> {
  private getScrollStep = (): number | null => null;
  private setPaddings = (): null | void => null;

  setScrollRatio = () => {
    this.props.setScrollRatio(getScrollRatio());
  };

  getScrollHandler = () => {
    const t2 = throttle(this.setScrollRatio, 100, { leading: true });

    return function throttled() {
      t2();
    };
  };

  setScrollStepGetter = (fn: () => number | null) => {
    this.getScrollStep = fn;
  };

  setPaddingsSetter = (fn: () => void) => {
    this.setPaddings = fn;
  };

  getPrevChapter = () => {
    if (docInfo.role === DocRole.Chapter && this.props.position !== null) {
      if (this.props.readingOrder.indexOf(this.props.position.file) === 0) {
        return docInfo.links.colophon ? docInfo.links.colophon : docInfo.links.index;
      }
      return this.props.documents[this.props.position.file].prev;
    } else if (docInfo.role === DocRole.Colophon) return docInfo.links.index;
    else return null;
  };

  getNextChapter = () => {
    if (docInfo.role === DocRole.Chapter && this.props.position !== null) {
      return this.props.documents[this.props.position.file].next;
    } else if (docInfo.role === DocRole.Colophon || docInfo.role === DocRole.Index)
      return this.props.readingOrder[0];
    else return null;
  };

  handleKeyboardNav = (event: KeyboardEvent) => {
    if (document.activeElement !== document.body || document.activeElement === null) return;

    switch (keycode(event)) {
      case 'left':
        return this.goBack(event, this.getPrevChapter(), false);
      case 'right':
        return this.goForward(event, this.getNextChapter(), false);
      default:
        return;
    }
  };

  handleSwipeNav = (event: TouchEvent, dir: Direction) => {
    if (dir === Direction.Forward) {
      this.goForward(event, this.getNextChapter(), false);
    } else if (dir === Direction.Back) {
      this.goBack(event, this.getPrevChapter(), false);
    }
  };

  handleInvisibleNav = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      target.tagName != 'A' &&
      target.tagName != 'BUTTON' &&
      target.tagName != 'INPUT' &&
      target.tagName != 'LABEL' &&
      !target.classList.contains('ui-target') &&
      target.closest('A') === null &&
      target.closest('LABEL') === null &&
      target.closest('.ui-target') === null
    ) {
      if (isInPaginationRect(Direction.Back, event.clientX, event.clientY)) {
        return this.goBack(event, this.getPrevChapter());
      } else if (isInPaginationRect(Direction.Forward, event.clientX, event.clientY)) {
        return this.goForward(event, this.getNextChapter());
      }
    }
  };

  goForward = (
    event: MouseEvent | TouchEvent | KeyboardEvent,
    nextChapter: string | null,
    showButtons?: boolean
  ) => {
    event.preventDefault();

    if (this.props.position === null || !this.props.position.chapterEnd) {
      pageForward(this.getScrollStep(), showButtons);
      this.setPaddings();
    } else if (nextChapter) window.location.assign(`${nextChapter}#chunk1`);
  };

  goBack = (
    event: MouseEvent | TouchEvent | KeyboardEvent,
    prevChapter: string | null,
    showButtons?: boolean
  ) => {
    event.preventDefault();

    if (this.props.position === null || !this.props.position.chapterStart) {
      pageBack(this.getScrollStep(), showButtons);
      this.setPaddings();
    } else if (prevChapter) window.location.assign(`${prevChapter}#chapter-end`);
  };

  showToc = () => {
    const idea = this.props.position !== null ? this.props.position.idea : null;

    // TODO: Rewrite without peeks
    this.props.addPeek({
      content: <Toc idea={idea} />,
      title: this.props.t('toc'),
      source: 'toc-table',
      showSource: false,
    });
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());
    if (this.props.config.keyboardNav) {
      window.document.body.addEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.config.invisibleNav) {
      window.document.addEventListener('mousedown', this.handleInvisibleNav);
    }
    initSwipeNav(this.handleSwipeNav);

    this.props.setReadingOrder(this.props.manifest.documents);

    this.props.setScrollRatio(getScrollRatio());
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
    if (this.props.config.keyboardNav) {
      window.document.body.removeEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.config.invisibleNav) {
      window.document.body.removeEventListener('mousedown', this.handleInvisibleNav);
    }
  }

  render() {
    const ro = this.props.readingOrder;
    if (ro.length === 0) return null;

    const pos = this.props.position;
    const chapter = pos !== null ? this.props.documents[pos.file] : null;

    const { totalWords } = this.props.documents[ro[ro.length - 1]];

    const { offset, fraction } =
      chapter !== null ? getProgress(chapter, totalWords) : { offset: 0, fraction: 0 };

    const progress = offset + fraction * this.props.scrollRatio;
    const minutesLeftInChapter = chapter
      ? countMinutesLeft(this.props.scrollRatio, chapter.words)
      : null;

    return (
      <nav>
        <Pagination
          setScrollStepGetter={this.setScrollStepGetter}
          setPaddingsSetter={this.setPaddingsSetter}
          actions={{ showToc: this.showToc }}
        />
        {this.props.position && (
          <GoTo
            currentFile={docInfo.links.self}
            currentChapterNum={ro.indexOf(this.props.position.file)}
            currentIdea={this.props.position.idea}
            readingOrder={this.props.readingOrder}
            documents={this.props.documents}
            progress={cropProgress(progress)}
            minutesLeft={minutesLeftInChapter}
          />
        )}
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

function cropProgress(progress: number) {
  return progress > 100 ? 100 : progress < 0 ? 0 : Math.floor(progress);
}

function countMinutesLeft(scrollRatio: number, wordsInChapter: number) {
  const wordsPerMinute = 240;
  const left = ((1 - scrollRatio) * wordsInChapter) / wordsPerMinute;
  return left > 0 ? Math.floor(left) : 0;
}

function displayPagination(dir: Direction, showButtons?: boolean) {
  document.body.classList.add(`paginated-${dir}`);
  window.setTimeout(() => document.body.classList.remove(`paginated-${dir}`), 300);

  if (showButtons !== false) {
    document.body.classList.add(`paginated-button-${dir}`);
    window.setTimeout(() => document.body.classList.remove(`paginated-button-${dir}`), 300);
  }
}

function getScrollRatio(): number {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

export function getProgress(chapter: INavDocument, totalWords: number) {
  if (!chapter || !totalWords) return { offset: 0, fraction: 0 };

  const offset = (chapter.offsetWords / totalWords) * 100;
  const fraction = (chapter.words / totalWords) * 100;

  return { offset, fraction };
}

function isInPaginationRect(dir: Direction, x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const rectW = w * 0.05 + 24;
  const margin = 2;

  if ((x > margin && x < margin + rectW) || (x < w - margin && x > w - margin - rectW)) {
    const backTop = h * 0.02;
    const backH = h * 0.18;

    const forwardTop = h * 0.25;
    const forwardH = h * 0.5;

    if (y > forwardTop && y < forwardTop + forwardH)
      return dir === Direction.Forward ? true : false;
    else if (y > backTop && y < backTop + backH) return dir === Direction.Back ? true : false;
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
    config: state.position.config,
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
      addPeek: peeksReducer.addPeek,
      setScrollRatio: reducer.setScrollRatio,
      setReadingOrder: reducer.setReadingOrder,
    },
    dispatch
  );
};

export default withTranslation('navigation')(
  connect(mapStateToProps, mapDispatchToProps)(Navigation)
);
