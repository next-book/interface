import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { IAnnotation, IAnnotationAndIdeas, IStyle } from './annotations-reducer';
import {
  getAnnotatedIdeas,
  //updateAnnotation,
  updateHead,
  removeAnnotation,
} from './annotation-utils';

interface IProps {
  annotation: IAnnotation;
  close(): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
}

interface IState {
  symbol: string;
  note: { html: string };
  style: IStyle;
}

export default class AnnotationDetail extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      note: { html: props.annotation.note },
      symbol: props.annotation.symbol,
      style: IStyle.Default,
    };
  }

  // private update = () => {
  //   updateAnnotation(this.props.annotation);
  //   this.props.updateAnnotation({
  //     annotation: this.props.annotation,
  //     ideas: getAnnotatedIdeas(),
  //   });
  // };

  private updateNote = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, note: { html: event.target.value } });
    updateHead({ ...this.props.annotation, note: this.state.note.html });

    this.props.updateAnnotation({
      annotation: { ...this.props.annotation, note: this.state.note.html },
      ideas: getAnnotatedIdeas(),
    });
  };

  private destroy = () => {
    removeAnnotation(this.props.annotation.id);
    this.props.destroyAnnotation({
      annotation: this.props.annotation,
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
        <p style={{ textAlign: 'right' }} onClick={this.props.close}>
          close
        </p>
        <a onClick={this.destroy}>delete</a>

        <ContentEditable
          className="annotation-control__note"
          html={this.state.note.html}
          tagName="article"
          onChange={this.updateNote}
        />
      </div>
    );
  }
}

// onPaste={this.pastePlainText
// <!-- <p>{JSON.stringify(this.props, null, ' ')}</p> -->
