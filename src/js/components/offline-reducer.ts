const SET_OFFLINE_AVAILABILITY = 'nb-base/offline/SET_OFFLINE_AVAILABILITY';
const SET_CACHE_AVAILABILITY = 'nb-base/offline/SET_CACHE_AVAILABILITY';

export interface IState {
  offlineIsAvailable: boolean;
  cacheIsAvailable: boolean;
}

const INITIAL_STATE: IState = {
  offlineIsAvailable: false,
  cacheIsAvailable: false,
};

export function reducer(state = INITIAL_STATE, action: Actions) {
  switch (action.type) {
    case SET_OFFLINE_AVAILABILITY:
      return { ...state, ...{ offlineIsAvailable: action.payload } };
    case SET_CACHE_AVAILABILITY:
      return { ...state, ...{ cacheIsAvailable: action.payload } };
    default:
      return state;
  }
}

reducer.setOfflineAvailability = function(status: boolean) {
    type: SET_OFFLINE_AVAILABILITY,
  return <const>{
    payload: status,
  };
};

reducer.setCacheAvailability = function(status: boolean) {
  return <const>{
    type: SET_CACHE_AVAILABILITY,
    payload: status,
  };
};

  typeof reducer.setOfflineAvailability | typeof reducer.setCacheAvailability
export type Actions = ReturnType<
>;
