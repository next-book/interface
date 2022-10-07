import { init as initTracking } from './tracker';

const DENY_CONSENT = 'interface/research/DENY_CONSENT';
const GRANT_CONSENT = 'interface/research/GRANT_CONSENT';

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
    case DENY_CONSENT:
      return { ...state, consent: Consent.Denied };
    case GRANT_CONSENT:
      return { ...state, consent: Consent.Granted };
    default:
      return state;
  }
}

reducer.denyConsent = function () {
  return <const>{
    type: DENY_CONSENT,
  };
};

reducer.grantConsent = function (ga: string, id: string) {
  initTracking(ga, id);

  return <const>{
    type: GRANT_CONSENT,
  };
};

export type Actions = ReturnType<typeof reducer.grantConsent | typeof reducer.denyConsent>;
