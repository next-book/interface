const ADD_ANNOTATION = 'interface/annotations/ADD_ANNOTATION';
const UPDATE_ANNOTATION = 'interface/annotations/UPDATE_ANNOTATION';
const DESTROY_ANNOTATION = 'interface/annotations/DESTROY_ANNOTATION';
const ADD_NOTE = 'interface/annotations/ADD_NOTE';
const UPDATE_NOTE = 'interface/annotations/UPDATE_NOTE';
const DESTROY_NOTE = 'interface/annotations/DESTROY_NOTE';

export interface IAnnotationStyle {
  color: string | null;
  backgroundColor: string | null;
  symbol: string;
  name: string;
  quick: boolean;
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
  file: string;
  style: IAnnotationStyle;
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
  file: string;
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

export const bgColors = [
  '#ffadad',
  '#ffd6a5',
  '#fdffb6',
  '#caffbf',
  '#9bf6ff',
  '#a0c4ff',
  '#bdb2ff',
  '#ffc6ff',
  '#eeeeee',
];

export const textColors = ['#edae49', '#d1495b', '#00798c', '#30638e', '#003d5b'];

const INITIAL_STATE: IState = {};

export function reducer(state: IState = INITIAL_STATE, action: Actions) {
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
  const notes = state[note.file] ? state[note.file].notes : {};

  newState[note.file] = {
    ...newState[note.file],
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
  newState[payload.file].notes[note.id] = note;

  return newState;
}

function destroyNote(state: IState, payload: INote) {
  const note = { ...payload };

  const newState = { ...state };
  delete newState[note.file].notes[note.id];

  return newState;
}

function addAnnotation(state: IState, payload: IAnnotationAndIdeas) {
  const { annotation, ideas } = payload;
  annotation.dateCreated = new Date().getTime();
  annotation.dateModified = new Date().getTime();

  const newState = { ...state };
  const annotations = state[annotation.file] ? state[annotation.file].annotations : {};

  newState[annotation.file] = {
    ...newState[annotation.file],
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

  newState[annotation.file].annotations[annotation.id] = {
    ...annotation,
    dateModified: new Date().getTime(),
  };
  newState[annotation.file].ideas = ideas;
  return newState;
}

function destroyAnnotation(state: IState, payload: IAnnotationAndIdeas) {
  const { annotation, ideas } = payload;

  const newState = { ...state };
  delete newState[annotation.file].annotations[annotation.id];

  newState[annotation.file].ideas = ideas;

  return newState;
}

reducer.addNote = function (data: INote) {
  return <const>{
    type: ADD_NOTE,
    payload: data,
  };
};

reducer.updateNote = function (data: INote) {
  return <const>{
    type: UPDATE_NOTE,
    payload: data,
  };
};

reducer.destroyNote = function (data: INote) {
  return <const>{
    type: DESTROY_NOTE,
    payload: data,
  };
};

reducer.addAnnotation = function (data: IAnnotationAndIdeas) {
  return <const>{
    type: ADD_ANNOTATION,
    payload: data,
  };
};

reducer.updateAnnotation = function (data: IAnnotationAndIdeas) {
  return <const>{
    type: UPDATE_ANNOTATION,
    payload: data,
  };
};

reducer.destroyAnnotation = function (data: IAnnotationAndIdeas) {
  return <const>{
    type: DESTROY_ANNOTATION,
    payload: data,
  };
};

export type Actions = ReturnType<
  | typeof reducer.addNote
  | typeof reducer.updateNote
  | typeof reducer.destroyNote
  | typeof reducer.addAnnotation
  | typeof reducer.updateAnnotation
  | typeof reducer.destroyAnnotation
>;
