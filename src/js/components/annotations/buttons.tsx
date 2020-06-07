import React from 'react';
import {
  IIdeas,
  IAnnotation,
  IAnnotations,
  IAnnotationAndIdeas,
  INotes,
  IAnnotationStyle,
} from './reducer';
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
} from './utils';

enum Sets {
  Add,
  Edit,
  ExtendCrop,
  None,
}

interface IProps {
  annotations: IAnnotations;
  ideas: IIdeas;
  notes: INotes;
  file: string;
  selectedAnnotation: number | null;
  styles: IAnnotationStyle[];
  addAnnotation(annotation: IAnnotationAndIdeas): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  selectAnnotation(index: number, focus?: boolean): void;
}

interface IState {
  visible: Sets;
}

export default class AnnotationButtons extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      visible: Sets.None,
    };
  }

  private show = (visible: Sets) => {
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

  private createAnnotationFromRange = (style: IAnnotationStyle) => {
    const selection = window.getSelection();
    if (selection === null) return;
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const id = this.getNewAnnotationId();

    const annotation = {
      id,
      file: this.props.file,
      style,
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

    this.show(Sets.None);
    selection.removeAllRanges();

    if (style.quick) this.props.selectAnnotation(id, true);
  };

  private showIfRangeIsOkay = () => {
    if (isRangeWithoutOverlap()) {
      this.show(Sets.Add);
    } else if (doesRangeOverlap()) {
      this.show(Sets.ExtendCrop);
    } else {
      if (
        this.state.visible === Sets.Add ||
        this.state.visible === Sets.Edit ||
        this.state.visible === Sets.ExtendCrop
      )
        this.show(Sets.None);
    }
  };

  private selectAnnotation = (event: Event, focus?: boolean) => {
    const el = event.target as Element;

    if (el && el.classList.contains('annotation__head')) {
      const id = el.getAttribute('data-id');

      if (id !== null) this.props.selectAnnotation(parseInt(id, 10), focus);
    }
  };

  private updateAnnotation = (style: IAnnotationStyle) => {
    if (!this.props.selectedAnnotation) return;
    const selected = this.props.annotations[this.props.selectedAnnotation];
    const updated = { ...selected, style };

    if (
      style.color !== selected.style.color ||
      style.backgroundColor !== selected.style.backgroundColor
    )
      updateRanges(updated);
    if (style.symbol !== selected.style.symbol) updateHead(updated);
    this.props.updateAnnotation({
      annotation: updated,
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

    const wrapper = document.querySelector('.content');
    if (wrapper) {
      document.addEventListener('selectionchange', this.showIfRangeIsOkay);
      wrapper.addEventListener('click', this.selectAnnotation);
    }
  }

  componentWillUnmount() {
    const wrapper = document.querySelector('.content');
    if (wrapper) {
      document.removeEventListener('selectionchange', this.showIfRangeIsOkay);
      wrapper.removeEventListener('click', this.selectAnnotation);
    }
  }

  renderExtend = (classes: string[]) => {
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
      <div className={classes.join(' ')}>
        <div className="button-wrapper">
          {actions.map((action, index) => (
            <ActionButton key={index} action={action.symbol} fn={action.fn} title="" />
          ))}
        </div>
      </div>
    );
  };

  renderCreate = (classes: string[]) => {
    const fn = this.createAnnotationFromRange;

    return (
      <div className={classes.concat(['annotation-buttons--new']).join(' ')}>
        <div className="button-wrapper">
          {this.props.styles
            .filter(s => s.symbol !== '')
            .map((style, index) => (
              <StyleButton
                className={style.quick ? 'quick-note' : ''}
                key={index}
                style={style}
                fn={() => fn(style)}
              />
            ))}
        </div>
      </div>
    );
  };

  renderUpdate = (classes: string[]) => {
    const fn = this.updateAnnotation;

    return (
      <div className={classes.join(' ')}>
        <div className="button-wrapper">
          {this.props.styles
            .filter(s => s.symbol !== '')
            .map((style, index) => (
              <StyleButton key={index} style={style} fn={() => fn(style)} />
            ))}
        </div>
      </div>
    );
  };

  render() {
    if (this.state.visible === Sets.None && !this.props.selectedAnnotation) return null;

    const classes = ['annotation-buttons', 'ui-target'];

    if (this.state.visible === Sets.ExtendCrop) return this.renderExtend(classes);
    if (this.props.selectedAnnotation) return this.renderUpdate(classes);
    return this.renderCreate(classes);
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

interface IStyleButtonProps {
  style: IAnnotationStyle;
  className?: string;
  fn(): void;
}

export function StyleButton(props: IStyleButtonProps) {
  const style: { color?: string; backgroundColor?: string } = {};
  if (props.style.color) style.color = props.style.color;
  if (props.style.backgroundColor) style.backgroundColor = props.style.backgroundColor;

  return (
    <span
      className={`style-button ${props.className ? props.className : ''} ${
        props.style.quick ? 'quick-note' : ''
      }`}
      style={style}
      onMouseDown={buttonFn(props.fn)}
      title={`Create annotation`}
    >
      {props.style.symbol}
    </span>
  );
}
