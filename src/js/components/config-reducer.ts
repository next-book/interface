const TOGGLE_PROGRESS_DISPLAY = 'nb-base/offline/TOGGLE_PROGRESS_DISPLAY';
const SET_FONT_SIZE = 'nb-base/offline/SET_FONT_SIZE';

export enum ProgressKind {
  MinutesInChapter = 'displayMinutesInChapter',
  PercentRead = 'displayPercentRead',
  Position = 'displayPosition',
}

export interface IState {
  displayMinutesInChapter: boolean;
  displayPercentRead: boolean;
  displayPosition: boolean;
  fontSize: number;
}

const INITIAL_STATE: IState = {
  displayMinutesInChapter: true,
  displayPercentRead: true,
  displayPosition: true,
  fontSize: 1,
};

export function reducer(state: IState = INITIAL_STATE, action: any) {
  switch (action.type) {
    case TOGGLE_PROGRESS_DISPLAY:
      //TODO: rewrite with better use of TS (without action: any)
      switch (action.payload.kind) {
        case ProgressKind.MinutesInChapter:
          return {
            ...state,
            ...{ [ProgressKind.MinutesInChapter]: !state[ProgressKind.MinutesInChapter] },
          };
        case ProgressKind.PercentRead:
          return {
            ...state,
            ...{ [ProgressKind.PercentRead]: !state[ProgressKind.PercentRead] },
          };
        case ProgressKind.Position:
          return {
            ...state,
            ...{ [ProgressKind.Position]: !state[ProgressKind.Position] },
          };
      }
      return state;
    case SET_FONT_SIZE:
      return { ...state, ...{ fontSize: action.payload.size } };
    default:
      return state;
  }
}

reducer.toggleDisplay = function(kind: ProgressKind) {
  return {
    type: TOGGLE_PROGRESS_DISPLAY,
    payload: { kind },
  };
};

reducer.setFontSize = function(size: number) {
  return {
    type: SET_FONT_SIZE,
    payload: { size },
  };
};

export type Action =
  | ReturnType<typeof reducer.toggleDisplay>
  | ReturnType<typeof reducer.setFontSize>;
