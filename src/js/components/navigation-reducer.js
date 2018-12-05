const SET_CHAPTER = 'nb-base/navigation/SET_CHAPTER';
const SET_POSITION = 'nb-base/navigation/SET_POSITION';
const SET_FIRST_IDEA = 'nb-base/navigation/SET_FIRST_IDEA';

const defaultState = {
  chapter: 1,
  position: 0,
  firstIdeaInView: 1,
  config: {
    keyboardNav: true,
    invisibleNav: true,
  },
};

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET_CHAPTER:
      return { ...state, ...{ chapter: parseInt(action.payload, 10) } };
    case SET_POSITION:
      return { ...state, ...{ position: parseFloat(action.payload) } };
    case SET_FIRST_IDEA:
      return { ...state, ...{ firstIdeaInView: parseInt(action.payload, 10) } };
    default:
      return state;
  }
}

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

reducer.setChapter = function(pos) {
  return {
    type: SET_CHAPTER,
    payload: pos,
  };
};

module.exports = reducer;
