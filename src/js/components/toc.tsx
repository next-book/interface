import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { IToc } from './manifest-reducer';
import { INavDocument } from './navigation-reducer';

interface IProps {
  idea: number;
  chapterNum: number;
  readingOrder: INavDocument[];
}

interface IState {
  showGoTo: boolean;
}

class Toc extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      showGoTo: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  toggleGoTo = () => {
    this.setState({ ...this.state, showGoTo: !this.state.showGoTo });
  };

  render() {
    return (
      <>
        <button className="current-position" onClick={this.toggleGoTo}>
          {this.props.chapterNum + 1}.{this.props.idea}
        </button>
        {this.state.showGoTo ? (
          <GoTo
            currentChapterNum={this.props.chapterNum}
            currentIdea={this.props.idea}
            readingOrder={this.props.readingOrder}
          />
        ) : null}
        <ol>
          {this.props.readingOrder.map(doc => {
            const current = this.props.chapterNum === doc.order;

            return (
              <li key={doc.order !== null ? doc.order : ''}>
                <a className={current ? 'current-chapter' : undefined} href={doc.file}>
                  {doc.title}
                </a>
                <ul>
                  {doc.toc && doc.toc[0].children.length
                    ? doc.toc[0].children.map((section, index) => {
                        return <Section key={index} file={doc.file} section={section} />;
                      })
                    : null}
                </ul>
              </li>
            );
          })}
        </ol>
      </>
    );
  }
}

interface IGotoProps {
  readingOrder: INavDocument[];
  currentChapterNum: number;
  currentIdea: number;
}

interface IGotoState {
  chapterNum: number;
  idea: number;
}

class GoTo extends React.Component<IGotoProps, IGotoState> {
  constructor(props: IGotoProps) {
    super(props);

    this.state = {
      chapterNum: props.currentChapterNum,
      idea: props.currentIdea,
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

  render() {
    const ideaIds = [...Array(this.props.readingOrder[this.state.chapterNum].ideas).keys()].map(
      i => ++i
    );

    return (
      <div className="goto">
        <select
          onChange={this.setChapterNum}
          value={this.state.chapterNum}
          className="goto__chapter"
        >
          {this.props.readingOrder.map(doc => {
            if (doc.order === null) return null;

            const value = doc.order.toString();
            <option key={value} value={value}>
              {doc.order + 1} {doc.title}
            </option>;
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
          <button onClick={this.navigate}>Go &rarr;</button>
        ) : null}
      </div>
    );
  }
}

interface ISectionProps {
  file: string;
  section: IToc;
}

function Section(props: ISectionProps) {
  return (
    <li>
      <a href={`${props.file}#${props.section.id}`}>{props.section.name}</a>
    </li>
  );
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    readingOrder: state.navigation.readingOrder,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Toc);
