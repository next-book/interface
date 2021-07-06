import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../../reducer';
import { throttle } from 'lodash';

import docInfo from '../../doc-info';
import SeqReturn, { Sequential, SeqReturnStatus } from './../seq-return';
import { DocRole } from './../manifest/reducer';
import { reducer, IPosition, IDocMap, INavDocument } from './../position/reducer';

export interface IProps {
  readingOrder: string[];
  documents: IDocMap;
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

  setPosition = (resetSequence: boolean = false, manipulateUriIdea: boolean = true) => {
    const idea = getFirstIdeaShown();
    const file = docInfo.links.self;
    const chapterStart = idea === 1 || isPageScrolledToTop();
    const chapterEnd = isPageScrolledToBottom();

    if (file === null || idea === null) return;

    const sequential = resetSequence
      ? Sequential.Yes
      : docInfo.role !== DocRole.Chapter
      ? Sequential.No
      : this.props.seqReturnStatus === SeqReturnStatus.Initializing &&
        this.props.sequential === Sequential.No
      ? Sequential.Yes
      : checkSequence(
          this.props.sequentialPosition,
          { idea: idea === 1 ? 1 : idea - 1, file, chapterStart, chapterEnd },
          this.props.documents,
          this.props.sequential,
          true
        );

    const seqReturnStatus = this.getSeqReturnStatus(
      this.props.seqReturnStatus,
      this.props.sequential
    );

    this.props.setPosition({ file, idea, chapterStart, chapterEnd }, sequential, seqReturnStatus);
    if (manipulateUriIdea) setUriIdea(idea);
  };

  getSeqReturnStatus = getSeqReturnStatus();

  getScrollHandler = () => {
    const t1 = throttle(this.setPosition, 200, { leading: true });

    return function throttled() {
      t1();
    };
  };

  componentDidMount() {
    if (window.location.hash.match(/#idea\d+/) && window.scrollY != 0) {
      window.scrollTo(window.scrollX, window.scrollY - 150);
    }

    window.addEventListener('scroll', this.getScrollHandler());
    const isTop =
      window.scrollY === 0 && (window.location.hash === '' || window.location.hash === '#idea1');
    const isBottom = window.location.hash === '#chapter-end';

    this.setPosition(false, !(isTop || isBottom));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.getScrollHandler());
  }

  render() {
    const ro = this.props.readingOrder;
    if (ro.length === 0) return null;

    const colophon = Object.values(this.props.documents).find(doc => doc.role === DocRole.Colophon);

    return (
      <SeqReturn
        status={this.props.seqReturnStatus}
        docRole={docInfo.role}
        targetChapter={
          this.props.sequentialPosition
            ? this.props.documents[this.props.sequentialPosition.file]
            : null
        }
        targetIdea={this.props.sequentialPosition ? this.props.sequentialPosition.idea : null}
        setPosition={this.setPosition}
        sequential={this.props.sequential}
        startLink={this.props.documents[ro[0]].file}
        colophonLink={colophon ? colophon.file : null}
      />
    );
  }
}

function getTopBound(): number {
  const chunk = docInfo.elements.chunks[0];

  if (chunk !== undefined) return chunk.getBoundingClientRect().top;
  return -window.scrollY;
}

function isPageScrolledToTop(): boolean {
  return document.body.clientHeight <= window.innerHeight || getTopBound() > 48;
}

function getBottomBound(): number {
  const last = docInfo.elements.chunks[docInfo.elements.chunks.length - 1];

  if (last !== undefined) return last.getBoundingClientRect().bottom - window.innerHeight;
  return document.body.scrollHeight - window.innerHeight - window.scrollY;
}

function isPageScrolledToBottom() {
  return document.body.clientHeight <= window.innerHeight || getBottomBound() < -50;
}

export function getScrollRatio(): number {
  const top = -getTopBound();
  const bottom = getBottomBound();
  const ratio = top / (top + bottom);

  if (top < 0 || ratio < 0) return 0;
  if (bottom < 0 || ratio > 1) return 1;

  return top / (top + bottom);
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
  if (ideas.length === 0) return null;

  const shown = ideas.filter(el => el.top > 0).sort((el1, el2) => el1.bottom - el2.bottom);

  const idea = shown.length > 0 ? shown[0] : ideas[ideas.length - 1];
  const attr = idea.el.getAttribute('data-nb-ref-number');
  return attr !== null ? parseInt(attr, 10) : null;
}

function areSubsequentChapters(doc1: INavDocument, doc2: INavDocument) {
  if (doc1.order === null || doc2.order === null) return false;
  else return doc2.order - doc1.order === 1;
}

// use <id of the first shown idea> - 1 to prevent false negatives
// after long non-idea content (images, tables, etc.)
function checkSequence(
  pos1: IPosition | null,
  pos2: IPosition | null,
  documents: IDocMap,
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
      // following chapter
      if (
        pos1.chapterEnd &&
        areSubsequentChapters(documents[pos1.file], documents[pos2.file]) &&
        pos2.idea <= 3
      )
        return Sequential.Yes;

      // same chapter
      if (pos1.file === pos2.file) {
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
    } else if (pos1.file === pos2.file) {
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
        const initTimeElapsed = now - start > 30;

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
    documents: state.position.documents,
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
