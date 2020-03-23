import React from 'react';
import { IDocMap } from './position-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
  readingOrder: string[];
  documents: IDocMap;
  currentFile: string | null;
  currentChapterNum: number;
  currentIdea: number;
  progress: number;
  minutesLeft: number | null;
}

interface IState {
  file: string;
  idea: number;
  showNavigator: boolean;
}

class GoTo extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      file: props.currentFile || props.readingOrder[0],
      idea: props.currentIdea,
      showNavigator: false,
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

  toggleNavigator = () => {
    this.setState({ ...this.state, showNavigator: !this.state.showNavigator });
  };

  render() {
    const targetDoc = this.props.documents[this.state.file];
    const ideaIds = !targetDoc ? [1] : [...Array(targetDoc.ideas).keys()].map(i => ++i);

    return (
      <>
        <button className="goto__current--position" onClick={this.toggleNavigator}>
          {this.props.minutesLeft !== null ? (
            <>{this.props.t('minutes-left', { minutes: this.props.minutesLeft })} | </>
          ) : null}{' '}
          {this.props.progress}
          {this.props.t('percent-sign')} | {this.props.currentChapterNum + 1}.
          {this.props.currentIdea}
        </button>
        {this.state.showNavigator && (
          <div className="peeks">
            <div className="peek goto__navigator">
              <div className="peek-head">
                <div className="peek-info">
                  <p></p>
                </div>
                <button className="peek-close" onClick={this.toggleNavigator}>
                  ╳
                </button>
              </div>
              <div className="peek-content">
                <div className="goto__navigator__content">
                  <label className="goto__chapter">
                    {this.props.t('chapter')}
                    <br />
                    <select
                      onChange={this.setFile}
                      value={this.state.file}
                      className="goto__chapter__select"
                    >
                      {this.props.readingOrder.map(file => {
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
                    <select
                      className="goto__idea__select"
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

                  {this.state.file !== this.props.currentFile ||
                  this.state.idea !== this.props.currentIdea ? (
                    <button onClick={this.navigate}>{this.props.t('navigation:go')} &rarr;</button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default withTranslation('navigation')(GoTo);
