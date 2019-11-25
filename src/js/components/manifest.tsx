import React from 'react';
import { reducer, IState as IManifest } from './manifest-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export interface IProps {
  manifest: IManifest;
  setManifestData(data: object): void;
}

export class Manifest extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  handleScroll() {}

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return null;
  }
}

const mapStateToProps = state => {
  return { manifest: state.manifest };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setManifestData: reducer.setManifestData,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Manifest);
