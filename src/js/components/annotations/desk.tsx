import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { IAnnotation, IAnnotations, IIdeas, INote, INotes } from './reducer';
import AnnotationNote from './note';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
  annotations: IAnnotations;
  ideas: IIdeas;
  notes: INotes;
  chapterNum: string;
  destroyAnnotation(data: IAnnotation): void;
  addNote(note: string): void;
  updateNote(note: INote): void;
  destroyNote(note: INote): void;
  close(): void;
}

interface IState {
  showAllChapters: boolean;
  sortedIdeas: string[];
  groupedIdeas: string[][];
  newNote: string;
}

enum Position {
  Start = 'start',
  End = 'end',
}

class AnnotationDetail extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const sortedIdeas = Object.entries(props.ideas).reduce(
      (acc: string[], entry: [string, string]) => {
        const [key, value] = entry;
        acc[this.parseIdeaNumber(key)] = value;
        return acc;
      },
      []
    );

    const groupedIdeas = this.groupIdeas(sortedIdeas);

    this.state = {
      showAllChapters: false,
      sortedIdeas,
      groupedIdeas,
      newNote: '',
    };
  }

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
    Object.values(this.props.annotations)
      .sort(this.sortAnnotationsByIdea)
      .map((annotation, index) => (
        <div className="annotations__list__detail" key={index}>
          {this.state.sortedIdeas
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

  private updateNewNoteState = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, newNote: event.target.value });
  };

  private addNote = (event: React.SyntheticEvent) => {
    this.props.addNote(this.state.newNote);
    this.setState({ ...this.state, newNote: '' });
  };

  render() {
    return (
      <div className="annotation__desk ui-target">
        <div className="annotation__desk__head">
          <div className="annotation__desk__info">
            <p>{this.props.t('work-desk')}</p>
          </div>
          <button className="annotation__desk__close" onClick={this.props.close}>
            ╳
          </button>
        </div>

        <div className="annotation__desc_cols">
          <div className="annotation__notes">
            <h2>{this.props.t('notes')}</h2>
            <div className="desk--annotation">
              <div className="note-editor">
                <ContentEditable
                  className="note-editor__input"
                  html={this.state.newNote}
                  tagName="article"
                  onChange={this.updateNewNoteState}
                />
                <button onClick={this.addNote}>{this.props.t('add-note')}</button>
              </div>
            </div>

            {Object.values(this.props.notes).length ? (
              Object.values(this.props.notes)
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
          <div className="annotation__list">
            <h2>{this.props.t('annotations-in-text')}</h2>

            {Object.keys(this.props.annotations).length ? (
              Object.values(this.props.annotations).map((annotation, key) => (
                <div key={key} className="desk--annotation">
                  <span
                    className="desk--annotation__destroy"
                    onClick={() => this.props.destroyAnnotation(annotation)}
                  >
                    ╳
                  </span>

                  {annotation.note ? (
                    <div
                      className="desk-annotation__note"
                      dangerouslySetInnerHTML={{ __html: annotation.note }}
                    ></div>
                  ) : null}
                  <small>
                    {this.state.sortedIdeas
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
      </div>
    );
  }
}

export default withTranslation('annotations')(AnnotationDetail);
