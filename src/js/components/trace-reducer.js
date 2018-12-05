import toMs from 'to-milliseconds';

const ADD_MOMENT = 'nb-base/trace/ADD_MOMENT';

const defaultState = {
  sessions: [],
  config: {
    breakLength: { minutes: 10 },
  },
};

function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case ADD_MOMENT:
      return addMoment(state, action.payload);
    default:
      return state;
  }
}

function addMoment(state, moment) {
  if (state.sessions.length === 0) {
    return { ...state, sessions: [...state.sessions, startSession(moment)] };
  }

  const lastSession = state.sessions[state.sessions.length - 1];
  const sessionIsOld = isSessionOld(moment, lastSession, state.config.breakLength);
  if (sessionIsOld)
    return {
      ...state,
      sessions: [
        ...state.sessions.slice(0, -2),
        concludeSession(lastSession),
        startSession(moment),
      ],
    };

  return {
    ...state,
    sessions: [...state.sessions.slice(0, -1), prolongSession(lastSession, moment)],
  };
}

function isSessionOld(moment, session, breakLength) {
  return moment.time - toMs.convert(breakLength) > session.end;
}

function startSession(moment) {
  return {
    start: moment.time,
    end: moment.time,
    open: true,
    moments: [moment],
  };
}

function prolongSession(session, moment) {
  return {
    start: session.start,
    end: moment.time,
    open: true,
    moments: [...session.moments, moment],
  };
}

function concludeSession(session) {
  return {
    start: session.start,
    end: session.end,
    open: false,
    moments: session.moments,
  };
}

reducer.addMoment = function(time, chapter, idea) {
  return {
    type: ADD_MOMENT,
    payload: { time, chapter, idea },
  };
};

module.exports = reducer;
