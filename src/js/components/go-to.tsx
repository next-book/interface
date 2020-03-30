import React from 'react';
import { connect } from 'react-redux';
import { IPosition, IDocMap, INavDocument } from './position-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IState as ICombinedState } from '../reducer';

interface IProps extends WithTranslation {
  readingOrder: string[];
  scrollRatio: number;
  documents: IDocMap;
  position: IPosition | null;
  showNavigator: boolean;
}

interface IState {
  file: string;
  idea: number;
}

class GoTo extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      file: props.position !== null ? props.position.file : props.readingOrder[0],
      idea: props.position !== null ? props.position.idea : 0,
    };
  }

  setFile = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, file: (event.target as HTMLFormElement).value });
  };

  setIdea = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, idea: (event.target as HTMLFormElement).value });
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

    return this.props.showNavigator ? (
      <div className="goto">
        <label className="goto__chapter">
          {this.props.t('chapter')}
          <br />
          <select onChange={this.setFile} value={this.state.file} className="goto__chapter__select">
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
        <label className="goto__idea">
          {this.props.t('sentence')}
          <br />
          <select className="goto__idea__select" onChange={this.setIdea} value={this.state.idea}>
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
    ) : (
      <span className="current-position">
        {minutesLeft !== null ? (
          <>{this.props.t('minutes-left', { minutes: minutesLeft })} &middot; </>
        ) : null}{' '}
        {this.props.t('progress', { percent: cropProgress(progress) })} &middot;{' '}
        {ro.indexOf(this.props.position.file) + 1}.{this.props.position.idea}
      </span>
    );
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
    readingOrder: state.position.readingOrder,
    documents: state.position.documents,
    scrollRatio: state.position.scrollRatio,
    position: state.position.position,
  };
};

export default withTranslation('navigation')(connect(mapStateToProps)(GoTo));
