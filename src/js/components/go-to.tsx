import React from 'react';
import { INavDocument } from './navigation-reducer';
import { WithT } from 'i18next';

interface IProps extends WithT {
  readingOrder: INavDocument[];
  currentChapterNum: number;
  currentIdea: number;
}

interface IState {
  chapterNum: number;
  idea: number;
  showNavigator: boolean;
}

export class GoTo extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      chapterNum: props.currentChapterNum,
      idea: props.currentIdea,
      showNavigator: false,
    };
  }

  setChapterNum = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, chapterNum: (event.target as HTMLFormElement).value });
  };

  setIdea = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, idea: (event.target as HTMLFormElement).value });
  };

  navigate = (event: React.SyntheticEvent) => {
    const url = window.location.href;
    const baseUrl = url.substr(0, url.lastIndexOf('/'));
    const file = this.props.readingOrder[this.state.chapterNum].file;

    window.location.href = `${baseUrl}/${file}#idea${this.state.idea}`;
  };

  toggleNavigator = () => {
    this.setState({ ...this.state, showNavigator: !this.state.showNavigator });
  };

  render() {
    const ideaIds = [...Array(this.props.readingOrder[this.state.chapterNum].ideas).keys()].map(
      i => ++i
    );

    return (
      <>
        <button className="goto__current--position" onClick={this.toggleNavigator}>
          {this.props.currentChapterNum + 1}.{this.props.currentIdea}
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
                  <select
                    onChange={this.setChapterNum}
                    value={this.state.chapterNum}
                    className="goto__chapter"
                  >
                    {this.props.readingOrder.map(doc => {
                      if (doc.order === null) return null;

                      const value = doc.order.toString();
                      return (
                        <option key={value} value={value}>
                          {doc.order + 1} {doc.title}
                        </option>
                      );
                    })}
                  </select>
                  <select className="goto__idea" onChange={this.setIdea} value={this.state.idea}>
                    {ideaIds.map(i => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  {this.state.chapterNum !== this.props.currentChapterNum ||
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
