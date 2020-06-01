import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IPosition, IDocMap, INavDocument } from './position-reducer';
import { reducer as configReducer, ProgressKind } from './config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IState as ICombinedState } from '../reducer';

export enum ProgressForm {
  Display,
  Goto,
  Config,
}

interface IProps extends WithTranslation {
  readingOrder: string[];
  scrollRatio: number;
  documents: IDocMap;
  position: IPosition | null;
  form: ProgressForm;
  displayMinutesInChapter: boolean;
  displayPercentRead: boolean;
  displayPosition: boolean;
  toggleDisplay: (kind: ProgressKind) => void;
}

interface IState {
  file: string;
  idea: number;
  collapsed: boolean;
}

class Progress extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      file: props.position !== null ? props.position.file : props.readingOrder[0],
      idea: props.position !== null ? props.position.idea : 0,
      collapsed: true,
    };
  }

  setFile = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, file: (event.target as HTMLFormElement).value });
  };

  setIdea = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, idea: (event.target as HTMLFormElement).value });
  };

  toggleCollapsed = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, collapsed: !this.state.collapsed });
  };

  navigate = (event: React.SyntheticEvent) => {
    const url = window.location.href;
    const baseUrl = url.substr(0, url.lastIndexOf('/'));

    window.location.href = `${baseUrl}/${this.state.file}#idea${this.state.idea}`;
  };

  render() {
    if (this.props.position === null) return null;

    const targetDoc = this.props.documents[this.state.file];
    const ideaIds = !targetDoc ? [1] : [...Array(targetDoc.ideas).keys()].map(i => ++i);
    const ro = this.props.readingOrder;

    const chapter = this.props.documents[this.props.position.file];
    const { totalWords } = this.props.documents[ro[ro.length - 1]];
    const { offset, fraction } =
      chapter !== null ? getProgress(chapter, totalWords) : { offset: 0, fraction: 0 };
    const progress = offset + fraction * this.props.scrollRatio;
    const minutesLeft = chapter ? countMinutesLeft(this.props.scrollRatio, chapter.words) : null;

    switch (this.props.form) {
      case ProgressForm.Goto:
        return this.state.collapsed ? (
          <div className="nb-progress">
            <button className="progress--collapsed" onClick={this.toggleCollapsed}>
              {this.props.t('turn-to')}
            </button>
          </div>
        ) : (
          <div className="nb-progress">
            <div className="progress">
              <label className="progress__chapter">
                {this.props.t('chapter')}
                <br />
                <select
                  onChange={this.setFile}
                  value={this.state.file}
                  className="progress__chapter__select"
                >
                  {ro.map(file => {
                    const doc = this.props.documents[file];
                    if (doc.order === null) return null;

                    const value = doc.file;
                    return (
                      <option key={value} value={value}>
                        {doc.order + 1} {doc.title}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="progress__idea">
                {this.props.t('sentence')}
                <br />
                <select
                  className="progress__idea__select"
                  onChange={this.setIdea}
                  value={this.state.idea}
                >
                  {ideaIds.map(i => (
                    <option key={i} value={i}>
                      {this.props.t('nthSentence', { number: i })}
                    </option>
                  ))}
                </select>
              </label>

              {this.state.file !== this.props.position.file ||
              this.state.idea !== this.props.position.idea ? (
                <button onClick={this.navigate}>{this.props.t('navigation:go')} &rarr;</button>
              ) : null}
            </div>
          </div>
        );
      case ProgressForm.Display:
        const displays = [];

        if (this.props.displayMinutesInChapter && minutesLeft !== null)
          displays.push(this.props.t('minutes-left', { minutes: minutesLeft }));

        if (this.props.displayPercentRead)
          displays.push(this.props.t('progress', { percent: cropProgress(progress) }));

        if (this.props.displayPosition)
          displays.push(`${ro.indexOf(this.props.position.file) + 1}.${this.props.position.idea}`);

        return (
          <div className="nb-progress">
            <span className="current-position current-position--display">
              {displays.map((display, index) => (
                <span key={index}>
                  {display}
                  {index !== displays.length - 1 && <> &middot; </>}
                </span>
              ))}
            </span>
          </div>
        );
      case ProgressForm.Config:
        return (
          <div className="control__details nb-progress">
            <span className="current-position current-position--config">
              <label onClick={() => this.props.toggleDisplay(ProgressKind.MinutesInChapter)}>
                {this.props.displayMinutesInChapter ? '● ' : '○ '}
                {minutesLeft !== null
                  ? this.props.t('minutes-left-long', { minutes: minutesLeft })
                  : null}
              </label>

              <label onClick={() => this.props.toggleDisplay(ProgressKind.PercentRead)}>
                {this.props.displayPercentRead ? '● ' : '○ '}
                {this.props.t('progress-long', { percent: cropProgress(progress) })}
              </label>

              <label onClick={() => this.props.toggleDisplay(ProgressKind.Position)}>
                {this.props.displayPosition ? '● ' : '○ '}
                {this.props.t('nthChapterNthSentence', {
                  chapter: ro.indexOf(this.props.position.file) + 1,
                  idea: this.props.position.idea,
                })}
              </label>
            </span>
          </div>
        );
    }
  }
}

function countMinutesLeft(scrollRatio: number, wordsInChapter: number) {
  const wordsPerMinute = 240;
  const left = ((1 - scrollRatio) * wordsInChapter) / wordsPerMinute;
  return left > 0 ? Math.floor(left) : 0;
}

export function getProgress(chapter: INavDocument, totalWords: number) {
  if (!chapter || !totalWords) return { offset: 0, fraction: 0 };

  const offset = (chapter.offsetWords / totalWords) * 100;
  const fraction = (chapter.words / totalWords) * 100;

  return { offset, fraction };
}

function cropProgress(progress: number) {
  return progress > 100 ? 100 : progress < 0 ? 0 : Math.floor(progress);
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    displayMinutesInChapter: state.config.displayMinutesInChapter,
    displayPercentRead: state.config.displayPercentRead,
    displayPosition: state.config.displayPosition,
    readingOrder: state.position.readingOrder,
    documents: state.position.documents,
    scrollRatio: state.position.scrollRatio,
    position: state.position.position,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      toggleDisplay: configReducer.toggleDisplay,
    },
    dispatch
  );
};

export default withTranslation('navigation')(
  connect(mapStateToProps, mapDispatchToProps)(Progress)
);
