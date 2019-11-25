import React from 'react';
import { reducer, IMoment } from './trace-reducer';
import { IPosition } from './navigation-reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { debounce } from 'lodash';
import { IState as ICombinedState } from '../reducer';

export interface IProps {
  position: IPosition | null;
  sequential?: boolean;
  addMoment(moment: IMoment): void;
}

export class Trace extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  scrollHandler = () => {
    debounce(this.addMoment, 2000);
  };

  addMoment = () => {
    if (
      this.props.position !== null &&
      this.props.sequential !== null &&
      this.props.sequential !== undefined
    )
      this.props.addMoment({
        time: new Date().getTime(),
        chapter: this.props.position.chapterNum,
        idea: this.props.position.idea,
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

const mapStateToProps = (state: ICombinedState) => {
  return {
    trace: state.trace,
    position: state.navigation.position,
    sequential: state.navigation.sequential,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
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
