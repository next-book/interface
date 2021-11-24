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
import { Prev, Next, PrevChapter, NextChapter, End } from '../icons';
import { trackPagination, Controller } from './research/tracker';

export enum Direction {
  Back = 'back',
  Forward = 'forward',
}

export enum Action {
  Paginate,
  ChangeChapter,
  None,
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
    const t2 = throttle(this.setScrollRatio, 200, { leading: true });

    return function throttled() {
      t2();
    };
  };

  handleKeyboardNav = (event: KeyboardEvent) => {
    if (document.activeElement !== document.body || document.activeElement === null) return;

    const selection = window.getSelection();
    if (event.shiftKey === true && selection !== null && !selection.isCollapsed) return;

    switch (keycode(event)) {
      case 'left':
        trackPagination(Controller.Keyboard);
        return this.goBack(this.getBackAction());
      case 'right':
        trackPagination(Controller.Keyboard);
        return this.goForward(this.getForwardAction());
      default:
        return;
    }
  };

  handleSwipeNav = (event: TouchEvent, dir: Direction) => {
    trackPagination(Controller.Swipe);

    if (dir === Direction.Forward) {
      this.goForward(this.getForwardAction());
    } else if (dir === Direction.Back) {
      this.goBack(this.getBackAction());
    }
  };

  getForwardAction = () => {
    if (document.body.clientHeight <= window.innerHeight) return Action.ChangeChapter;
    else if (this.props.position === null || !this.props.position.chapterEnd)
      return Action.Paginate;
    else if (docInfo.links.next !== null) return Action.ChangeChapter;
    else return Action.None;
  };

  getBackAction = () => {
    if (document.body.clientHeight <= window.innerHeight) return Action.ChangeChapter;
    else if (this.props.position === null || !this.props.position.chapterStart)
      return Action.Paginate;
    else if (docInfo.links.prev !== null) return Action.ChangeChapter;
    else return Action.None;
  };

  goForward = (action: Action) => {
    switch (action) {
      case Action.Paginate:
        const step = domFns.getScrollStep();
        pageForward(step);
        setLastScrollStep(step ? [Direction.Forward, step] : null);
        domFns.setPaginatedMode();
        return;
      case Action.ChangeChapter:
        const next = docInfo.links.next;
        if (next) window.location.assign(next);
        return;
    }
  };

  goBack = (action: Action) => {
    switch (action) {
      case Action.Paginate:
        const step =
          lastScrollStep !== null && lastScrollStep[0] !== Direction.Back
            ? lastScrollStep[1]
            : domFns.getScrollStep();
        pageBack(step);
        setLastScrollStep(step ? [Direction.Back, step] : null);
        domFns.setPaginatedMode();
        return;
      case Action.ChangeChapter:
        const prev = docInfo.links.prev;
        if (prev) window.location.assign(prev);
        return;
    }
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());
    if (this.props.keyboardNav) {
      document.body.addEventListener('keydown', this.handleKeyboardNav);
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
  }

  render() {
    const ro = this.props.readingOrder;
    if (ro.length === 0) return null;

    const pos = this.props.position;
    const chapter = pos !== null ? this.props.documents[pos.file] : null;

    const { totalWords } = this.props.documents[ro[ro.length - 1]];

    const forwardAction = this.getForwardAction();
    const backAction = this.getBackAction();

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
        {docInfo.role !== DocRole.Cover && chapter && (
          <TopBar title={this.props.manifest.title} chapter={chapter} />
        )}

        <div className="button-navigation">
          <div className="back-button" onClick={() => this.goBack(backAction)}>
            {this.props.invisibleNav ||
              (backAction === Action.Paginate
                ? Prev
                : backAction === Action.ChangeChapter
                ? PrevChapter
                : End)}
          </div>
          <div className="forward-button" onClick={() => this.goForward(forwardAction)}>
            {this.props.invisibleNav ||
              (forwardAction === Action.Paginate
                ? Next
                : forwardAction === Action.ChangeChapter
                ? NextChapter
                : End)}
          </div>
        </div>
      </nav>
    );
  }
}

function displayPagination(dir: Direction) {
  document.body.classList.add(`nb-paginated-${dir}`);
  window.setTimeout(() => document.body.classList.remove(`nb-paginated-${dir}`), 300);
}

function pageForward(step: number | null) {
  if (step === null) return;
  window.scrollTo(window.scrollX, window.scrollY + step);
  displayPagination(Direction.Forward);
}

function pageBack(step: number | null) {
  if (step === null) return;
  window.scrollTo(window.scrollX, window.scrollY - step);
  displayPagination(Direction.Back);
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
