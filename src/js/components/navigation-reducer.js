const SET_POSITION = 'nb-base/navigation/SET_POSITION';
const SET_READING_ORDER = 'nb-base/navigation/SET_READING_ORDER';

const defaultState = {
  position: {
    chapterNum: null,
    scrollRatio: null,
    idea: null,
  },
  sequentialPosition: {
    chapterNum: null,
    scrollRatio: null,
    idea: null,
  },
  sequential: null,
  readingOrder: [],
  config: {
    keyboardNav: true,
    invisibleNav: true,
  },
};

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET_POSITION:
      return setPosition(state, action.payload);
    case SET_READING_ORDER:
      return { ...state, ...{ readingOrder: prepReadingOrder(action.payload) } };
    default:
      return state;
  }
}

function setPosition(state, payload) {
  const position = {
    chapterNum: parseInt(payload.chapterNum, 10),
    scrollRatio: parseFloat(payload.scrollRatio),
    idea: parseInt(payload.idea, 10),
  };

  if (isNaN(position.chapterNum) || isNaN(position.idea)) return { ...state };

  const sequentialPosition = payload.sequential ? position : state.sequentialPosition;

  return {
    ...state,
    sequential: payload.sequential,
    sequentialPosition,
    position,
  };
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

reducer.setPosition = function(chapterNum, idea, scrollRatio, sequential) {
  return {
    type: SET_POSITION,
    payload: { chapterNum, idea, scrollRatio, sequential },
  };
};

module.exports = reducer;
