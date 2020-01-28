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
  updateRanges,
  getRangeBounds,
  getSafeRanges,
  highlightRange,
} from './annotation-utils';

interface IControlProps {
  annotations: IAnnotations;
  ideas: IIdeas;
  chapterNum: string;
  selectedAnnotation: number | null;
  addAnnotation(annotation: IAnnotationAndIdeas): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  selectAnnotation(index: number): void;
}

interface IControlState {
  isVisible: boolean;
}

export default class AnnotationControl extends React.Component<IControlProps, IControlState> {
  constructor(props: IControlProps) {
    super(props);

    this.state = {
      isVisible: false,
    };
  }

  private showControls = (isVisible: boolean) => {
    this.setState({
      ...this.state,
      isVisible,
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

  private createAnnotationFromSelection = (params: { style?: IStyle; symbol?: string }) => {
    const selection = window.getSelection();
    if (selection === null) return;
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const annotation = {
      id: this.getNewAnnotationId(),
      chapterNum: this.props.chapterNum,
      symbol: params.symbol || '✏️',
      style: params.style || IStyle.Default,
      note: '',
      links: [],
      range: getRangeBounds(range),
      dateCreated: 0,
      dateModified: 0,
    };

    const safeRanges = getSafeRanges(range);
    for (let i = 0; i < safeRanges.length; i++) highlightRange(safeRanges[i], annotation, i === 0);
    updateHead(annotation);

    this.addAnnotation(annotation, getAnnotatedIdeas());

    this.showControls(false);
    selection.removeAllRanges();
  };

  private showControlsIfSelectionIsOkay = () => {
    this.showControls(checkSelection());
  };

  private selectAnnotation = (event: MouseEvent) => {
    const el = event.target as Element;

    if (el && el.classList.contains('annotation')) {
      const id = el.getAttribute('data-id');

      if (id !== null) this.props.selectAnnotation(parseInt(id, 10));
    }
  };

  private updateAnnotation = (params: { style?: IStyle; symbol?: string }) => {
    if (!this.props.selectedAnnotation) return;

    this.setState({ ...this.state, ...params });
    const annotation = { ...this.props.annotations[this.props.selectedAnnotation], ...params };

    if (params.style) updateRanges(annotation);
    if (params.symbol) updateHead(annotation);

    this.props.updateAnnotation({
      annotation: annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  componentDidMount() {
    for (let [id, html] of Object.entries(this.props.ideas)) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    }

    document.addEventListener('selectionchange', this.showControlsIfSelectionIsOkay);

    document.addEventListener('click', this.selectAnnotation);
  }

  componentWillUnmount() {
    window.removeEventListener('selectionchange', this.showControlsIfSelectionIsOkay);
  }

  render() {
    if (this.state.isVisible === null && this.props.selectedAnnotation === null) {
      // display access to workdesk
      return null;
    }

    const styles = [IStyle.Default, IStyle.Secondary, IStyle.Strong];
    const symbols = ['✏️', '‼️', '😳', '👍', '✅'];
    const fn = this.props.selectedAnnotation
      ? this.updateAnnotation
      : this.createAnnotationFromSelection;

    return (
      <div className="annotation-control">
        {styles.map((style, index) => (
          <StyleButton key={index} style={style} fn={() => fn({ style: style })} />
        ))}

        {symbols.map((symbol, index) => (
          <SymbolButton key={index} symbol={symbol} fn={() => fn({ symbol: symbol })} />
        ))}
      </div>
    );
  }
}

interface IStyleButtonProps {
  style: IStyle;
  fn(): void;
}

export function StyleButton(props: IStyleButtonProps) {
  return (
    <button
      className={`style-button style-button--${props.style}`}
      onClick={props.fn}
      title={`Create annotation with ${props.style} style.`}
    >
      ab
    </button>
  );
}

interface ISymbolButtonProps {
  symbol: string;
  fn(): void;
}

export function SymbolButton(props: ISymbolButtonProps) {
  return (
    <button
      className="symbol-button"
      onClick={props.fn}
      title={`Create annotation with symbol ${props.symbol}.`}
    >
      {props.symbol}
    </button>
  );
}
