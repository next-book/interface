import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import keycode from 'keycode';
import PropTypes from 'prop-types';

import reducer from './navigation-reducer';
import FullScreen from './full-screen';

class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.handleKeyboardNav = this.handleKeyboardNav.bind(this);
    this.handleInvisibleNav = this.handleInvisibleNav.bind(this);
  }

  handleScroll() {
    this.props.setPosition(getPosition());
    this.props.setFirstIdeaInView(getFirstIdeaShown());
    setUriIdea(this.props.navigation.firstIdeaInView);
  }

  handleKeyboardNav(event) {
    switch (keycode(event)) {
      case 'left':
        return moveBackward(
          event,
          this.props.navigation.readingOrder[this.props.navigation.chapter].prev
        );
      case 'right':
        return moveForward(
          event,
          this.props.navigation.readingOrder[this.props.navigation.chapter].next
        );
      default:
        return;
    }
  }

  handleInvisibleNav(event) {
    if (event.target === document.querySelector('html')) {
      if (window.innerWidth / 2 > event.clientX) {
        return moveBackward(
          event,
          this.props.navigation.readingOrder[this.props.navigation.chapter].prev
        );
      } else {
        return moveForward(
          event,
          this.props.navigation.readingOrder[this.props.navigation.chapter].next
        );
      }
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', debounce(this.handleScroll, 500));
    if (this.props.navigation.config.keyboardNav) {
      window.document.body.addEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.navigation.config.invisibleNav) {
      window.document.addEventListener('click', this.handleInvisibleNav);
    }

    this.props.setReadingOrder(this.props.spine.documents);
    this.props.setChapter(getChapter());
    this.props.setPosition(getPosition());
    setUriIdea(this.props.navigation.firstIdeaInView);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', debounce);
    if (this.props.navigation.config.keyboardNav) {
      window.document.body.removeEventListener('keydown', this.handleKeyboardNav);
    }
    if (this.props.navigation.config.invisibleNav) {
      window.document.body.removeEventListener('click', this.handleInvisibleNav);
    }
  }

  render() {
    const nav = this.props.navigation;
    if (nav.readingOrder == undefined) return null;

    const chapter = nav.readingOrder[nav.chapter];
    const { totalWords } = nav.readingOrder[nav.readingOrder.length - 1];

    return (
      <nav>
        <CatchWord />
        <NavBar
          readingOrder={nav.readingOrder}
          chapter={chapter}
          position={nav.position}
          totalWords={totalWords}
        />
        <TopBar spine={this.props.spine} chapter={chapter} />
        <ChapterLink rel="prev" chapter={chapter} />
        <ChapterLink rel="next" chapter={chapter} />
      </nav>
    );
  }
}

Navigation.propTypes = {
  spine: PropTypes.shape({
    documents: PropTypes.arrayOf(PropTypes.object),
  }),
  setPosition: PropTypes.func.isRequired,
  setFirstIdeaInView: PropTypes.func.isRequired,
  setReadingOrder: PropTypes.func.isRequired,
  setChapter: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

function CatchWord(props) {
  return <div className="catchword-bar" />;
}

function NavBar(props) {
  return (
    <ul className="nav-bar">
      <Pointer position={props.position} chapter={props.chapter} totalWords={props.totalWords} />
      {props.readingOrder.map((chapter, index) => (
        <Chapter key={chapter.order} chapter={chapter} totalWords={props.totalWords} />
      ))}
    </ul>
  );
}

NavBar.propTypes = {
  position: PropTypes.number.isRequired,
  chapter: PropTypes.object.isRequired,
  totalWords: PropTypes.number.isRequired,
  readingOrder: PropTypes.array.isRequired,
};

function Pointer(props) {
  const { offset, width } = getChapterPixels(props.chapter, props.totalWords);
  const left = offset + width * props.position;

  return <li className="pointer" style={{ left: left + '%' }} />;
}

Pointer.propTypes = {
  position: PropTypes.number.isRequired,
  chapter: PropTypes.object.isRequired,
  totalWords: PropTypes.number.isRequired,
};

function TopBar(props) {
  return (
    <div className="top-bar">
      <p className="chapter">
        {props.chapter.order} / {props.chapter.title}
      </p>
      <p className="book">
        <a href="./index.html">{props.spine.title}</a>
        <FullScreen />
      </p>
    </div>
  );
}

TopBar.propTypes = {
  spine: PropTypes.shape({
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
        {props.chapter.order}: {props.chapter.title}
      </span>
    </li>
  );
}

Chapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  totalWords: PropTypes.number.isRequired,
};

class ChapterLink extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    switch (this.props.rel) {
      case 'next':
        return moveForward(event, this.props.chapter.next);
      case 'prev':
        return moveBackward(event, this.props.chapter.prev);
      default:
        return;
    }
  }

  render() {
    if (this.props.chapter[this.props.rel]) {
      return (
        <a
          className={this.props.rel}
          href={`./${this.props.chapter[this.props.rel]}`}
          title={this.props.rel == 'next' ? 'next chapter' : 'previous chapter'}
          onClick={this.handleClick}
        >
          {this.props.rel == 'next' ? '>' : '<'}
        </a>
      );
    } else {
      return null;
    }
  }
}

ChapterLink.propTypes = {
  rel: PropTypes.string.isRequired,
  chapter: PropTypes.object.isRequired,
};

function moveForward(event, nextChapter) {
  event.preventDefault();

  if (!isPageScrolledToBottom()) window.scrollTo(window.scrollX, window.scrollY + getScrollStep());
  else if (nextChapter) window.location.href = nextChapter;
}

function moveBackward(event, prevChapter) {
  event.preventDefault();

  if (!isPageScrolledToTop()) window.scrollTo(window.scrollX, window.scrollY - getScrollStep());
  else if (prevChapter) window.location.href = prevChapter;
}

function isPageScrolledToBottom() {
  return window.innerHeight + Math.ceil(window.scrollY) >= document.body.scrollHeight;
}

function isPageScrolledToTop() {
  return Math.floor(window.scrollY) == 0;
}

function getScrollStep() {
  return window.innerHeight - document.querySelector('.catchword-bar').offsetHeight;
}

function getChapterPixels(chapter, totalWords) {
  if (!chapter || !totalWords) return { offset: 0, width: 0 };

  const offset = (chapter.offsetWords / totalWords) * 100;
  const width = (chapter.words / totalWords) * 100;

  return { offset, width };
}

function getPosition() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

function getChapter() {
  const el = document.querySelector('meta[name="order"]');
  return el ? parseInt(el.getAttribute('content'), 10) : 0;
}

function getFirstIdeaShown() {
  const shown = [...document.querySelectorAll('.idea')]
    .map(el => ({
      el,
      top: el.getBoundingClientRect().top,
      bottom: el.getBoundingClientRect().bottom,
    }))
    .filter(el => el.bottom > 20)
    .sort((el1, el2) => el1.bottom > el2.bottom);

  if (shown.length > 0) return parseInt(shown[0].el.dataset.nbRefNumber, 10);
  else return null;
}

function setUriIdea(id) {
  window.history.replaceState(undefined, undefined, `#idea${id}`);
}

const mapStateToProps = state => {
  return {
    navigation: state.navigation,
    spine: state.spine,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setChapter: reducer.setChapter,
      setPosition: reducer.setPosition,
      setFirstIdeaInView: reducer.setFirstIdeaInView,
      setReadingOrder: reducer.setReadingOrder,
    },
    dispatch
  );
};

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);
