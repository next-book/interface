const ADD_ANNOTATION = 'nb-base/annotations/ADD_ANNOTATION';
const DESTROY_ANNOTATION = 'nb-base/annotations/DESTROY_ANNOTATION';

export enum IStyle {
  Default,
  Extra,
}

export interface IAnnotation {
  // dateCreated:
  // dateEdited:
  id: number;
  chapterNum: string;
  symbol: string;
  format: IStyle;
  note: string;
  links: string[];
}

export type IIdeas = {
  [key: string]: string;
};

export interface IAnnotations {
  [key: number]: IAnnotation;
}

export interface INewAnnotation extends IAnnotation {
  ideas: IIdeas;
}

export interface IAnnotationSet {
  annotations: IAnnotations;
  ideas: IIdeas;
}

export interface IState {
  [key: string]: IAnnotationSet;
}

const INITIAL_STATE: IState = {};

export function reducer(state: IState = INITIAL_STATE, action: any) {
  switch (action.type) {
    case ADD_ANNOTATION:
      return addAnnotation(state, action.payload);
    case DESTROY_ANNOTATION:
      return destroyAnnotation(state, action.payload);
    default:
      return state;
  }
}

function addAnnotation(state: IState, payload: INewAnnotation) {
  const newState = { ...state };
  const annotations = state[payload.chapterNum] ? state[payload.chapterNum].annotations : {};

  newState[payload.chapterNum] = {
    annotations: {
      ...annotations,
      [payload.id]: {
        id: payload.id,
        chapterNum: payload.chapterNum,
        symbol: payload.symbol,
        format: payload.format,
        note: payload.note,
        links: [],
      },
    },
    ideas: payload.ideas,
  };

  return newState;
}

function destroyAnnotation(state: IState, payload: number) {
  return state;
  //  ...state,
  //  annotations: state.annotations.filter((item: IAnnotation, index: number) => index !== payload),
  //}
}

reducer.addAnnotation = function(data: INewAnnotation) {
  return {
    type: ADD_ANNOTATION,
    payload: data,
  };
};

reducer.destroyAnnotation = function(data: number) {
  return {
    type: DESTROY_ANNOTATION,
    payload: data,
  };
};

export type Action = ReturnType<typeof reducer.addAnnotation | typeof reducer.destroyAnnotation>;
