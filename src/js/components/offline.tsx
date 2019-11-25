import React from 'react';
import PropTypes from 'prop-types';
import { reducer, IState } from './offline-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export interface IProps extends IState {
  setCacheAvailability(status: boolean): void;
  setOfflineAvailability(status: boolean): void;
}

export class Offline extends React.Component<IProps> {
  constructor(props) {
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

const mapStateToProps = state => {
  return {
    offlineIsAvailable: state.offline.offlineIsAvailable,
    cacheIsAvailable: state.offline.cacheIsAvailable,
  };
};

const mapDispatchToProps = dispatch => {
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
