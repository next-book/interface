import React from 'react';
import {
  IIdeas,
  IAnnotation,
  IAnnotations,
  IAnnotationAndIdeas,
  IStyle,
} from './annotations-reducer';
import {
  getAnnotatedIdeas,
  checkSelection,
  updateHead,
  getSafeRanges,
  highlightRange,
} from './annotation-utils';

interface IControlProps {
  annotations: IAnnotations;
  ideas: IIdeas;
  chapterNum: string;
  addAnnotation(annotation: IAnnotationAndIdeas): void;
  selectAnnotation(index: number): void;
}

interface IControlState {
  buttonIsShown: boolean;
}

export default class AnnotationControl extends React.Component<IControlProps, IControlState> {
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
      annotation,
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
