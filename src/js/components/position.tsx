import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { throttle } from 'lodash';

import docInfo from '../doc-info';
import SeqReturn, { Sequential, SeqReturnStatus } from './seq-return';
import { reducer, IPosition, INavDocument } from './position-reducer';
import { DocRole } from './manifest-reducer';

export interface IProps {
  readingOrder: INavDocument[];
  position: IPosition | null;
  sequentialPosition: IPosition | null;
  sequential: Sequential;
  seqReturnStatus: SeqReturnStatus;
  setPosition(position: IPosition, sequential: Sequential, SeqReturn: SeqReturnStatus): void;
}

export class Position extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  setPosition = (resetSequence?: boolean) => {
    const idea = getFirstIdeaShown();
    const chapterNum = docInfo.order;
    const chapterStart = isPageScrolledToTop();
    const chapterEnd = isPageScrolledToBottom();
    if (chapterNum === null || idea === null) return;

    const sequential =
      resetSequence ||
      (this.props.seqReturnStatus === SeqReturnStatus.Initializing &&
        this.props.sequential === Sequential.No)
        ? Sequential.Yes
        : checkSequence(
            this.props.sequentialPosition,
            { idea, chapterNum, chapterStart, chapterEnd },
            this.props.sequential,
            true
          );

    const seqReturnStatus = this.getSeqReturnStatus(
      this.props.seqReturnStatus,
      this.props.sequential
    );

    this.props.setPosition(
      { chapterNum, idea, chapterStart, chapterEnd },
      sequential,
      seqReturnStatus
    );

    setUriIdea(idea);
  };

  getSeqReturnStatus = getSeqReturnStatus();

  getScrollHandler = () => {
    const t1 = throttle(this.setPosition, 500, { leading: false });

    return function throttled() {
      t1();
    };
  };

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());

    this.setPosition();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
  }

  render() {
    const ro = this.props.readingOrder;
    if (ro.length === 0) return null;

    const pos = this.props.position;
    const thisChapter =
      pos !== null && this.props.sequentialPosition !== null
        ? this.props.sequentialPosition.chapterNum === pos.chapterNum
        : false;

    return (
      <SeqReturn
        status={this.props.seqReturnStatus}
        isChapter={docInfo.role === DocRole.Chapter}
        thisChapter={thisChapter}
        targetChapter={
          this.props.sequentialPosition ? ro[this.props.sequentialPosition.chapterNum] : null
        }
        targetIdea={this.props.sequentialPosition ? this.props.sequentialPosition.idea : null}
        setPosition={this.setPosition}
        sequential={this.props.sequential}
        startLink={ro[0].file}
      />
    );
  }
}

function isPageScrolledToBottom() {
  const nextLink = document.querySelector('.end-nav a[rel="next"]');

  if (nextLink) {
    return nextLink.getBoundingClientRect().top - window.innerHeight < -50;
  }

  return window.innerHeight + Math.ceil(window.scrollY) >= document.body.scrollHeight;
}

function isPageScrolledToTop(): boolean {
  const prevLink = document.querySelector('.begin-nav a[rel="prev"]');

  if (prevLink) {
    return prevLink.getBoundingClientRect().bottom > -80;
  }

  return Math.floor(window.scrollY) < 20;
}

export function getProgress(chapter: INavDocument, totalWords: number) {
  if (!chapter || !totalWords) return { offset: 0, fraction: 0 };

  const offset = (chapter.offsetWords / totalWords) * 100;
  const fraction = (chapter.words / totalWords) * 100;

  return { offset, fraction };
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
  wasSequentialBefore: Sequential,
  initCheck?: boolean
): Sequential {
  // no info
  if (pos2 === null) return wasSequentialBefore;

  // new book
  if (pos1 === null && pos2 !== null) return Sequential.Yes;

  if (pos1 !== null && pos2 !== null) {
    // step is large to prevent false positives
    const step = window.innerHeight * 0.9;

    if (wasSequentialBefore === Sequential.Yes) {
      // new chapter
      if (pos1.chapterEnd && pos2.chapterNum - pos1.chapterNum === 1 && pos2.idea <= 3)
        return Sequential.Yes;

      // same chapter
      if (pos1.chapterNum === pos2.chapterNum) {
        // ~consecutive numbers
        if (Math.abs(pos2.idea - pos1.idea) < 3) return Sequential.Yes;

        // 1.5 steps down or up
        const idea1 = document.getElementById(`idea${pos1.idea}`);
        const idea2 = document.getElementById(`idea${pos2.idea}`);

        if (idea1 !== null && idea2 !== null) {
          const top1 = idea1.getBoundingClientRect().top;
          const top2 = idea2.getBoundingClientRect().top;

          if (Math.abs(top2 - top1) < 1.5 * step) return Sequential.Yes;
        } else {
          return wasSequentialBefore;
        }
      }
    } else if (pos1.chapterNum === pos2.chapterNum) {
      // is back on screen
      const idea1 = document.getElementById(`idea${pos1.idea}`);

      if (idea1 !== null) {
        const top1 = idea1.getBoundingClientRect().top;

        if (top1 > -5 && top1 < step * 0.75) return Sequential.Yes;
      } else {
        return wasSequentialBefore;
      }
    }
  }

  return Sequential.No;
}

const getSeqReturnStatus = () => {
  let counter = 0;
  let start = new Date().getTime() / 1000;

  return (status: SeqReturnStatus, sequential: Sequential) => {
    if (status === SeqReturnStatus.Initializing) {
      const now = new Date().getTime() / 1000;

      if (sequential === Sequential.Yes) {
        const counterTopped = counter > 3;
        const initTimeElapsed = now - start > 12;

        if (counterTopped && initTimeElapsed) {
          return SeqReturnStatus.Enabled;
        } else {
          counter++;
          return SeqReturnStatus.Initializing;
        }
      } else {
        counter = 0;
        start = now;
        return status;
      }
    } else return status;
  };
};

function setUriIdea(id: number) {
  window.history.replaceState(undefined, document.title, `#idea${id}`);
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    position: state.position.position,
    readingOrder: state.position.readingOrder,
    sequential: state.position.sequential,
    seqReturnStatus: state.position.seqReturnStatus,
    sequentialPosition: state.position.sequentialPosition,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setPosition: reducer.setPosition,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Position);
