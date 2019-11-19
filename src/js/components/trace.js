import React from 'react';
import PropTypes from 'prop-types';
import reducer from './trace-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';

class Trace extends React.Component {
  constructor(props) {
    super(props);

    this.addMoment = this.addMoment.bind(this);
  }

  addMoment() {
    if (
      this.props.chapterNum !== null &&
      this.props.idea !== null &&
      this.props.sequential !== null
    )
      this.props.addMoment(
        new Date().getTime(),
        this.props.chapterNum,
        this.props.idea,
        this.props.sequential
      );
  }

  componentDidMount() {
    window.addEventListener('scroll', debounce(this.addMoment, 2000));

    this.addMoment();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', debounce);
  }

  render() {
    return null;
  }
}

Trace.propTypes = {
  chapterNum: PropTypes.number,
  idea: PropTypes.number,
  sequential: PropTypes.bool,
  addMoment: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    trace: state.trace,
    chapterNum: state.navigation.position.chapterNum,
    idea: state.navigation.position.idea,
    sequential: state.navigation.sequential,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      addMoment: reducer.addMoment,
    },
    dispatch
  );
};

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Trace);
