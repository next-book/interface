const TOGGLE_PROGRESS_DISPLAY = 'nb-base/offline/TOGGLE_PROGRESS_DISPLAY';

export enum ProgressKind {
  MinutesInChapter = 'displayMinutesInChapter',
  PercentRead = 'displayPercentRead',
  Position = 'displayPosition',
}

export interface IState {
  displayMinutesInChapter: boolean;
  displayPercentRead: boolean;
  displayPosition: boolean;
}

const INITIAL_STATE: IState = {
  displayMinutesInChapter: true,
  displayPercentRead: true,
  displayPosition: true,
};

export function reducer(state = INITIAL_STATE, action: Action) {
  switch (action.type) {
    case TOGGLE_PROGRESS_DISPLAY:
      return { ...state, ...{ [action.payload.kind]: !state[action.payload.kind] } };
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

export type Action = ReturnType<typeof reducer.toggleDisplay>;
