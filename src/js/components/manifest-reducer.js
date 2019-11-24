const SET_SPINE_DATA = 'nb-base/manifest/SET_SPINE_DATA';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case SET_SPINE_DATA:
      return action.payload;
    default:
      return state;
  }
}

reducer.setManifestData = function(data) {
  return {
    type: SET_SPINE_DATA,
    payload: data,
  };
};
