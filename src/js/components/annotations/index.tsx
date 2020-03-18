import React from 'react';
import { reducer, IState, IAnnotation, IAnnotationAndIdeas, INote } from './reducer';
import AnnotationControl from './control';
import AnnotationDetail from './detail';
import { IState as ICombinedState } from '../../reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { getAnnotatedIdeas, removeAnnotation } from './utils';

import { getChapterNum } from '../../shared';

interface IProps {
  annotations: IState;
  addAnnotation(data: IAnnotationAndIdeas): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
  addNote(data: INote): void;
  updateNote(data: INote): void;
  destroyNote(data: INote): void;
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

  private selectAnnotation = (id: number, focus?: boolean) => {
    this.setState({
      ...this.state,
      selectedAnnotation: id,
    });

    /* TODO: Find a better way */
    if (focus) {
      window.setTimeout(() => {
        const el = document.querySelector('.annotation-detail__note');
        if (el !== null) (el as any).focus();
      }, 100);
    }
  };

  private deselectAnnotation = () => {
    this.setState({
      ...this.state,
      selectedAnnotation: null,
    });
  };

  private destroyAnnotation = (annotation: IAnnotation) => {
    this.deselectAnnotation();
    removeAnnotation(annotation.id);
    this.props.destroyAnnotation({
      annotation: annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  render() {
    if (this.state.chapterNum === null) return null;

    const chapterAnnotations = this.props.annotations[this.state.chapterNum.toString()];
    const annotations =
      chapterAnnotations && chapterAnnotations.annotations ? chapterAnnotations.annotations : [];
    const ideas = chapterAnnotations && chapterAnnotations.ideas ? chapterAnnotations.ideas : {};
    const notes = chapterAnnotations && chapterAnnotations.notes ? chapterAnnotations.notes : {};

    return (
      <>
        <AnnotationControl
          annotations={annotations}
          ideas={ideas}
          notes={notes}
          addAnnotation={this.props.addAnnotation}
          destroyAnnotation={this.destroyAnnotation}
          selectAnnotation={this.selectAnnotation}
          deselectAnnotation={this.deselectAnnotation}
          updateAnnotation={this.props.updateAnnotation}
          addNote={this.props.addNote}
          updateNote={this.props.updateNote}
          destroyNote={this.props.destroyNote}
          selectedAnnotation={this.state.selectedAnnotation}
          chapterNum={this.state.chapterNum}
        />
        {this.state.chapterNum === null || this.state.selectedAnnotation === null ? null : (
          <AnnotationDetail
            annotation={annotations[this.state.selectedAnnotation]}
            close={this.deselectAnnotation}
            updateAnnotation={this.props.updateAnnotation}
            destroyAnnotation={this.destroyAnnotation}
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
      destroyAnnotation: reducer.destroyAnnotation,
      addNote: reducer.addNote,
      updateNote: reducer.updateNote,
      destroyNote: reducer.destroyNote,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Annotations);
