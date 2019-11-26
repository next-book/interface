import { combineReducers } from 'redux';
import { reducer as navigation, IState as INavigationState } from './components/navigation-reducer';
import { reducer as manifest, IState as IManifestState } from './components/manifest-reducer';
import { reducer as peeks, IState as IPeeksState } from './components/peeks-reducer';
import { reducer as trace, IState as ITraceState } from './components/trace-reducer';
import { reducer as offline, IState as IOfflineState } from './components/offline-reducer';

export interface IState {
  navigation: INavigationState;
  manifest: IManifestState;
  peeks: IPeeksState;
  trace: ITraceState;
  offline: IOfflineState;
}

export default combineReducers({
  navigation,
  manifest,
  peeks,
  trace,
  offline,
});
