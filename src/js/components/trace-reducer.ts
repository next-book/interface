/// <reference path="../types/to-ms.d.ts"/>
import toMilliseconds from 'to-milliseconds';
import { Sequential } from './seq-return';

const ADD_MOMENT = 'nb-base/trace/ADD_MOMENT';

interface IBreakLength {
  hours?: number;
  minutes?: number;
}

interface ISession {
  start: number;
  end: number;
  open: boolean;
  moments: IMoment[];
}

export interface IMoment {
  time: number;
  file: string;
  idea: number;
  sequential: Sequential;
}

interface IConfig {
  breakLength: IBreakLength;
}

export interface IState {
  sessions: ISession[];
  config: IConfig;
}

const INITIAL_STATE: IState = {
  sessions: [],
  config: {
    breakLength: { minutes: 10 },
  },
};

export function reducer(state = INITIAL_STATE, action: Action): IState {
  switch (action.type) {
    case ADD_MOMENT:
      return addMoment(state, action.payload);
    default:
      return state;
  }
}

function addMoment(state: IState, moment: IMoment): IState {
  if (state.sessions.length === 0) {
    return { ...state, sessions: [...state.sessions, startSession(moment)] };
  }

  const lastSession = state.sessions[state.sessions.length - 1];
  const sessionIsOld = isSessionOld(moment, lastSession, state.config.breakLength);

  if (sessionIsOld)
    return {
      ...state,
      sessions: [
        ...state.sessions.slice(0, -1),
        concludeSession(lastSession),
        startSession(moment),
      ],
    };

  return {
    ...state,
    sessions: [...state.sessions.slice(0, -1), prolongSession(lastSession, moment)],
  };
}

function isSessionOld(moment: IMoment, session: ISession, breakLength: IBreakLength): boolean {
  return moment.time - toMilliseconds.convert(breakLength) > session.end;
}

function startSession(moment: IMoment): ISession {
  return {
    start: moment.time,
    end: moment.time,
    open: true,
    moments: [moment],
  };
}

function prolongSession(session: ISession, moment: IMoment): ISession {
  return {
    start: session.start,
    end: moment.time,
    open: true,
    moments: [...session.moments, moment],
  };
}

function concludeSession(session: ISession): ISession {
  return {
    start: session.start,
    end: session.end,
    open: false,
    moments: session.moments,
  };
}

reducer.addMoment = function(moment: IMoment) {
  return {
    type: ADD_MOMENT,
    payload: moment,
  };
};

export type Action = ReturnType<typeof reducer.addMoment>;
