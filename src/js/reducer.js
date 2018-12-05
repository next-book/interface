import { combineReducers } from 'redux';
import navigation from './components/navigation-reducer';
import spine from './components/spine-reducer';
import trace from './components/trace-reducer';

module.exports = combineReducers({
  navigation,
  spine,
  trace,
});
