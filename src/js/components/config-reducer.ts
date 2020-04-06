import { IAnnotationStyles, IAnnotationFormat } from './annotations/reducer';

const TOGGLE_ONBOARDING = 'nb-base/offline/TOGGLE_ONBOARDING';
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
        symbol: '❌',
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
    case TOGGLE_ONBOARDING:
      const newState =
        state.showOnboarding === ShowOnboarding.Disabled
          ? ShowOnboarding.Enabled
          : ShowOnboarding.Disabled;

      return { ...state, ...{ showOnboarding: newState } };
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

reducer.toggleOnboarding = function() {
  return <const>{
    type: TOGGLE_ONBOARDING,
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
  typeof reducer.toggleOnboarding | typeof reducer.toggleDisplay | typeof reducer.setFontSize
>;
