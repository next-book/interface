import { combineReducers } from 'redux';
import navigation from './components/navigation-reducer';
import manifest from './components/manifest-reducer';
import trace from './components/trace-reducer';

module.exports = combineReducers({
  navigation,
  manifest,
  trace,
});
