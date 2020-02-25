import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { IAnnotation, IAnnotationAndIdeas, IStyle } from './annotations-reducer';
import { getAnnotatedIdeas, updateHead } from './annotation-utils';

interface IProps {
  annotation: IAnnotation;
  close(): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  destroyAnnotation(data: IAnnotation): void;
}

interface IState {
  symbol: string;
  note: string;
  style: IStyle;
}

export default class AnnotationDetail extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      note: props.annotation.note,
      symbol: props.annotation.symbol,
      style: IStyle.Default,
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

  // private pastePlainText = event => {
  //   event.preventDefault();

  //   const text = event.clipboardData.getData('text/plain');
  //   document.execCommand('insertHTML', false, text);
  // };

  render() {
    return this.props.annotation === undefined ? null : (
      <div className="annotation-detail">
        <div className="annotation-detail__tools">
          <button className="annotation-detail__close" onClick={this.props.close}>
            <span>Close annotation</span>
          </button>
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
