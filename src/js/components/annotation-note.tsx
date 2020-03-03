import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { INote } from './annotations-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';

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

  private toggleUpdateState = () => {
    this.setState({ ...this.state, editMode: !this.state.editMode });
  };

  private update = (event: React.SyntheticEvent) => {
    const note = { ...this.props.note, text: this.state.text };
    this.props.update(note);
    this.setState({ ...this.state, editMode: false });
  };

  private destroy = (event: React.SyntheticEvent) => {
    this.props.destroy(this.props.note);
  };

  render() {
    return (
      <div className="desk--annotation">
        <span className="desk--annotation__destroy" onClick={this.destroy}>
          ╳
        </span>
        {this.state.editMode ? (
          <div className="note-editor">
            <ContentEditable
              className="note-editor__input"
              html={this.state.text}
              tagName="article"
              onChange={this.updateState}
            />
            <button onClick={this.update}>{this.props.t('update-note')}</button>
          </div>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: this.props.note.text }}></div>
            <button onClick={this.toggleUpdateState}>{this.props.t('edit-note')}</button>
          </>
        )}
      </div>
    );
  }
}

export default withTranslation('annotations')(AnnotationNote);
