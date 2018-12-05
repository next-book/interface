import React from 'react';
import reducer from './spine-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Spine extends React.Component {
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
  return { spine: state.spine };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setSpineData: reducer.setSpineData,
    },
    dispatch
  );
};

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Spine);
