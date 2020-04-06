import { IDocument, DocRole } from './manifest-reducer';
import { Sequential, SeqReturnStatus } from './seq-return';

const SET_POSITION = 'nb-base/navigation/SET_POSITION';
const SET_SCROLL_RATIO = 'nb-base/navigation/SET_SCROLL_RATIO';
const SET_READING_ORDER = 'nb-base/navigation/SET_READING_ORDER';

export interface IState {
  scrollRatio: number;
  position: IPosition | null;
  sequentialPosition: IPosition | null;
  sequential: Sequential;
  seqReturnStatus: SeqReturnStatus;
  readingOrder: string[];
  documents: IDocMap;
}

export interface IPosition {
  file: string;
  idea: number;
  chapterStart: boolean;
  chapterEnd: boolean;
}

export interface INavDocument extends IDocument {
  offsetChars: number;
  offsetWords: number;
  totalChars: number;
  totalWords: number;
}

export interface IDocMap {
  [key: string]: INavDocument;
}

const INITIAL_STATE: IState = {
  scrollRatio: 0,
  position: null,
  sequentialPosition: null,
  sequential: Sequential.Yes,
  seqReturnStatus: SeqReturnStatus.Initializing,
  readingOrder: [],
  documents: {},
};

export function reducer(state: IState = INITIAL_STATE, action: Actions) {
  switch (action.type) {
    case SET_SCROLL_RATIO:
      return { ...state, ...{ scrollRatio: action.payload } };
    case SET_POSITION:
      return setPosition(state, action.payload);
    case SET_READING_ORDER:
      return { ...state, ...prepReadingOrder(action.payload) };
    default:
      return state;
  }
}

function setPosition(
  state: IState,
  payload: { position: IPosition; sequential: Sequential; seqReturnStatus: SeqReturnStatus }
) {
  return {
    ...state,
    sequential: payload.sequential,
    sequentialPosition:
      payload.sequential !== Sequential.No ? payload.position : state.sequentialPosition,
    position: payload.position,
    seqReturnStatus: payload.seqReturnStatus,
  };
}

function prepReadingOrder(documents: IDocument[]) {
  let totalChars = 0;
  let totalWords = 0;

  const chapters = documents
    .filter(doc => doc.role === DocRole.Chapter)
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

  const other = documents
    .filter(doc => doc.role !== DocRole.Chapter)
    .map(doc => ({ ...doc, offsetChars: 0, offsetWords: 0, totalChars, totalWords }));

  return {
    readingOrder: chapters.map(doc => doc.file),
    documents: arrayToDocMap(chapters.concat(other)),
  };
}

function arrayToDocMap(arr: INavDocument[]) {
  return arr.reduce((acc: { [key: string]: INavDocument }, doc: INavDocument) => {
    acc[doc.file] = doc;
    return acc;
  }, {});
}

reducer.setReadingOrder = function(documents: IDocument[]) {
  return <const>{
    type: SET_READING_ORDER,
    payload: documents,
  };
};

reducer.setScrollRatio = function(scrollRatio: number) {
  return <const>{
    type: SET_SCROLL_RATIO,
    payload: scrollRatio,
  };
};

reducer.setPosition = function(
  position: IPosition,
  sequential: Sequential,
  seqReturnStatus: SeqReturnStatus
) {
  return <const>{
    type: SET_POSITION,
    payload: { position, sequential, seqReturnStatus },
  };
};

export type Actions = ReturnType<
  typeof reducer.setReadingOrder | typeof reducer.setScrollRatio | typeof reducer.setPosition
>;
