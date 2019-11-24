const ADD_PEEK = 'nb-base/peeks/ADD_PEEK';
const DESTROY_PEEK = 'nb-base/peeks/DESTROY_PEEK';

const defaultState = [];

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case ADD_PEEK:
      return addPeek(state, action.payload);
    case DESTROY_PEEK:
      return destroyPeek(state, action.payload);
    default:
      return state;
  }
}

function addPeek(state, payload) {
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

function destroyPeek(state, payload) {
  return state.filter((item, index) => index !== payload);
}

reducer.addPeek = function(data) {
  return {
    type: ADD_PEEK,
    payload: data,
  };
};

reducer.destroyPeek = function(data) {
  return {
    type: DESTROY_PEEK,
    payload: data,
  };
};
