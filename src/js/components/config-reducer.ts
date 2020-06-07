import { IAnnotationStyles, IAnnotationFormat } from './annotations/reducer';

const HIDE_ONBOARDING = 'nb-base/offline/HIDE_ONBOARDING';
const SHOW_ONBOARDING = 'nb-base/offline/SHOW_ONBOARDING';
const TOGGLE_PROGRESS_DISPLAY = 'nb-base/offline/TOGGLE_PROGRESS_DISPLAY';
const SET_FONT_SIZE = 'nb-base/offline/SET_FONT_SIZE';

export enum ProgressKind {
  MinutesInChapter = 'displayMinutesInChapter',
  PercentRead = 'displayPercentRead',
  Position = 'displayPosition',
}

export enum ShowOnboarding {
  Disabled,
  Enabled,
  Initial,
}

export interface IState {
  showOnboarding: ShowOnboarding;

  displayMinutesInChapter: boolean;
  displayPercentRead: boolean;
  displayPosition: boolean;

  fontSize: string;

  annotationStyles: IAnnotationStyles;

  keyboardNav: boolean;
  invisibleNav: boolean;
}

const INITIAL_STATE: IState = {
  showOnboarding: ShowOnboarding.Initial,
  displayMinutesInChapter: true,
  displayPercentRead: true,
  displayPosition: true,
  fontSize: '1',
  annotationStyles: {
    quickNote: {
      format: IAnnotationFormat.Secondary,
      symbol: '◽',
    },
    styles: [
      {
        format: IAnnotationFormat.Default,
        symbol: '✅',
      },
      {
        format: IAnnotationFormat.Default,
        symbol: '🚩',
      },
      {
        format: IAnnotationFormat.Default,
        symbol: '👍',
      },
      {
        format: IAnnotationFormat.Default,
        symbol: '😳',
      },
    ],
  },
  keyboardNav: true,
  invisibleNav: true,
};

export function reducer(state: IState = INITIAL_STATE, action: Actions) {
  switch (action.type) {
    case SHOW_ONBOARDING:
      return { ...state, ...{ showOnboarding: ShowOnboarding.Enabled } };
    case HIDE_ONBOARDING:
      return { ...state, ...{ showOnboarding: ShowOnboarding.Disabled } };
    case TOGGLE_PROGRESS_DISPLAY:
      return {
        ...state,
        ...{ [action.payload]: !state[action.payload] },
      };
    case SET_FONT_SIZE:
      return { ...state, ...{ fontSize: action.payload.size } };
    default:
      return state;
  }
}

reducer.showOnboarding = function() {
  return <const>{
    type: SHOW_ONBOARDING,
  };
};

reducer.hideOnboarding = function() {
  return <const>{
    type: HIDE_ONBOARDING,
  };
};

reducer.toggleDisplay = function(kind: ProgressKind) {
  return <const>{
    type: TOGGLE_PROGRESS_DISPLAY,
    payload: kind,
  };
};

reducer.setFontSize = function(size: string) {
  return <const>{
    type: SET_FONT_SIZE,
    payload: { size },
  };
};

export type Actions = ReturnType<
  | typeof reducer.showOnboarding
  | typeof reducer.hideOnboarding
  | typeof reducer.toggleDisplay
  | typeof reducer.setFontSize
>;
