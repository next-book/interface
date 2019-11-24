const SET_OFFLINE_AVAILABILITY = 'nb-base/offline/SET_OFFLINE_AVAILABILITY';
const SET_CACHE_AVAILABILITY = 'nb-base/offline/SET_CACHE_AVAILABILITY';

const defaultState = {
  offlineIsAvailable: false,
  cacheIsAvailable: false,
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET_OFFLINE_AVAILABILITY:
      return { ...state, ...{ offlineIsAvailable: action.payload } };
    case SET_CACHE_AVAILABILITY:
      return { ...state, ...{ cacheIsAvailable: action.payload } };
    default:
      return state;
  }
}

reducer.setOfflineAvailability = function(status) {
  return {
    type: SET_OFFLINE_AVAILABILITY,
    payload: status,
  };
};

reducer.setCacheAvailability = function(status) {
  return {
    type: SET_CACHE_AVAILABILITY,
    payload: status,
  };
};
