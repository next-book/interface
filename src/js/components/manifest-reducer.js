const SET_SPINE_DATA = 'nb-base/manifest/SET_SPINE_DATA';

function reducer(state = {}, action = {}) {
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

module.exports = reducer;
