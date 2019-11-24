import React from 'react';
import reducer from './manifest-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Manifest extends React.Component {
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
