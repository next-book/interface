import React from 'react';
import { reducer, IState, SwAvailability } from './../offline/reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../../reducer';

export interface IProps extends IState {
  setCacheAvailability(status: boolean): void;
  setSwAvailability(status: SwAvailability): void;
}

export class Offline extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount = () => {
    const setOA = this.props.setSwAvailability;

    if ('serviceWorker' in navigator) {
      setOA(SwAvailability.Available);

      navigator.serviceWorker.ready.then(registration => {
        this.props.setCacheAvailability(true);
      });

      registerServiceWorker();
    } else {
      if (window.location.protocol !== 'https:') setOA(SwAvailability.Unsecure);
      else setOA(SwAvailability.NoSw);
    }
  };

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
    swIsAvailable: state.offline.swIsAvailable,
    cacheIsAvailable: state.offline.cacheIsAvailable,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setCacheAvailability: reducer.setCacheAvailability,
      setSwAvailability: reducer.setSwAvailability,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Offline);
