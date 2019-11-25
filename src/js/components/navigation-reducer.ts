import { IDocument } from './manifest-reducer';

const SET_POSITION = 'nb-base/navigation/SET_POSITION';
const SET_SCROLL_RATIO = 'nb-base/navigation/SET_SCROLL_RATIO';
const SET_READING_ORDER = 'nb-base/navigation/SET_READING_ORDER';

export interface IState {
  scrollRatio: number;
  position: IPosition;
  sequentialPosition: IPosition;
  sequential: boolean | null;
  readingOrder: INavDocument[];
  config: IConfig;
}

export interface IConfig {
  keyboardNav: boolean;
  invisibleNav: boolean;
}

export interface IPosition {
  chapterNum: number | null;
  idea: number | null;
}

export interface INavDocument extends IDocument {
  offsetChars: number;
  offsetWords: number;
  totalChars: number;
  totalWords: number;
}

const INITIAL_STATE: IState = {
  scrollRatio: 0,
  position: {
    chapterNum: null,
    idea: null,
  },
  sequentialPosition: {
    chapterNum: null,
    idea: null,
  },
  sequential: null,
  readingOrder: [],
  config: {
    keyboardNav: true,
    invisibleNav: true,
  },
};

export function reducer(state = INITIAL_STATE, action: Action) {
  switch (action.type) {
    case SET_SCROLL_RATIO:
      return { ...state, ...{ scrollRatio: parseFloat(action.payload) } };
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

reducer.setScrollRatio = function(scrollRatio) {
  return {
    type: SET_SCROLL_RATIO,
    payload: scrollRatio,
  };
};

reducer.setPosition = function(chapterNum, idea, sequential) {
  return {
    type: SET_POSITION,
    payload: { chapterNum, idea, sequential },
  };
};

export type Action = ReturnType<
  typeof reducer.setReadingOrder | typeof reducer.setScrollRatio | typeof reducer.setPosition
>;
