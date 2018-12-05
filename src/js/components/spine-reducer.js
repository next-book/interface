const SET_SPINE_DATA = 'nb-base/spine/SET_SPINE_DATA';

function reducer(state = {}, action = {}) {
  switch (action.type) {
    case SET_SPINE_DATA:
      return action.payload;
    default:
      return state;
  }
}

reducer.setSpineData = function(data) {
  return {
    type: SET_SPINE_DATA,
    payload: data,
  };
};

module.exports = reducer;
