import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { throttle } from 'lodash';
import keycode from 'keycode';
import PropTypes from 'prop-types';

import reducer from './navigation-reducer';
import FullScreen from './full-screen';

class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.getScrollHandler = this.getScrollHandler.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.handleKeyboardNav = this.handleKeyboardNav.bind(this);
    this.handleInvisibleNav = this.handleInvisibleNav.bind(this);

    this.isChapter = getChapterNum() !== null;
  }

  setPosition(resetSequence) {
    const idea = getFirstIdeaShown();
    const chapterNum = getChapterNum();
    const scrollRatio = getScrollRatio();
    const sequential =
      resetSequence ||
      checkSequence(
        this.props.sequentialPosition,
        { idea, chapterNum, scrollRatio },
        this.props.sequential
      );

    this.props.setPosition(chapterNum, idea, scrollRatio, sequential);

    setUriIdea(idea);
  }

  getScrollHandler() {
    const t1 = throttle(this.setPosition, 500, { leading: false });

    return function throttled() {
      t1();
    };
  }

  handleKeyboardNav(event) {
    const chapter = this.props.readingOrder[this.props.position.chapterNum];

    switch (keycode(event)) {
      case 'left':
        return moveBackward(event, chapter.prev);
      case 'right':
        return moveForward(event, chapter.next);
      default:
        return;
    }
  }

  handleInvisibleNav(event) {
    const chapter = this.props.readingOrder[this.props.position.chapterNum];

    if (
      event.target.tagName != 'A' &&
      event.target.tagName != 'BUTTON' &&
      event.target.tagName != 'INPUT' &&
      event.target.tagName != 'LABEL' &&
      event.target.closest('A') === null &&
      event.target.closest('LABEL') === null
    ) {
      if (event.clientX < window.innerWidth / 5) {
        return moveBackward(event, chapter.prev);
      } else if (event.clientX > (window.innerWidth / 5) * 4) {
        return moveForward(event, chapter.next);
      }
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.getScrollHandler());
    if (this.props.config.keyboardNav) {
      window.document.body.addEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.config.invisibleNav) {
      window.document.addEventListener('click', this.handleInvisibleNav);
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
      window.document.body.removeEventListener('click', this.handleInvisibleNav);
    }
  }

  render() {
    const ro = this.props.readingOrder;
    if (ro.length === 0) return null;

    const pos = this.props.position;
    const chapter = pos.chapterNum !== null ? ro[pos.chapterNum] : null;
    const thisChapter =
      pos.chapterNum !== null ? this.props.sequentialPosition.chapterNum === chapter.order : false;
    const { totalWords } = ro[ro.length - 1];

    return (
      <nav>
        <CatchWord />
        {chapter && (
          <div>
            <NavBar
              readingOrder={ro}
              chapter={chapter}
              scrollRatio={pos.scrollRatio}
              idea={pos.idea}
              totalWords={totalWords}
            />
            <TopBar manifest={this.props.manifest} chapter={chapter} />
          </div>
        )}
        <SeqReturn
          isChapter={this.isChapter}
          thisChapter={thisChapter}
          targetChapter={ro[this.props.sequentialPosition.chapterNum]}
          idea={this.props.sequentialPosition.idea}
          setPosition={this.setPosition}
          sequential={this.props.sequential}
          startLink={ro[0].file}
        />
      </nav>
    );
  }
}

Navigation.propTypes = {
  manifest: PropTypes.shape({
    documents: PropTypes.arrayOf(PropTypes.object),
  }),
  config: PropTypes.object.isRequired,
  position: PropTypes.object.isRequired,
  sequentialPosition: PropTypes.object.isRequired,
  readingOrder: PropTypes.array.isRequired,
  sequential: PropTypes.bool,
  setPosition: PropTypes.func.isRequired,
  setReadingOrder: PropTypes.func.isRequired,
};

