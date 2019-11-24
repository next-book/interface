import { combineReducers } from 'redux';
import navigation from './components/navigation-reducer';
import manifest from './components/manifest-reducer';
import peeks from './components/peeks-reducer';
import trace from './components/trace-reducer';
import offline from './components/offline-reducer';

export default combineReducers({
  navigation,
  manifest,
  peeks,
  trace,
  offline,
});
