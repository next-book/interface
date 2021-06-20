const UPDATE_CONSENT = 'interface/annotations/UPDATE_CONSENT';

export enum Consent {
  Granted,
  Denied,
  None,
}

export interface IState {
  consent: Consent;
}

const INITIAL_STATE: IState = {
  consent: Consent.None,
};

export function reducer(state: IState = INITIAL_STATE, action: Actions) {
  switch (action.type) {
    case UPDATE_CONSENT:
      return { ...state, consent: action.payload };
    default:
      return state;
  }
}

reducer.updateConsent = function(data: boolean) {
  return <const>{
    type: UPDATE_CONSENT,
    payload: data,
  };
};

export type Actions = ReturnType<typeof reducer.updateConsent>;
