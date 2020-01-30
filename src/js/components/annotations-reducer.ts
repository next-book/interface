const ADD_ANNOTATION = 'nb-base/annotations/ADD_ANNOTATION';
const UPDATE_ANNOTATION = 'nb-base/annotations/UPDATE_ANNOTATION';
const DESTROY_ANNOTATION = 'nb-base/annotations/DESTROY_ANNOTATION';

export enum IStyle {
  Default = 'default',
  Secondary = 'secondary',
  Strong = 'strong',
}

export interface IIdeaRange {
  start: string;
  end: string;
}

export interface IAnnotation {
  dateCreated: number;
  dateModified: number;
  id: number;
  range: IIdeaRange;
  chapterNum: string;
  symbol: string;
  style: IStyle;
  note: string;
  links: string[];
}

export type IIdeas = {
  [key: string]: string;
};

export interface IAnnotations {
  [key: number]: IAnnotation;
}

export interface IAnnotationAndIdeas {
  annotation: IAnnotation;
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
    case UPDATE_ANNOTATION:
      return updateAnnotation(state, action.payload);
    case DESTROY_ANNOTATION:
      return destroyAnnotation(state, action.payload);
    default:
      return state;
  }
}

function addAnnotation(state: IState, payload: IAnnotationAndIdeas) {
  const { annotation, ideas } = payload;
  annotation.dateCreated = new Date().getTime();
  annotation.dateModified = new Date().getTime();

  const newState = { ...state };
  const annotations = state[annotation.chapterNum] ? state[annotation.chapterNum].annotations : {};

  newState[annotation.chapterNum] = {
    annotations: {
      ...annotations,
      [annotation.id]: annotation,
    },
    ideas: ideas,
  };

  return newState;
}

function updateAnnotation(state: IState, payload: IAnnotationAndIdeas) {
  const { annotation, ideas } = payload;

  const newState = { ...state };
  newState[annotation.chapterNum].annotations[annotation.id] = {
    ...annotation,
    dateModified: new Date().getTime(),
  };
  newState[annotation.chapterNum].ideas = ideas;
  return newState;
}

function destroyAnnotation(state: IState, payload: IAnnotationAndIdeas) {
  const { annotation, ideas } = payload;

  const newState = { ...state };
  delete newState[annotation.chapterNum].annotations[annotation.id];

  newState[annotation.chapterNum].ideas = ideas;
  return newState;
}

reducer.addAnnotation = function(data: IAnnotationAndIdeas) {
  return {
    type: ADD_ANNOTATION,
    payload: data,
  };
};

reducer.updateAnnotation = function(data: IAnnotationAndIdeas) {
  return {
    type: UPDATE_ANNOTATION,
    payload: data,
  };
};

reducer.destroyAnnotation = function(data: IAnnotationAndIdeas) {
  return {
    type: DESTROY_ANNOTATION,
    payload: data,
  };
};

export type Action = ReturnType<
  typeof reducer.addAnnotation | typeof reducer.updateAnnotation | typeof reducer.destroyAnnotation
>;
