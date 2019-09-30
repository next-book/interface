const SET_CHAPTER_NUM = 'nb-base/navigation/SET_CHAPTER_NUM';
const SET_POSITION = 'nb-base/navigation/SET_POSITION';
const SET_FIRST_IDEA = 'nb-base/navigation/SET_FIRST_IDEA';
const SET_READING_ORDER = 'nb-base/navigation/SET_READING_ORDER';

const defaultState = {
  chapterNum: 0,
  position: 0,
  firstIdeaInView: 1,
  readingOrder: [],
  config: {
    keyboardNav: true,
    invisibleNav: true,
  },
};

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET_CHAPTER_NUM:
      return { ...state, ...{ chapterNum: parseInt(action.payload, 10) } };
    case SET_POSITION:
      return { ...state, ...{ position: parseFloat(action.payload) } };
    case SET_FIRST_IDEA:
      return { ...state, ...{ firstIdeaInView: parseInt(action.payload, 10) } };
    case SET_READING_ORDER:
      return { ...state, ...{ readingOrder: prepReadingOrder(action.payload) } };
    default:
      return state;
  }
}

function prepReadingOrder(documents) {
  let totalChars = 0;
  let totalWords = 0;

  return documents
    .filter(doc => doc.isChapter)
    .sort((a, b) => a.order - b.order)
    .map(doc => {
      const offsetChars = totalChars;
      const offsetWords = totalWords;

      totalChars += doc.chars;
      totalWords += doc.words;

      return { ...doc, offsetChars, offsetWords, totalChars, totalWords };
    });
}

reducer.setReadingOrder = function(documents) {
  return {
    type: SET_READING_ORDER,
    payload: documents,
  };
};

reducer.setPosition = function(position) {
  return {
    type: SET_POSITION,
    payload: position,
  };
};

reducer.setFirstIdeaInView = function(firstIdea) {
  return {
    type: SET_FIRST_IDEA,
    payload: firstIdea,
  };
};

reducer.setChapterNum = function(pos) {
  return {
    type: SET_CHAPTER_NUM,
    payload: pos,
  };
};

module.exports = reducer;
