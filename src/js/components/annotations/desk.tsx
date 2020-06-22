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
import { IDocMap, INavDocument } from '../position-reducer';
import { getAnnotatedIdeas } from './utils';

interface IProps extends WithTranslation {
  allAnnotations: IAllAnnotations;
  readingOrder: string[];
  documents: IDocMap;
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

  nonChapters = Object.values(this.props.documents)
    .map(doc => doc.file)
    .filter(file => !this.props.readingOrder.includes(file));

  render() {
    return (
      <>
        <div className="scrollable-wrapper">
          <div className="scrollable nb-desk">
            <div className="auto-cols">
              <h1 className="nb-ui-big-title">{this.props.t('controls:annotations')}</h1>
            </div>
            {this.state.showAllChapters ? (
              this.props.readingOrder
                .concat(this.nonChapters)
                .map(file => (
                  <ChapterAnnotations
                    key={file}
                    collapsible={true}
                    document={this.props.documents[file]}
                    allAnnotations={this.props.allAnnotations}
                    addNote={this.addNote}
                    updateNote={this.props.updateNote}
                    destroyNote={this.props.destroyNote}
                    destroyAnnotation={this.destroyAnnotation}
                    t={this.props.t}
                  />
                ))
            ) : (
              <ChapterAnnotations
                collapsible={false}
                document={this.props.documents[docInfo.links.self]}
                allAnnotations={this.props.allAnnotations}
                addNote={this.addNote}
                updateNote={this.props.updateNote}
                destroyNote={this.props.destroyNote}
                destroyAnnotation={this.destroyAnnotation}
                t={this.props.t}
              />
            )}
          </div>
        </div>
        <div className="control__details">
          <div>
            <label
              className={`dot-select ${this.state.showAllChapters ? 'dot-selected' : ''}`}
              onClick={this.toggleAllChapters}
            >
              {this.state.showAllChapters ? '● ' : '○ '}
              {this.props.t('show-all')}
            </label>
          </div>
        </div>
      </>
    );
  }
}

interface IChapterAnnotationsProps {
  collapsible: boolean;
  document: INavDocument;
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

  toggleCollapsed = () => {
    this.setState({ ...this.state, collapsed: !this.state.collapsed });
  };

  render() {
    const { annotations, ideas, notes } = getChapterAnnotations(
      this.props.document.file,
      this.props.allAnnotations
    );

    const counts = {
      annotations: Object.keys(annotations).length,
      notes: Object.keys(notes).length,
    };

    return (
      <div className="nb-desk__chapter">
        {this.props.collapsible && (
          <div
            className={'title-bar' + (this.state.collapsed ? ' title-bar--collapsed' : '')}
            onClick={this.toggleCollapsed}
          >
            {this.props.document.order !== null && <>{this.props.document.order + 1} </>}
            {this.props.document.title}
            {counts.annotations > 0 && (
              <span className="nb-desk__count">✏️{counts.annotations}</span>
            )}
            {counts.notes > 0 && <span className="nb-desk__count">📝{counts.notes}</span>}
          </div>
        )}
        {!this.state.collapsed && (
          <>
            <Notes
              file={this.props.document.file}
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
        )}
      </div>
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
  const sortedIdeas = sortIdeas(props.ideas);
  //const groupedIdeas = groupIdeas(sortedIdeas);

  return (
    <div className="desk__list">
      <h2 className="nb-ui-title">{props.t('highlights')}</h2>

      {Object.keys(props.annotations).length ? (
        Object.values(props.annotations).map((annotation: IAnnotation, key) => (
          <div key={key} className={`desk__annotation`}>
            {false && (
              <span
                className="desk__annotation__destroy"
                onClick={() => props.destroyAnnotation(annotation)}
              >
                ╳
              </span>
            )}
            <div className="annotation__symbol">
              {annotation.style.symbol}
              <span className="annotation__name">{annotation.style.name}</span>
            </div>
            <div className="desk-annotation-wrapper">
              {sortedIdeas
                .filter(
                  (val, index) =>
                    index >= getIdeaNumber(annotation, Position.Start) &&
                    index <= getIdeaNumber(annotation, Position.End)
                )
                .map((idea, index2) => {
                  const text = idea.replace(
                    new RegExp(`data-id="${annotation.id}"`, 'g'),
                    'data-hl="this"'
                  );
                  return (
                    <span key={index2}>
                      <span dangerouslySetInnerHTML={{ __html: text }}></span>{' '}
                    </span>
                  );
                })}
            </div>

            {annotation.note ? (
              <div
                className="desk__annotation__note"
                dangerouslySetInnerHTML={{ __html: annotation.note }}
              ></div>
            ) : null}
          </div>
        ))
      ) : (
        <p className="nb-ui-blank">{props.t('no-annotations-in-chapter')}</p>
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
      <div className="desk__notes">
        <h2 className="nb-ui-title">{this.props.t('notes')}</h2>

        <div className="desk__note-editor">
          <ContentEditable
            className="desk__note-editor__input"
            html={this.state.newNote}
            tagName="article"
            onChange={this.updateNewNote}
          />
          <button onClick={this.addNote}>{this.props.t('add-note')}</button>
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
          <p className="nb-ui-blank">{this.props.t('no-notes-in-chapter')}</p>
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
    readingOrder: state.position.readingOrder,
    documents: state.position.documents,
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
