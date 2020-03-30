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
  annotations: IAllAnnotations;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
  addNote(data: INote): void;
  updateNote(note: INote): void;
  destroyNote(note: INote): void;
}

interface IState {
  chapter: {
    annotations: IAnnotations;
    ideas: IIdeas;
    notes: INotes;
    sortedIdeas: string[];
    groupedIdeas: string[][];
  };
  showAllChapters: boolean;
  newNote: string;
}

enum Position {
  Start = 'start',
  End = 'end',
}

class AnnotationDesk extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const { annotations, ideas, notes } = getChapterAnnotations(
      docInfo.links.self,
      this.props.annotations
    );

    const sortedIdeas =
      docInfo.links.self !== null
        ? Object.entries(ideas).reduce((acc: string[], entry: [string, string]) => {
            const [key, value] = entry;
            acc[this.parseIdeaNumber(key)] = value;
            return acc;
          }, [])
        : [];

    const groupedIdeas = this.groupIdeas(sortedIdeas);

    this.state = {
      showAllChapters: false,
      newNote: '',
      chapter: {
        annotations,
        ideas,
        notes,
        sortedIdeas,
        groupedIdeas,
      },
    };
  }

  private addNote = () => {
    this.props.addNote({
      dateCreated: 0,
      dateModified: 0,
      id: this.getNewNoteId(),
      text: this.state.newNote,
      file: docInfo.links.self,
    });

    this.setState({ ...this.state, newNote: '' });
  };

  private getNewNoteId = () => {
    const keys = Object.keys(this.state.chapter.notes).map(key => parseInt(key, 10));
    return keys.length > 0 ? Math.max(...keys) + 1 : 1;
  };

  private updateNewNoteState = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, newNote: event.target.value });
  };

  toggleAllChapters = () => {
    this.setState({ ...this.state, showAllChapters: !this.state.showAllChapters });
  };

  sortAnnotationsByIdea = (a: IAnnotation, b: IAnnotation) => {
    return this.ideaNumber(a, Position.Start) - this.ideaNumber(b, Position.Start);
  };

  ideaNumber = (annotation: IAnnotation, position: Position): number =>
    this.parseIdeaNumber(annotation.range[position]);

  parseIdeaNumber = (id: string) => parseInt(id.replace('idea', ''), 10);

  renderAnnotations = () => {
    Object.values(this.state.chapter.annotations)
      .sort(this.sortAnnotationsByIdea)
      .map((annotation, index) => (
        <div className="desk__list__detail" key={index}>
          {this.state.chapter.sortedIdeas
            .filter(
              (val, index) =>
                index >= this.ideaNumber(annotation, Position.Start) &&
                index <= this.ideaNumber(annotation, Position.End)
            )
            .map((idea, index2) => (
              <span key={index2}>
                <span dangerouslySetInnerHTML={{ __html: idea }}></span>{' '}
              </span>
            ))}
        </div>
      ));
  };

  groupIdeas = (ideas: string[]): string[][] => {
    let lastKey: number = -9;

    return ideas.reduce(
      (acc: string[][], idea, index) => {
        const arr: string[] = [idea];

        // same idea
        if (lastKey === index) return acc;
        // first idea ever
        else if (acc[0].length === 0) acc.push(arr);
        // idea without a gap
        else if (lastKey + 1 === index) acc[acc.length - 1].push(idea);
        // idea after a gap
        else acc.push(arr);

        lastKey = index;
        return acc;
      },
      [[]]
    );
  };

  private destroyAnnotation = (annotation: IAnnotation) => {
    this.props.destroyAnnotation({
      annotation: annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  render() {
    return (
      <div className="desk">
        <div className="desk__notes">
          <h2>{this.props.t('notes')}</h2>
          <div className="desk__annotation">
            <div className="desk__note-editor">
              <ContentEditable
                className="desk__note-editor__input"
                html={this.state.newNote}
                tagName="article"
                onChange={this.updateNewNoteState}
              />
              <button onClick={this.addNote}>{this.props.t('add-note')}</button>
            </div>
          </div>

          {Object.values(this.state.chapter.notes).length ? (
            Object.values(this.state.chapter.notes)
              .reverse()
              .map((note, index) => (
                <AnnotationNote
                  key={index}
                  note={note}
                  update={this.props.updateNote}
                  destroy={this.props.destroyNote}
                />
              ))
          ) : (
            <i>{this.props.t('no-notes-in-chapter')}</i>
          )}
        </div>
        <div className="desk__list">
          <h2>{this.props.t('annotations-in-text')}</h2>

          {Object.keys(this.state.chapter.annotations).length ? (
            Object.values(this.state.chapter.annotations).map((annotation, key) => (
              <div key={key} className="desk__annotation">
                <span
                  className="desk__annotation__destroy"
                  onClick={() => this.destroyAnnotation(annotation)}
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
                  {this.state.chapter.sortedIdeas
                    .filter(
                      (val, index) =>
                        index >= this.ideaNumber(annotation, Position.Start) &&
                        index <= this.ideaNumber(annotation, Position.End)
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
            <i>{this.props.t('no-annotations-in-chapter')}</i>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    annotations: state.annotations,
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
