import React from 'react';
import { reducer, IState, IAnnotationAndIdeas, IChapterNote } from './annotations-reducer';
import AnnotationControl from './annotation-control';
import AnnotationDetail from './annotation-detail';
import { IState as ICombinedState } from '../reducer';
//import Annotation from './annotation';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { getChapterNum } from '../shared';

interface IProps {
  annotations: IState;
  addAnnotation(data: IAnnotationAndIdeas): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  updateChapterNote(data: IChapterNote): void;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
}

interface ILocalState {
  chapterNum: string | null;
  selectedAnnotation: number | null;
}

export class Annotations extends React.Component<IProps, ILocalState> {
  constructor(props: IProps) {
    super(props);

    const chapterNum = getChapterNum();

    this.state = {
      chapterNum: chapterNum === null ? null : chapterNum.toString(),
      selectedAnnotation: null,
    };
  }

  private selectAnnotation = (id: number) => {
    this.setState({
      ...this.state,
      selectedAnnotation: id,
    });
  };

  private deselectAnnotation = () => {
    this.setState({
      ...this.state,
      selectedAnnotation: null,
    });
  };

  render() {
    if (this.state.chapterNum === null) return null;

    const chapterAnnotations = this.props.annotations[this.state.chapterNum.toString()];
    const annotations = chapterAnnotations ? chapterAnnotations.annotations : [];
    const ideas = chapterAnnotations ? chapterAnnotations.ideas : {};

    return (
      <>
        <AnnotationControl
          annotations={annotations}
          ideas={ideas}
          chapterNote={
            this.props.annotations[this.state.chapterNum.toString()]
              ? this.props.annotations[this.state.chapterNum.toString()].chapterNote
              : ''
          }
          addAnnotation={this.props.addAnnotation}
          selectAnnotation={this.selectAnnotation}
          deselectAnnotation={this.deselectAnnotation}
          updateAnnotation={this.props.updateAnnotation}
          updateChapterNote={this.props.updateChapterNote}
          selectedAnnotation={this.state.selectedAnnotation}
          chapterNum={this.state.chapterNum}
        />
        {this.state.chapterNum === null || this.state.selectedAnnotation === null ? null : (
          <AnnotationDetail
            annotation={annotations[this.state.selectedAnnotation]}
            close={this.deselectAnnotation}
            updateAnnotation={this.props.updateAnnotation}
            destroyAnnotation={this.props.destroyAnnotation}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    annotations: state.annotations,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      addAnnotation: reducer.addAnnotation,
      updateAnnotation: reducer.updateAnnotation,
      updateChapterNote: reducer.updateChapterNote,
      destroyAnnotation: reducer.destroyAnnotation,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Annotations);
