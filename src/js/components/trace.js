import React from 'react';
import PropTypes from 'prop-types';
import reducer from './trace-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';

class Trace extends React.Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll() {
    const nav = this.props.navigation;
    this.props.addMoment(new Date().getTime(), nav.chapter, nav.firstIdeaInView);
  }

  componentDidMount() {
    window.addEventListener('scroll', debounce(this.handleScroll, 2000));

    const nav = this.props.navigation;
    this.props.addMoment(new Date().getTime(), nav.chapter, nav.firstIdeaInView);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', debounce);
  }

  render() {
    return null;
  }
}

Trace.propTypes = {
  navigation: PropTypes.shape({
    chapter: PropTypes.number.isRequired,
    firstIdeaInView: PropTypes.number.isRequired,
  }),
  addMoment: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    trace: state.trace,
    navigation: state.navigation,
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
