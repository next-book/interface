import { combineReducers } from 'redux';
import {
  reducer as annotations,
  IState as IAnnotationsState,
} from './components/annotations/reducer';
import { reducer as position, IState as IPositionState } from './components/position/reducer';
import { reducer as manifest, IState as IManifestState } from './components/manifest/reducer';
import { reducer as peeks, IState as IPeeksState } from './components/peeks/reducer';
import { reducer as trace, IState as ITraceState } from './components/trace/reducer';
import { reducer as offline, IState as IOfflineState } from './components/offline/reducer';
import { reducer as config, IState as IConfigState } from './components/config/reducer';
import { reducer as research, IState as IResearchState } from './components/research/reducer';

export interface IState {
  annotations: IAnnotationsState;
  position: IPositionState;
  manifest: IManifestState;
  peeks: IPeeksState;
  trace: ITraceState;
  offline: IOfflineState;
  config: IConfigState;
  research: IResearchState;
}

export default combineReducers({
  annotations,
  position,
  manifest,
  peeks,
  trace,
  offline,
  config,
  research,
});
