import React from 'react';
import {
  reducer,
  IState,
  IIdeas,
  IAnnotation,
  IAnnotations,
  INewAnnotation,
  IStyle,
} from './annotations-reducer';
import {
  getAnnotatedIdeas,
  checkSelection,
  updateHead,
  getSafeRanges,
  highlightRange,
} from './annotation-utils';
import { IState as ICombinedState } from '../reducer';
//import Annotation from './annotation';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { getChapterNum } from '../shared';

interface IProps {
  annotations: IState;
  addAnnotation(annotation: INewAnnotation): void;
  destroyAnnotation(index: number): void;
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
          addAnnotation={this.props.addAnnotation}
          selectAnnotation={this.selectAnnotation}
          chapterNum={this.state.chapterNum}
        />
        {this.state.chapterNum === null || this.state.selectedAnnotation === null ? null : (
          <AnnotationDetail
            annotation={annotations[this.state.selectedAnnotation]}
            destroyAnnotation={this.props.destroyAnnotation}
          />
        )}
      </>
    );
  }
}

interface IControlProps {
  annotations: IAnnotations;
  ideas: IIdeas;
  chapterNum: string;
  addAnnotation(annotation: INewAnnotation): void;
  selectAnnotation(index: number): void;
}

interface IControlState {
  buttonIsShown: boolean;
}

class AnnotationControl extends React.Component<IControlProps, IControlState> {
  constructor(props: IControlProps) {
    super(props);

    this.state = {
      buttonIsShown: false,
    };
  }

  private toggleButton = (status?: boolean) => {
    this.setState({
      ...this.state,
      buttonIsShown: status === undefined ? !this.state.buttonIsShown : status,
    });
  };

  private addAnnotation = (annotation: IAnnotation, ideas: IIdeas) => {
    this.props.addAnnotation({
      ...annotation,
      ideas,
    });
  };

  private getNewAnnotationId = () => {
    const keys = Object.keys(this.props.annotations).map(key => parseInt(key, 10));
    return keys.length > 0 ? Math.max(...keys) + 1 : 0;
  };

  private createAnnotationFromSelection = () => {
    const annotation = {
      id: this.getNewAnnotationId(),
      chapterNum: this.props.chapterNum,
      symbol: '😳',
      format: IStyle.Default,
      note: 'It works.',
      links: [],
    };

    const selection = window.getSelection();
    if (selection === null) return;
    if (selection.rangeCount === 0) return;

    const userSelection = selection.getRangeAt(0);

    const safeRanges = getSafeRanges(userSelection);
    for (let i = 0; i < safeRanges.length; i++)
      highlightRange(safeRanges[i], annotation.id, i === 0);
    updateHead(annotation);

    this.addAnnotation(annotation, getAnnotatedIdeas());

    this.toggleButton(false);
    selection.removeAllRanges();
  };

  private displayButtonIfSelectionIsOkay = () => {
    this.toggleButton(checkSelection());
  };

  private selectAnnotation = (event: MouseEvent) => {
    const el = event.target as Element;

    if (el && el.classList.contains('annotation')) {
      const id = el.getAttribute('data-id');

      if (id !== null) this.props.selectAnnotation(parseInt(id, 10));
    }
  };

  componentDidMount() {
    for (let [id, html] of Object.entries(this.props.ideas)) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    }

    document.addEventListener('selectionchange', this.displayButtonIfSelectionIsOkay);

    document.addEventListener('click', this.selectAnnotation);
  }

  componentWillUnmount() {
    window.removeEventListener('selectionchange', this.displayButtonIfSelectionIsOkay);
  }

  render() {
    return (
      <div className="annotation-control">
        {this.state.buttonIsShown ? (
          <button onClick={this.createAnnotationFromSelection}>Create annotation</button>
        ) : null}
      </div>
    );
  }
}

interface IAnnotationDetailProps {
  annotation: IAnnotation;
  destroyAnnotation(index: number): void;
}

class AnnotationDetail extends React.Component<IAnnotationDetailProps> {
  constructor(props: IAnnotationDetailProps) {
    super(props);
  }

  render() {
    return (
      <div className="annotation-detail">
        <p>{JSON.stringify(this.props, null, ' ')}</p>
      </div>
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
      destroyAnnotation: reducer.destroyAnnotation,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Annotations);
