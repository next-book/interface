import React from 'react';
import { reducer, IState } from './offline-reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';

export interface IProps extends IState {
  setCacheAvailability(status: boolean): void;
  setOfflineAvailability(status: boolean): void;
}

export class Offline extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    if ('serviceWorker' in navigator) {
      const props = this.props;

      props.setOfflineAvailability(true);

      navigator.serviceWorker.ready.then(function(registration) {
        props.setCacheAvailability(true);
      });

      registerServiceWorker();
    }
  }

  componentWillUnmount() {}

  render() {
    return null;
  }
}

function registerServiceWorker() {
  navigator.serviceWorker.register('./service-worker.js');
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    offlineIsAvailable: state.offline.offlineIsAvailable,
    cacheIsAvailable: state.offline.cacheIsAvailable,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setCacheAvailability: reducer.setCacheAvailability,
      setOfflineAvailability: reducer.setOfflineAvailability,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Offline);
