import { IDocument } from './manifest-reducer';

const SET_POSITION = 'nb-base/navigation/SET_POSITION';
const SET_SCROLL_RATIO = 'nb-base/navigation/SET_SCROLL_RATIO';
const SET_READING_ORDER = 'nb-base/navigation/SET_READING_ORDER';

export interface IState {
  scrollRatio: number;
  position: IPosition | null;
  sequentialPosition: IPosition | null;
  sequential: boolean;
  readingOrder: INavDocument[];
  config: IConfig;
}

export interface IConfig {
  keyboardNav: boolean;
  invisibleNav: boolean;
}

export interface IPosition {
  chapterNum: number;
  idea: number;
}

export interface INavDocument extends IDocument {
  offsetChars: number;
  offsetWords: number;
  totalChars: number;
  totalWords: number;
}

const INITIAL_STATE: IState = {
  scrollRatio: 0,
  position: null,
  sequentialPosition: null,
  sequential: true,
  readingOrder: [],
  config: {
    keyboardNav: true,
    invisibleNav: true,
  },
};

export function reducer(state: IState = INITIAL_STATE, action: any) {
  switch (action.type) {
    case SET_SCROLL_RATIO:
      return { ...state, ...{ scrollRatio: action.payload } };
    case SET_POSITION:
      return setPosition(state, action.payload);
    case SET_READING_ORDER:
      return { ...state, ...{ readingOrder: prepReadingOrder(action.payload) } };
    default:
      return state;
  }
}

function setPosition(
  state: IState,
  payload: { chapterNum: number; idea: number; sequential: boolean }
) {
  const position = { chapterNum: payload.chapterNum, idea: payload.idea };

  return {
    ...state,
    sequential: payload.sequential,
    sequentialPosition: payload.sequential ? position : state.sequentialPosition,
    position,
  };
}

function prepReadingOrder(documents: IDocument[]) {
  let totalChars = 0;
  let totalWords = 0;

  return documents
    .filter(doc => doc.isChapter)
    .sort((a, b) => {
      const oA = a.order !== null ? a.order : -1;
      const oB = b.order !== null ? b.order : -1;

      return oA - oB;
    })
    .map(doc => {
      const offsetChars = totalChars;
      const offsetWords = totalWords;

      totalChars += doc.chars;
      totalWords += doc.words;

      return { ...doc, offsetChars, offsetWords, totalChars, totalWords };
    });
}

reducer.setReadingOrder = function(documents: IDocument[]) {
  return {
    type: SET_READING_ORDER,
    payload: documents,
  };
};

reducer.setScrollRatio = function(scrollRatio: number) {
  return {
    type: SET_SCROLL_RATIO,
    payload: scrollRatio,
  };
};

reducer.setPosition = function(chapterNum: number, idea: number, sequential: boolean) {
  return {
    type: SET_POSITION,
    payload: { chapterNum, idea, sequential },
  };
};

export type Action = ReturnType<
  typeof reducer.setReadingOrder | typeof reducer.setScrollRatio | typeof reducer.setPosition
>;
