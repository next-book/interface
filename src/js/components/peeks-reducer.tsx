const ADD_PEEK = 'nb-base/peeks/ADD_PEEK';
const DESTROY_PEEK = 'nb-base/peeks/DESTROY_PEEK';

export interface IPeek {
  title: string;
  content: string | object;
  source: string;
  showSource: boolean;
}

export type IState = IPeek[];

const INITIAL_STATE: IState = [];

export function reducer(state: IState = INITIAL_STATE, action: any) {
  switch (action.type) {
    case ADD_PEEK:
      return addPeek(state, action.payload);
    case DESTROY_PEEK:
      return destroyPeek(state, action.payload);
    default:
      return state;
  }
}

function addPeek(state: IState, payload: IPeek) {
  return [
    ...state,
    {
      title: payload.title,
      content: payload.content,
      source: payload.source,
      showSource: payload.showSource,
    },
  ];
}

function destroyPeek(state: IState, payload: number) {
  return state.filter((item: IPeek, index: number) => index !== payload);
}

reducer.addPeek = function(data: IPeek) {
  return {
    type: ADD_PEEK,
    payload: data,
  };
};

reducer.destroyPeek = function(data: number) {
  return {
    type: DESTROY_PEEK,
    payload: data,
  };
};

export type Action = ReturnType<typeof reducer.addPeek | typeof reducer.destroyPeek>;
