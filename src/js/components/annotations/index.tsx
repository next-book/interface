import React from 'react';
import {
  reducer,
  IState,
  IAnnotation,
  IAnnotationAndIdeas,
  INote,
  IAnnotationStyles,
} from './reducer';
import AnnotationButtons from './buttons';
import AnnotationDetail from './detail';
import { IState as ICombinedState } from '../../reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { getAnnotatedIdeas, removeAnnotation } from './utils';

import docInfo from '../../doc-info';

interface IProps {
  annotations: IState;
  annotationStyles: IAnnotationStyles;
  addAnnotation(data: IAnnotationAndIdeas): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
  addNote(data: INote): void;
  updateNote(data: INote): void;
  destroyNote(data: INote): void;
}

interface ILocalState {
  selectedAnnotation: number | null;
}

export class Annotations extends React.Component<IProps, ILocalState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
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

  deselectAnnotation = () => {
    this.setState({
      ...this.state,
      selectedAnnotation: null,
    });
  };

  destroyAnnotation = (annotation: IAnnotation) => {
    this.deselectAnnotation();
    removeAnnotation(annotation.id);
    this.props.destroyAnnotation({
      annotation: annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  render() {
    const file = docInfo.links.self;
    const { annotations, ideas, notes } = getChapterAnnotations(file, this.props.annotations);

    return (
      <>
        <AnnotationButtons
          annotations={annotations}
          ideas={ideas}
          notes={notes}
          addAnnotation={this.props.addAnnotation}
          selectAnnotation={this.selectAnnotation}
          updateAnnotation={this.props.updateAnnotation}
          selectedAnnotation={this.state.selectedAnnotation}
          styles={this.props.annotationStyles}
          file={docInfo.links.self}
        />
        {file === null || this.state.selectedAnnotation === null ? null : (
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

export function getChapterAnnotations(file: string | null, annotations: IState) {
  return file === null || !annotations[file]
    ? {
        annotations: [],
        ideas: {},
        notes: {},
      }
    : {
        annotations: annotations[file].annotations || [],
        ideas: annotations[file].ideas || {},
        notes: annotations[file].notes || {},
      };
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    annotations: state.annotations,
    annotationStyles: state.config.annotationStyles,
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
