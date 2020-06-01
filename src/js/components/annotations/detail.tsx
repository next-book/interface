import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { IAnnotation, IAnnotationAndIdeas } from './reducer';
import { getAnnotatedIdeas, updateHead } from './utils';

interface IProps {
  annotation: IAnnotation;
  close(): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  destroyAnnotation(data: IAnnotation): void;
}

interface IState {
  note: string;
}

export default class AnnotationDetail extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      note: props.annotation.note,
    };
  }

  private updateNote = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, note: event.target.value });

    const annotation = { ...this.props.annotation, note: event.target.value };
    updateHead(annotation);

    this.props.updateAnnotation({
      annotation: annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  closeOnClickOutside = (e: Event) => {
    const el = e.target as Element;

    const clickedOnStyleButton = el.classList.contains('style-button');
    const clickedOnAnnotationHead = el.classList.contains('annotation__head');

    const clickedInside =
      el.classList.contains('annotation-detail') || el.closest('.annotation-detail') !== null;

    if (!(clickedInside || clickedOnAnnotationHead || clickedOnStyleButton)) this.props.close();
  };

  componentDidMount() {
    window.addEventListener('click', this.closeOnClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.closeOnClickOutside);
  }

  // private pastePlainText = event => {
  //   event.preventDefault();

  //   const text = event.clipboardData.getData('text/plain');
  //   document.execCommand('insertHTML', false, text);
  // };

  render() {
    return this.props.annotation === undefined ? null : (
      <div className="annotation-detail">
        <div className="annotation-detail__tools">
          <button
            className="annotation-detail__destroy"
            onClick={() => this.props.destroyAnnotation(this.props.annotation)}
          >
            <span>Delete annotation</span>
          </button>
        </div>

        <ContentEditable
          className="annotation-detail__note"
          html={this.state.note}
          tagName="article"
          onChange={this.updateNote}
        />
      </div>
    );
  }
}

// onPaste={this.pastePlainText
// <!-- <p>{JSON.stringify(this.props, null, ' ')}</p> -->
