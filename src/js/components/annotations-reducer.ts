const ADD_ANNOTATION = 'nb-base/annotations/ADD_ANNOTATION';
const UPDATE_ANNOTATION = 'nb-base/annotations/UPDATE_ANNOTATION';
const DESTROY_ANNOTATION = 'nb-base/annotations/DESTROY_ANNOTATION';
const ADD_NOTE = 'nb-base/annotations/ADD_NOTE';
const UPDATE_NOTE = 'nb-base/annotations/UPDATE_NOTE';
const DESTROY_NOTE = 'nb-base/annotations/DESTROY_NOTE';

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

export interface INote {
  dateCreated: number;
  dateModified: number;
  id: number;
  text: string;
  chapterNum: string;
}

export interface INotes {
  [key: string]: INote;
}

export interface IAnnotationSet {
  annotations: IAnnotations;
  ideas: IIdeas;
  notes: INotes;
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
    case ADD_NOTE:
      return addNote(state, action.payload);
    case UPDATE_NOTE:
      return updateNote(state, action.payload);
    case DESTROY_NOTE:
      return destroyNote(state, action.payload);
    default:
      return state;
  }
}

function addNote(state: IState, payload: INote) {
  const note = { ...payload };
  note.dateCreated = new Date().getTime();
  note.dateModified = new Date().getTime();

  const newState = { ...state };
  const notes = state[note.chapterNum] ? state[note.chapterNum].notes : {};

  newState[note.chapterNum] = {
    ...newState[note.chapterNum],
    notes: {
      ...notes,
      [note.id]: note,
    },
  };

  return newState;
}

function updateNote(state: IState, payload: INote) {
  const note = { ...payload };
  note.dateModified = new Date().getTime();

  const newState = { ...state };
  newState[payload.chapterNum].notes[note.id] = note;

  return newState;
}

function destroyNote(state: IState, payload: INote) {
  const note = { ...payload };

  const newState = { ...state };
  console.log(newState);
  delete newState[note.chapterNum].notes[note.id];

  return newState;
}

function addAnnotation(state: IState, payload: IAnnotationAndIdeas) {
  const { annotation, ideas } = payload;
  annotation.dateCreated = new Date().getTime();
  annotation.dateModified = new Date().getTime();

  const newState = { ...state };
  const annotations = state[annotation.chapterNum] ? state[annotation.chapterNum].annotations : {};

  newState[annotation.chapterNum] = {
    ...newState[annotation.chapterNum],
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

  console.log(newState);
  return newState;
}

reducer.addNote = function(data: INote) {
  return {
    type: ADD_NOTE,
    payload: data,
  };
};

reducer.updateNote = function(data: INote) {
  return {
    type: UPDATE_NOTE,
    payload: data,
  };
};

reducer.destroyNote = function(data: INote) {
  return {
    type: DESTROY_NOTE,
    payload: data,
  };
};

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
  | typeof reducer.addNote
  | typeof reducer.updateNote
  | typeof reducer.destroyNote
  | typeof reducer.addAnnotation
  | typeof reducer.updateAnnotation
  | typeof reducer.destroyAnnotation
>;
