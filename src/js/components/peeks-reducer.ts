const ADD_PEEK = 'interface/peeks/ADD_PEEK';
const DESTROY_PEEK = 'interface/peeks/DESTROY_PEEK';

export interface IPeek {
  title: string;
  content: string;
  source: string;
  showSource: boolean;
  hash: number;
}

export type IState = IPeek[];

const INITIAL_STATE: IState = [];

export function reducer(state: IState = INITIAL_STATE, action: Actions) {
  switch (action.type) {
    case ADD_PEEK:
      return addPeek(state, action.payload);
    case DESTROY_PEEK:
      return destroyPeek(state, action.payload);
    default:
      return state;
  }
}

function getHash(str: string): number {
  var hash = 0,
    i,
    chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

function addPeek(state: IState, payload: IPeek) {
  const hash = getHash('' + payload.title + payload.content);

  return [
    ...state.filter(peek => peek.hash !== hash),
    {
      title: payload.title,
      content: payload.content,
      source: payload.source,
      showSource: payload.showSource,
      hash,
    },
  ];
}

function destroyPeek(state: IState, payload: number) {
  return state.filter((peek: IPeek) => peek.hash !== payload);
}

reducer.addPeek = function(data: IPeek) {
  return <const>{
    type: ADD_PEEK,
    payload: data,
  };
};

reducer.destroyPeek = function(data: number) {
  return <const>{
    type: DESTROY_PEEK,
    payload: data,
  };
};

export type Actions = ReturnType<typeof reducer.addPeek | typeof reducer.destroyPeek>;