function SeqReturn(props) {
  const link = props.targetChapter ? `./${props.targetChapter.file}#idea${props.idea}` : null;

  const resetPosition = e => {
    e.preventDefault();
    props.setPosition(true);
  };

  const highlightPosition = () => {
    highlightIdea(props.idea);
  };

  if (props.idea === null) {
    return (
      <div className="seq-return-wrapper">
        <div className="seq-return">
          <p>
            <span>
              This book remembers where you stopped reading. Onboarding message is{' '}
              <a href="">long</a>.
            </span>
          </p>
          <span className="seq-buttons">
            <a href={props.startLink}>
              <b>Start reading</b>
            </a>
          </span>
        </div>
      </div>
    );
  }

  const readingPosition =
    !props.isChapter || !props.thisChapter ? (
      <p>
        You read up to <a href={link}>sentence #{props.idea}</a> in chapter{' '}
        <b>{props.targetChapter.title}</b>.
      </p>
    ) : (
      <p>
        You read up to sentence{' '}
        <a href={link} onClick={highlightPosition}>
          #{props.idea} in this chapter
        </a>
        .
      </p>
    );

  return (
    (!props.sequential || !props.isChapter) && (
      <div className="seq-return-wrapper">
        <div className="seq-return">
          {readingPosition}
          <span className="seq-buttons">
            {props.isChapter && (
              <a href="#" onClick={resetPosition}>
                Continue from&nbsp;here
              </a>
            )}
            <a href={link} onClick={highlightPosition}>
              <b>{props.isChapter ? 'Return back' : 'Continue reading'}</b>
            </a>
          </span>
        </div>
      </div>
    )
  );
}

SeqReturn.propTypes = {
  idea: PropTypes.number,
  targetChapter: PropTypes.object,
  thisChapter: PropTypes.bool.isRequired,
  isChapter: PropTypes.bool.isRequired,
  setPosition: PropTypes.func.isRequired,
  startLink: PropTypes.string.isRequired,
};

function CatchWord(props) {
  return <div className="catchword-bar" />;
}

function NavBar(props) {
  return (
    <ul className="nav-bar">
      <Pointer
        scrollRatio={props.scrollRatio}
        chapter={props.chapter}
        totalWords={props.totalWords}
      />
      {props.readingOrder.map((chapter, index) => (
        <Chapter key={chapter.order} chapter={chapter} totalWords={props.totalWords} />
      ))}
    </ul>
  );
}

NavBar.propTypes = {
  scrollRatio: PropTypes.number.isRequired,
  chapter: PropTypes.object.isRequired,
  totalWords: PropTypes.number.isRequired,
  readingOrder: PropTypes.array.isRequired,
};

function Pointer(props) {
  const { offset, width } = getChapterPixels(props.chapter, props.totalWords);
  const left = offset + width * props.scrollRatio;

  return <li className="pointer" style={{ left: left + '%' }} />;
}

Pointer.propTypes = {
  scrollRatio: PropTypes.number.isRequired,
  chapter: PropTypes.object.isRequired,
  totalWords: PropTypes.number.isRequired,
};

function TopBar(props) {
  return (
    <div className="top-bar">
      <p className="info">
        <a className="book" href="./index.html">
          {props.manifest.title}
        </a>
        <span className="chapter">
          {props.chapter.order + 1}&nbsp;/&nbsp;{props.chapter.title}
        </span>
      </p>
      <p className="tools">
        <FullScreen />
      </p>
    </div>
  );
}

TopBar.propTypes = {
  manifest: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
  chapter: PropTypes.shape({
    title: PropTypes.string.isRequired,
    order: PropTypes.number.isRequired,
  }),
};

function Chapter(props) {
  const { offset, width } = getChapterPixels(props.chapter, props.totalWords);

  return (
    <li
      className="chapter"
      style={{ left: `${offset}%`, width: `${width}%` }}
      data-order={props.chapter.order}
      title={props.chapter.title}
    >
      <span className="info">
        {props.chapter.order + 1}: {props.chapter.title}
      </span>
    </li>
  );
}

Chapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  totalWords: PropTypes.number.isRequired,
};

