import React from 'react';
import ContentEditable from 'react-contenteditable';
import { ContentEditableEvent } from 'react-contenteditable';
import { IAnnotation, IAnnotations, IIdeas, IChapterNote } from './annotations-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
  annotations: IAnnotations;
  ideas: IIdeas;
  chapterNote: string;
  chapterNum: string;
  updateChapterNote(note: IChapterNote): void;
  close(): void;
}

interface IState {
  showAllChapters: boolean;
  sortedIdeas: string[];
  groupedIdeas: string[][];
  chapterNote: string;
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
      chapterNote: this.props.chapterNote || '',
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

  private updateNote = (event: ContentEditableEvent) => {
    this.setState({ ...this.state, chapterNote: event.target.value });

    this.props.updateChapterNote({ note: event.target.value, chapterNum: this.props.chapterNum });
  };

  render() {
    // <label>
    //   <input type="checkbox" onChange={this.toggleAllChapters} /> show all chapters
    // </label>
    const notes = Object.values(this.props.annotations)
      .sort(this.sortAnnotationsByIdea)
      .filter(annotation => annotation.note !== '');

    return (
      <div className="annotation__desk">
        <div className="annotation__desk__head">
          <div className="annotation__desk__info">
            <p>{this.props.t('work-desk')}</p>
          </div>
          <button className="annotation__desk__close" onClick={this.props.close}>
            ╳
          </button>
        </div>

        <div className="annotation__desc_cols">
          <div className="annotation__list">
            {this.state.groupedIdeas.length
              ? this.state.groupedIdeas.map((group, groupKey) =>
                  !group.length ? null : (
                    <p key={groupKey} className="annotation__list__detail">
                      {group.map((idea, ideaKey) => (
                        <span key={ideaKey} dangerouslySetInnerHTML={{ __html: idea }}></span>
                      ))}
                    </p>
                  )
                )
              : this.props.t('no-annotations-in-chapter')}
          </div>
          <div className="annotation__notes">
            <ContentEditable
              className="annotation__chapter-note"
              html={this.state.chapterNote}
              tagName="article"
              onChange={this.updateNote}
            />

            {notes.length
              ? notes.map((annotation, key) => (
                  <div key={key} className="annotation__note">
                    <div dangerouslySetInnerHTML={{ __html: annotation.note }}></div>
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
                    <hr />
                  </div>
                ))
              : this.props.t('no-notes-in-chapter')}
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation('annotations')(AnnotationDetail);
