import React from 'react';
import PropTypes from 'prop-types';
import { reducer, IMoment } from './trace-reducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';

export interface IProps {
  chapterNum?: number;
  idea?: number;
  sequential?: boolean;
  addMoment(moment: IMoment): void;
}

export class Trace extends React.Component<IProps> {
  constructor(props: Iprops) {
    super(props);
  }

  scrollHandler = () => {
    debounce(this.addMoment, 2000);
  };

  addMoment = () => {
    if (
      this.props.chapterNum !== null &&
      this.props.idea !== null &&
      this.props.sequential !== null
    )
      this.props.addMoment({
        time: new Date().getTime(),
        chapter: this.props.chapterNum,
        idea: this.props.idea,
        sequential: this.props.sequential,
      });
  };

  componentDidMount() {
    window.addEventListener('scroll', this.scrollHandler);

    this.addMoment();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  render() {
    return null;
  }
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Trace);
