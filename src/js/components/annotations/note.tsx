import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { INote } from './reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import Icons from '../../icons';

interface IProps extends WithTranslation {
  note: INote;
  update(note: INote): void;
  destroy(note: INote): void;
}

interface IState {
  text: string;
  editMode: boolean;
}

class AnnotationNote extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      text: props.note.text,
      editMode: false,
    };
  }

  private updateState = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, text: event.target.value });
  };

  private enableEditMode = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, editMode: true });
    event.stopPropagation();
  };

  private update = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    const note = { ...this.props.note, text: this.state.text };
    this.props.update(note);
    this.setState({ ...this.state, editMode: false });
  };

  private destroy = (event: React.SyntheticEvent) => {
    this.props.destroy(this.props.note);
  };

  render() {
    return (
      <div className="desk__annotation" onClick={this.enableEditMode}>
        {this.state.editMode ? (
          <>
            <div className="desk__note-editor">
              <ContentEditable
                className="desk__note-editor__input"
                html={this.state.text}
                tagName="article"
                onChange={this.updateState}
              />
            </div>
            <div className="button-zero-bar button-zero-bar--bottom button-zero-bar--two-buttons">
              <button className="round-button" onClick={this.update}>
                {Icons.Check}
              </button>
              <button className="round-button round-button--warning" onClick={this.destroy}>
                {Icons.Delete}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="desk__note-wrapper"
              dangerouslySetInnerHTML={{ __html: this.props.note.text }}
            ></div>
          </>
        )}
      </div>
    );
  }
}

export default withTranslation('annotations')(AnnotationNote);
