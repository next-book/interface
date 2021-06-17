const SET_SW_AVAILABILITY = 'interface/offline/SET_SW_AVAILABILITY';
const SET_CACHE_AVAILABILITY = 'interface/offline/SET_CACHE_AVAILABILITY';

export enum SwAvailability {
  Initial,
  Unsecure,
  NoSw,
  Available,
}

export interface IState {
  swIsAvailable: SwAvailability;
  cacheIsAvailable: boolean;
}

const INITIAL_STATE: IState = {
  swIsAvailable: SwAvailability.Initial,
  cacheIsAvailable: false,
};

export function reducer(state = INITIAL_STATE, action: Actions) {
  switch (action.type) {
    case SET_SW_AVAILABILITY:
      return { ...state, ...{ swIsAvailable: action.payload } };
    case SET_CACHE_AVAILABILITY:
      return { ...state, ...{ cacheIsAvailable: action.payload } };
    default:
      return state;
  }
}

reducer.setSwAvailability = (status: SwAvailability) => {
  return <const>{
    type: SET_SW_AVAILABILITY,
    payload: status,
  };
};

reducer.setCacheAvailability = (status: boolean) => {
  return <const>{
    type: SET_CACHE_AVAILABILITY,
    payload: status,
  };
};

export type Actions = ReturnType<
  typeof reducer.setSwAvailability | typeof reducer.setCacheAvailability
>;
