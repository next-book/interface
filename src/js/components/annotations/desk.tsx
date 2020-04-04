import React from 'react';
import ContentEditable from 'react-contenteditable';
import { IState as ICombinedState } from '../../reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { ContentEditableEvent } from 'react-contenteditable';
import {
  reducer,
  IState as IAllAnnotations,
  IAnnotation,
  IAnnotationAndIdeas,
  IAnnotations,
  IIdeas,
  INote,
  INotes,
} from './reducer';
import { getChapterAnnotations } from './index';
import AnnotationNote from './note';
import { withTranslation, WithTranslation } from 'react-i18next';
import docInfo from '../../doc-info';
import { getAnnotatedIdeas } from './utils';

interface IProps extends WithTranslation {
  allAnnotations: IAllAnnotations;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
  addNote(data: INote): void;
  updateNote(note: INote): void;
  destroyNote(note: INote): void;
}

interface IState {
  showAllChapters: boolean;
}

enum Position {
  Start = 'start',
  End = 'end',
}

class AnnotationDesk extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      showAllChapters: false,
    };
  }

  private addNote = (id: number, text: string, file: string) => {
    this.props.addNote({
      dateCreated: 0,
      dateModified: 0,
      id,
      text,
      file,
    });
  };

  toggleAllChapters = () => {
    this.setState({ ...this.state, showAllChapters: !this.state.showAllChapters });
  };

  private destroyAnnotation = (annotation: IAnnotation) => {
    this.props.destroyAnnotation({
      annotation: annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  render() {
    return (
      <div className="scrollable-wrapper nb-desk">
        <button onClick={this.toggleAllChapters}>toggle</button>
        <ChapterAnnotations
          collapsible={false}
          file={docInfo.links.self}
          allAnnotations={this.props.allAnnotations}
          addNote={this.addNote}
          updateNote={this.props.updateNote}
          destroyNote={this.props.destroyNote}
          destroyAnnotation={this.destroyAnnotation}
          t={this.props.t}
        />
      </div>
    );
  }
}

interface IChapterAnnotationsProps {
  collapsible: boolean;
  file: string;
  allAnnotations: IAllAnnotations;
  destroyAnnotation(annotation: IAnnotation): void;
  addNote(id: number, text: string, file: string): void;
  updateNote(note: INote): void;
  destroyNote(note: INote): void;
  t: (s: string) => string;
}

interface IChapterAnnotationsState {
  collapsed: boolean;
}

class ChapterAnnotations extends React.Component<
  IChapterAnnotationsProps,
  IChapterAnnotationsState
> {
  constructor(props: IChapterAnnotationsProps) {
    super(props);

    this.state = {
      collapsed: props.collapsible,
    };
  }

  render() {
    const { annotations, ideas, notes } = getChapterAnnotations(
      this.props.file,
      this.props.allAnnotations
    );

    return (
      <>
        <Notes
          file={docInfo.links.self}
          notes={notes}
          addNote={this.props.addNote}
          updateNote={this.props.updateNote}
          destroyNote={this.props.destroyNote}
          t={this.props.t}
        />
        <Highlights
          annotations={annotations}
          ideas={ideas}
          destroyAnnotation={this.props.destroyAnnotation}
          t={this.props.t}
        />
      </>
    );
  }
}

interface IHighglightsProps {
  annotations: IAnnotations;
  ideas: IIdeas;
  destroyAnnotation(annotation: IAnnotation): void;
  t: (s: string) => string;
}

function Highlights(props: IHighglightsProps) {
  const sortedIdeas = docInfo.links.self !== null ? sortIdeas(props.ideas) : [];
  //const groupedIdeas = groupIdeas(sortedIdeas);

  return (
    <div className="scrollable desk__list">
      <h2>{props.t('highlights')}</h2>

      {Object.keys(props.annotations).length ? (
        Object.values(props.annotations).map((annotation, key) => (
          <div key={key} className="desk__annotation">
            <span
              className="desk__annotation__destroy"
              onClick={() => props.destroyAnnotation(annotation)}
            >
              ╳
            </span>

            {annotation.note ? (
              <div
                className="desk__annotation__note"
                dangerouslySetInnerHTML={{ __html: annotation.note }}
              ></div>
            ) : null}
            <small>
              {sortedIdeas
                .filter(
                  (val, index) =>
                    index >= getIdeaNumber(annotation, Position.Start) &&
                    index <= getIdeaNumber(annotation, Position.End)
                )
                .map((idea, index2) => (
                  <span key={index2}>
                    <span dangerouslySetInnerHTML={{ __html: idea }}></span>{' '}
                  </span>
                ))}
            </small>
          </div>
        ))
      ) : (
        <i>{props.t('no-annotations-in-chapter')}</i>
      )}
    </div>
  );
}

interface INotesProps {
  file: string;
  notes: INotes;
  addNote(id: number, text: string, file: string): void;
  updateNote(note: INote): void;
  destroyNote(note: INote): void;
  t: (s: string) => string;
}

interface INotesState {
  newNote: string;
}

class Notes extends React.Component<INotesProps, INotesState> {
  constructor(props: INotesProps) {
    super(props);

    this.state = {
      newNote: '',
    };
  }

  private updateNewNote = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, newNote: event.target.value });
  };

  private addNote = () => {
    this.props.addNote(getNewNoteId(this.props.notes), this.state.newNote, this.props.file);

    this.setState({ ...this.state, newNote: '' });
  };

  render() {
    return (
      <div className="scrollable desk__notes">
        <h2>{this.props.t('notes')}</h2>
        <div className="desk__annotation">
          <div className="desk__note-editor">
            <ContentEditable
              className="desk__note-editor__input"
              html={this.state.newNote}
              tagName="article"
              onChange={this.updateNewNote}
            />
            <button onClick={this.addNote}>{this.props.t('add-note')}</button>
          </div>
        </div>

        {Object.values(this.props.notes).length ? (
          Object.entries(this.props.notes)
            .reverse()
            .map(entry => {
              const [key, note] = entry;
              return (
                <AnnotationNote
                  key={key}
                  note={note}
                  update={this.props.updateNote}
                  destroy={this.props.destroyNote}
                />
              );
            })
        ) : (
          <i>{this.props.t('no-notes-in-chapter')}</i>
        )}
      </div>
    );
  }
}
const getNewNoteId = (notes: INotes) => {
  const keys = Object.keys(notes).map(key => parseInt(key, 10));
  return keys.length > 0 ? Math.max(...keys) + 1 : 1;
};

const getIdeaNumber = (annotation: IAnnotation, position: Position): number =>
  parseIdeaNumber(annotation.range[position]);

const parseIdeaNumber = (id: string) => parseInt(id.replace('idea', ''), 10);

const sortIdeas = (ideas: IIdeas) =>
  Object.entries(ideas).reduce((acc: string[], entry: [string, string]) => {
    const [key, value] = entry;
    acc[parseIdeaNumber(key)] = value;
    return acc;
  }, []);

const mapStateToProps = (state: ICombinedState) => {
  return {
    allAnnotations: state.annotations,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      addNote: reducer.addNote,
      updateNote: reducer.updateNote,
      destroyNote: reducer.destroyNote,
      destroyAnnotation: reducer.destroyAnnotation,
    },
    dispatch
  );
};

export default withTranslation('annotations')(
  connect(mapStateToProps, mapDispatchToProps)(AnnotationDesk)
);
