import React from 'react';
import {
  IIdeas,
  IAnnotation,
  IAnnotations,
  IAnnotationAndIdeas,
  IChapterNote,
  IStyle,
} from './annotations-reducer';
import {
  getAnnotatedIdeas,
  isRangeWithoutOverlap,
  updateHead,
  updateRanges,
  doesRangeOverlap,
  cropHighlight,
  extendHighlight,
  getRangeBounds,
  getIdeaRanges,
  highlightRange,
} from './annotation-utils';
import AnnotationDesk from './annotation-desk';
enum Controls {
  Add,
  Edit,
  ExtendCrop,
  Desk,
  None,
}

interface IControlProps {
  annotations: IAnnotations;
  ideas: IIdeas;
  chapterNote: string;
  chapterNum: string;
  selectedAnnotation: number | null;
  addAnnotation(annotation: IAnnotationAndIdeas): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  updateChapterNote(data: IChapterNote): void;
  selectAnnotation(index: number): void;
  deselectAnnotation(): void;
}

interface IControlState {
  visible: Controls;
}

export default class AnnotationControl extends React.Component<IControlProps, IControlState> {
  constructor(props: IControlProps) {
    super(props);

    this.state = {
      visible: Controls.None,
    };
  }

  private showControls = (visible: Controls) => {
    this.setState({
      ...this.state,
      visible,
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
    return keys.length > 0 ? Math.max(...keys) + 1 : 1;
  };

  private createAnnotationFromRange = (params: { style?: IStyle; symbol?: string }) => {
    const selection = window.getSelection();
    if (selection === null) return;
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const annotation = {
      id: this.getNewAnnotationId(),
      chapterNum: this.props.chapterNum,
      symbol: params.symbol || '📝',
      style: params.style || IStyle.Default,
      note: '',
      links: [],
      range: getRangeBounds(range),
      dateCreated: 0,
      dateModified: 0,
    };

    const ideaRanges = getIdeaRanges(range);
    for (let i = 0; i < ideaRanges.length; i++) highlightRange(ideaRanges[i], annotation, i === 0);
    updateHead(annotation);

    this.addAnnotation(annotation, getAnnotatedIdeas());

    this.showControls(Controls.None);
    selection.removeAllRanges();
  };

  private showControlsIfRangeIsOkay = () => {

    if (isRangeWithoutOverlap()) {
      this.showControls(Controls.Add);
    } else if (doesRangeOverlap()) {
      this.showControls(Controls.ExtendCrop);
    } else {
      if (
        this.state.visible === Controls.Add ||
        this.state.visible === Controls.Edit ||
        this.state.visible === Controls.ExtendCrop
      )
        this.showControls(Controls.None);
    }
  };

  private selectAnnotation = (event: Event) => {
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

  private cropHighlight = () => {
    const annotation = cropHighlight(this.props.annotations);

    if (annotation !== null)
      this.props.updateAnnotation({
        annotation: annotation,
        ideas: getAnnotatedIdeas(),
      });
  };

  private extendHighlight = () => {
    const annotation = extendHighlight(this.props.annotations);

    if (annotation !== null)
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

    document.addEventListener('selectionchange', this.showControlsIfRangeIsOkay);

    document.addEventListener('click', this.selectAnnotation);
  }

  componentWillUnmount() {
    window.removeEventListener('selectionchange', this.showControlsIfRangeIsOkay);
  }

  render() {
    return (
      <>
        {this.state.visible === Controls.Desk ? (
          <AnnotationDesk
            annotations={this.props.annotations}
            ideas={this.props.ideas}
            chapterNote={this.props.chapterNote}
            chapterNum={this.props.chapterNum}
            updateChapterNote={this.props.updateChapterNote}
            close={() => this.showControls(Controls.None)}
          />
        ) : null}
        {this.renderButtons()}
      </>
    );
  }

  renderButtons() {
    if (this.state.visible === Controls.ExtendCrop) {
      const actions = [
        {
          symbol: '➖',
          fn: this.cropHighlight,
        },
        {
          symbol: '➕',
          fn: this.extendHighlight,
        },
      ];

      return (
        <div className="annotation-control ui-target">
          {actions.map((action, index) => (
            <ActionButton key={index} action={action.symbol} fn={action.fn} title="" />
          ))}
        </div>
      );
    }

    if (this.state.visible === Controls.None && this.props.selectedAnnotation === null) {
      // display access to workdesk

      const count = Object.keys(this.props.annotations).length;

      const actions = [
        {
          symbol: count > 0 ? count.toString() : ' ',
          fn: () => this.showControls(Controls.Desk),
        },
      ];

      return (
        <>
          {actions.map((action, index) => (
            <ToggleButton key={index} action={action.symbol} fn={action.fn} title="" />
          ))}
        </>
      );
    }

    const styles = [IStyle.Default, IStyle.Secondary, IStyle.Strong];
    const symbols = ['📝', '‼️', '😳', '👍', '✅'];
    const fn = this.props.selectedAnnotation
      ? this.updateAnnotation
      : this.createAnnotationFromRange;

    return (
      <div className="annotation-control ui-target">
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

const buttonFn = (fn: () => void) => (event: React.SyntheticEvent): void => {
  event.stopPropagation();
  fn();
};

interface IActionButtonProps {
  action: string;
  title: string;
  fn(): void;
}

export function ActionButton(props: IActionButtonProps) {
  return (
    <span className={`action-button`} onMouseDown={buttonFn(props.fn)} title={props.title}>
      {props.action}
    </span>
  );
}

export function ToggleButton(props: IActionButtonProps) {
  return (
    <span className="annotation__toggle-button-wrapper" onMouseDown={buttonFn(props.fn)}>
      <span className={`annotation__toggle-button`} title={props.title}>
        {props.action}
      </span>
    </span>
  );
}

interface IStyleButtonProps {
  style: IStyle;
  fn(): void;
}

export function StyleButton(props: IStyleButtonProps) {
  return (
    <span
      className={`style-button style-button--${props.style}`}
      onMouseDown={buttonFn(props.fn)}
      title={`Create annotation with ${props.style} style.`}
    >
      ab
    </span>
  );
}

interface ISymbolButtonProps {
  symbol: string;
  fn(): void;
}

export function SymbolButton(props: ISymbolButtonProps) {
  return (
    <span
      className="symbol-button"
      onMouseDown={buttonFn(props.fn)}
      title={`Create annotation with symbol ${props.symbol}.`}
    >
      {props.symbol}
    </span>
  );
}
