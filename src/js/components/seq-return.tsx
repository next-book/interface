import React from 'react';
import { IDocument } from './manifest-reducer';

interface IProps {
  targetIdea: number | null;
  targetChapter: IDocument | null;
  sequential: boolean;
  thisChapter: boolean;
  isChapter: boolean;
  setPosition(resetSequence: boolean): void;
  startLink: string;
}

interface IState {
  collapsed: boolean;
}

export class SeqReturn extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      collapsed: false,
    };
  }

  resetPosition = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.setPosition(true);
  };

  highlightPosition = () => {
    if (this.props.targetIdea) highlightIdea(this.props.targetIdea);
  };

  firstTime = () => {
    return (
      <>
        <p>
          This book remembers where you stopped reading. You can view Table of Contents anytime by
          clicking the bottom bar where the next “page” is visible.
        </p>
        <div className="seq-buttons">
          <a href={this.props.startLink}>
            <b>Start reading</b>
          </a>
        </div>
      </>
    );
  };

  nthTime = () => {
    const link = this.props.targetChapter
      ? `./${this.props.targetChapter.file}#idea${this.props.targetIdea}`
      : '';

    const readingPosition =
      !this.props.isChapter || !this.props.thisChapter ? (
        <p>
          You read up to <a href={link}>sentence #{this.props.targetIdea}</a> in chapter{' '}
          <b>{this.props.targetChapter && this.props.targetChapter.title}</b>.
        </p>
      ) : (
        <p>
          You read up to sentence{' '}
          <a href={link} onClick={this.highlightPosition}>
            #{this.props.targetIdea} in this chapter
          </a>
          .
        </p>
      );

    return (
      (!this.props.sequential || !this.props.isChapter) && (
        <>
          {readingPosition}
          <div className="seq-buttons">
            {this.props.isChapter && (
              <a href="#" onClick={this.resetPosition}>
                Continue from&nbsp;here
              </a>
            )}
            <a
              href={link}
              onClick={() => {
                this.props.thisChapter ? this.highlightPosition : null;
              }}
            >
              <b>{this.props.isChapter ? 'Return back' : 'Continue reading'}</b>
            </a>
          </div>
        </>
      )
    );
  };

  toggleCollapse = () => {
    this.setState({
      ...this.state,
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const content = this.props.targetIdea === null ? this.firstTime() : this.nthTime();

    return (
      content && (
        <div className="seq-return-wrapper">
          <div className={`seq-return ${this.state.collapsed ? 'seq-return--collapsed' : ''}`}>
            <div onClick={this.toggleCollapse} className="seq-return-toggle ui-target">
              {this.state.collapsed ? '+' : '–'}
            </div>
            {content}
          </div>
        </div>
      )
    );
  }
}

function highlightIdea(id: number) {
  const el = document.getElementById(`idea${id}`);

  if (el === null) return null;

  const className = 'highlighted';

  el.classList.add(className);
  window.setTimeout(() => {
    el.classList.remove(className);
  }, 1000);
}