function moveForward(event, nextChapter) {
  event.preventDefault();

  if (!isPageScrolledToBottom()) {
    displayPagination('forward');
    window.scrollTo(window.scrollX, window.scrollY + getScrollStep());
  } else if (nextChapter) window.location.assign(`${nextChapter}#chunk1`);
}

function displayPagination(dir) {
  if (['forward', 'back'].includes(dir)) {
    document.body.classList.add(`paginated-${dir}`);
    window.setTimeout(() => document.body.classList.remove(`paginated-${dir}`), 300);
  }
}

function moveBackward(event, prevChapter) {
  event.preventDefault();

  if (!isPageScrolledToTop()) {
    displayPagination('back');
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
  const bottomOffset = Math.max(
    document.getElementById('peeks') ? document.getElementById('peeks').offsetHeight + 10 : 0,
    document.querySelector('.catchword-bar')
      ? document.querySelector('.catchword-bar').offsetHeight
      : 0
  );

  return window.innerHeight - bottomOffset;
}

function getChapterPixels(chapter, totalWords) {
  if (!chapter || !totalWords) return { offset: 0, width: 0 };

  const offset = (chapter.offsetWords / totalWords) * 100;
  const width = (chapter.words / totalWords) * 100;

  return { offset, width };
}

function getScrollRatio() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

function getChapterNum() {
  const el = document.querySelector('meta[name="order"]');
  if (!el) return null;

  const number = parseInt(el.getAttribute('content'), 10);
  return number >= 0 ? number : null;
}

function getFirstIdeaShown() {
  const ideas = [...document.querySelectorAll('.idea')].map(el => ({
    el,
    top: el.getBoundingClientRect().top,
    bottom: el.getBoundingClientRect().bottom,
  }));
  const shown = ideas.filter(el => el.top > 20).sort((el1, el2) => el1.bottom > el2.bottom);

  if (shown.length > 0) return parseInt(shown[0].el.dataset.nbRefNumber, 10);
  else return parseInt(ideas[ideas.length - 1].el.dataset.nbRefNumber, 10);
}

function checkSequence(pos1, pos2, wasSequentialBefore) {
  // no info
  if (pos2.chapterNum === null) return wasSequentialBefore;

  // new book
  if (pos1.chapterNum === null && pos2.chapterNum !== null) return true;

  const scrollStep = getScrollStep();
  if (wasSequentialBefore) {
    // new chapter
    if (pos2.chapterNum - pos1.chapterNum === 1 && pos2.idea <= 3) return true;

    // same chapter
    if (pos1.chapterNum === pos2.chapterNum) {
      // ~consecutive numbers
      if (Math.abs(pos2.idea - pos1.idea) < 3) return true;

      // 1.5 scrollSteps down or up
      const top1 = document.getElementById(`idea${pos1.idea}`).getBoundingClientRect().top;
      const top2 = document.getElementById(`idea${pos2.idea}`).getBoundingClientRect().top;

      if (Math.abs(top2 - top1) < 1.5 * scrollStep) return true;
    }
  } else {
    if (pos1.chapterNum === pos2.chapterNum) {
      // is back on screen
      const top1 = document.getElementById(`idea${pos1.idea}`).getBoundingClientRect().top;

      if (top1 > 0 && top1 < scrollStep * 0.75) return true;
    }
  }

  return false;
}

function setUriIdea(id) {
  window.history.replaceState(undefined, undefined, `#idea${id}`);
}

function highlightIdea(id) {
  const classList = document.getElementById(`idea${id}`).classList;
  const className = 'highlighted';

  classList.add(className);
  window.setTimeout(() => {
    classList.remove(className);
  }, 1000);
}

const mapStateToProps = state => {
  return {
    config: state.navigation.config,
    readingOrder: state.navigation.readingOrder,
    position: state.navigation.position,
    sequential: state.navigation.sequential,
    sequentialPosition: state.navigation.sequentialPosition,
    manifest: state.manifest,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setPosition: reducer.setPosition,
      setReadingOrder: reducer.setReadingOrder,
    },
    dispatch
  );
};

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);
