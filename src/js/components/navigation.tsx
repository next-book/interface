import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { throttle } from 'lodash';
import keycode from 'keycode';

import { getChapterNum } from '../shared';
import { NavBar } from './nav-bar';
import { TopBar } from './top-bar';
import { CatchWord } from './catch-word';
import { SeqReturn } from './seq-return';
import { reducer, IPosition, INavDocument, IConfig } from './navigation-reducer';
import { IState as IManifest, IDocument } from './manifest-reducer';
import { reducer as peeksReducer, IPeek } from './peeks-reducer';

import Toc from './toc';

enum Direction {
  Back = 'back',
  Forward = 'forward',
}

export interface IProps {
  manifest: IManifest;
  config: IConfig;
  scrollRatio: number;
  position: IPosition | null;
  sequentialPosition: IPosition | null;
  readingOrder: INavDocument[];
  sequential: boolean;
  setPosition(chapterNum: number, idea: number, sequential: boolean): void;
  setScrollRatio(scrollRatio: number): void;
  setReadingOrder(documents: IDocument[]): void;
  addPeek(peek: IPeek): void;
}

export class Navigation extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  private isChapter = getChapterNum() !== null;

  setPosition = (resetSequence?: boolean) => {
    const idea = getFirstIdeaShown();
    const chapterNum = getChapterNum();
    if (chapterNum === null || idea === null) return;

    const sequential =
      resetSequence ||
      checkSequence(this.props.sequentialPosition, { idea, chapterNum }, this.props.sequential);

    this.props.setPosition(chapterNum, idea, sequential);

    setUriIdea(idea);
  };

  setScrollRatio = () => {
    this.props.setScrollRatio(getScrollRatio());
  };

  getScrollHandler = () => {
    const t1 = throttle(this.setPosition, 500, { leading: false });
    const t2 = throttle(this.setScrollRatio, 100, { leading: true });

    return function throttled() {
      t1();
      t2();
    };
  };

  handleKeyboardNav = (event: KeyboardEvent) => {
    if (this.props.position === null) return;

    const chapter = this.props.readingOrder[this.props.position.chapterNum];

    switch (keycode(event)) {
      case 'left':
        return moveBackward(event, chapter.prev);
      case 'right':
        return moveForward(event, chapter.next);
      default:
        return;
    }
  };

  handleInvisibleNav = (event: MouseEvent) => {
    if (this.props.position === null) return;

    const chapter = this.props.readingOrder[this.props.position.chapterNum];
    const target = event.target as HTMLElement;

    if (
      target.tagName != 'A' &&
      target.tagName != 'BUTTON' &&
      target.tagName != 'INPUT' &&
      target.tagName != 'LABEL' &&
      target.closest('A') === null &&
      target.closest('LABEL') === null
    ) {
      if (this.isInPaginationRect(Direction.Back, event.clientX, event.clientY)) {
        return moveBackward(event, chapter.prev);
      } else if (this.isInPaginationRect(Direction.Forward, event.clientX, event.clientY)) {
        return moveForward(event, chapter.next);
      }
    }
  };

  isInPaginationRect = (dir: Direction, x: number, y: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rectW = w / 10;
    const rectH = (h / 5) * 3;
    const margin = 10;
    const top = h / 5;
    const bottom = h / 5 + rectH;

    const left = dir === Direction.Back ? margin : w - margin - rectW;
    const right = dir === Direction.Back ? margin + rectW : w - margin;

    return x < right && x > left && y > top && y < bottom;
  };

  showToc = () => {
    this.props.addPeek({
      content: <Toc />,
      title: 'Table of Contents',
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

    this.props.setReadingOrder(this.props.manifest.documents);

    this.setPosition();
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
    const chapter = pos !== null ? ro[pos.chapterNum] : null;
    const thisChapter =
      pos !== null && this.props.sequentialPosition !== null
        ? this.props.sequentialPosition.chapterNum === pos.chapterNum
        : false;
    const { totalWords } = ro[ro.length - 1];

    return (
      <nav>
        <CatchWord actions={{ showToc: this.showToc }} />
        <NavBar
          isChapter={this.isChapter}
          readingOrder={ro}
          chapter={chapter}
          scrollRatio={this.props.scrollRatio}
          totalWords={totalWords}
        />
        {chapter && <TopBar title={this.props.manifest.title} chapter={chapter} />}
        <SeqReturn
          isChapter={this.isChapter}
          thisChapter={thisChapter}
          targetChapter={
            this.props.sequentialPosition ? ro[this.props.sequentialPosition.chapterNum] : null
          }
          targetIdea={this.props.sequentialPosition ? this.props.sequentialPosition.idea : null}
          setPosition={this.setPosition}
          sequential={this.props.sequential}
          startLink={ro[0].file}
        />
      </nav>
    );
  }
}

function moveForward(event: MouseEvent | TouchEvent | KeyboardEvent, nextChapter: string | null) {
  event.preventDefault();

  if (!isPageScrolledToBottom()) {
    displayPagination(Direction.Forward);
    window.scrollTo(window.scrollX, window.scrollY + getScrollStep());
  } else if (nextChapter) window.location.assign(`${nextChapter}#chunk1`);
}

function displayPagination(dir: Direction) {
  if ([Direction.Forward, Direction.Back].includes(dir)) {
    document.body.classList.add(`paginated-${dir}`);
    window.setTimeout(() => document.body.classList.remove(`paginated-${dir}`), 300);
  }
}

function moveBackward(event: MouseEvent | TouchEvent | KeyboardEvent, prevChapter: string | null) {
  event.preventDefault();

  if (!isPageScrolledToTop()) {
    displayPagination(Direction.Back);
    window.scrollTo(window.scrollX, window.scrollY - getScrollStep());
  } else if (prevChapter) window.location.assign(`${prevChapter}#chapter-end`);
}

function isPageScrolledToBottom() {
  const nextLink = document.querySelector('.end-nav a[rel="next"]');

  if (nextLink) {
    return nextLink.getBoundingClientRect().top - window.innerHeight < -150;
  }

  return window.innerHeight + Math.ceil(window.scrollY) >= document.body.scrollHeight;
}

function isPageScrolledToTop() {
  const prevLink = document.querySelector('.begin-nav a[rel="prev"]');

  if (prevLink) {
    return prevLink.getBoundingClientRect().bottom > -50;
  }

  return Math.floor(window.scrollY) < 20;
}

function getScrollStep() {
  const peeksEl = document.getElementById('peeks');
  const catchWordEl = document.getElementById('catchword-bar');

  const bottomOffset = Math.max(
    peeksEl !== null ? peeksEl.offsetHeight + 10 : 0,
    catchWordEl ? catchWordEl.offsetHeight : 0
  );

  const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  return window.innerHeight - bottomOffset - remSize;
}

function getScrollRatio() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

function getFirstIdeaShown() {
  const ideas = [...document.querySelectorAll('.idea')].map(el => ({
    el,
    top: el.getBoundingClientRect().top,
    bottom: el.getBoundingClientRect().bottom,
  }));
  const shown = ideas.filter(el => el.top > 20).sort((el1, el2) => el1.bottom - el2.bottom);

  const idea = shown.length > 0 ? shown[0] : ideas[ideas.length - 1];
  const attr = idea.el.getAttribute('data-nb-ref-number');
  return attr !== null ? parseInt(attr, 10) : null;
}

function checkSequence(
  pos1: IPosition | null,
  pos2: IPosition | null,
  wasSequentialBefore: boolean
) {
  // no info
  if (pos2 === null) return wasSequentialBefore;

  // new book
  if (pos1 === null && pos2 !== null) return true;

  if (pos1 !== null && pos2 !== null) {
    const scrollStep = getScrollStep();
    if (wasSequentialBefore) {
      // new chapter
      if (pos2.chapterNum - pos1.chapterNum === 1 && pos2.idea <= 3) return true;

      // same chapter
      if (pos1.chapterNum === pos2.chapterNum) {
        // ~consecutive numbers
        if (Math.abs(pos2.idea - pos1.idea) < 3) return true;

        // 1.5 scrollSteps down or up
        const idea1 = document.getElementById(`idea${pos1.idea}`);
        const idea2 = document.getElementById(`idea${pos2.idea}`);

        if (idea1 !== null && idea2 !== null) {
          const top1 = idea1.getBoundingClientRect().top;
          const top2 = idea2.getBoundingClientRect().top;

          if (Math.abs(top2 - top1) < 1.5 * scrollStep) return true;
        } else {
          return wasSequentialBefore;
        }
      }
    } else {
      if (pos1.chapterNum === pos2.chapterNum) {
        // is back on screen
        const idea1 = document.getElementById(`idea${pos1.idea}`);

        if (idea1 !== null) {
          const top1 = idea1.getBoundingClientRect().top;

          if (top1 > 0 && top1 < scrollStep * 0.75) return true;
        } else {
          return wasSequentialBefore;
        }
      }
    }
  }

  return false;
}

function setUriIdea(id: number) {
  window.history.replaceState(undefined, document.title, `#idea${id}`);
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    config: state.navigation.config,
    readingOrder: state.navigation.readingOrder,
    position: state.navigation.position,
    scrollRatio: state.navigation.scrollRatio,
    sequential: state.navigation.sequential,
    sequentialPosition: state.navigation.sequentialPosition,
    manifest: state.manifest,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      addPeek: peeksReducer.addPeek,
      setPosition: reducer.setPosition,
      setScrollRatio: reducer.setScrollRatio,
      setReadingOrder: reducer.setReadingOrder,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
