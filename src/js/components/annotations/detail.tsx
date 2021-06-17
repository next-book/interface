import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { IAnnotation, IAnnotationAndIdeas } from './reducer';
import { getAnnotatedIdeas, updateHead } from './utils';
import { withTranslation, WithTranslation } from 'react-i18next';
import Icons from '../../icons';

interface IProps extends WithTranslation {
  annotation: IAnnotation;
  close(): void;
  updateAnnotation(data: IAnnotationAndIdeas): void;
  destroyAnnotation(data: IAnnotation): void;
}

interface IState {
  note: string;
}

class AnnotationDetail extends React.Component<IProps, IState> {
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

  destroyAnnotation = (annotation: IAnnotation) => {
    if (window.confirm(this.props.t('confirm-destroy'))) this.props.destroyAnnotation(annotation);
  };

  // private pastePlainText = event => {
  //   event.preventDefault();

  //   const text = event.clipboardData.getData('text/plain');
  //   document.execCommand('insertHTML', false, text);
  // };

  render() {
    return this.props.annotation === undefined ? null : (
      <div className="annotation-detail">
        <div className="button-zero-bar button-zero-bar--single-button">
          <button
            className="round-button round-button--warning"
            onClick={() => this.destroyAnnotation(this.props.annotation)}
          >
            {Icons.Delete}
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

export default withTranslation('annotations')(AnnotationDetail);

// onPaste={this.pastePlainText
// <!-- <p>{JSON.stringify(this.props, null, ' ')}</p> -->
