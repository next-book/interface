import React from 'react';
import PropTypes from 'prop-types';
import reducer from './offline-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Offline extends React.Component {
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

Offline.propTypes = {
  offlineIsAvailable: PropTypes.bool.isRequired,
  cacheIsAvailable: PropTypes.bool.isRequired,
  setCacheAvailability: PropTypes.func.isRequired,
  setOfflineAvailability: PropTypes.func.isRequired,
};

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
