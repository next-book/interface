import React from 'react';
import { IDocument } from './manifest-reducer';

interface IProps {
  idea: number;
  targetChapter: IDocument;
  sequential: boolean;
  thisChapter: boolean;
  isChapter: boolean;
  setPosition(resetSequence: boolean): void;
  startLink: string;
}

export class SeqReturn extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  resetPosition = e => {
    e.preventDefault();
    this.props.setPosition(true);
  };

  highlightPosition = () => {
    highlightIdea(this.props.idea);
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
      ? `./${this.props.targetChapter.file}#idea${this.props.idea}`
      : '';

    const readingPosition =
      !this.props.isChapter || !this.props.thisChapter ? (
        <p>
          You read up to <a href={link}>sentence #{this.props.idea}</a> in chapter{' '}
          <b>{this.props.targetChapter && this.props.targetChapter.title}</b>.
        </p>
      ) : (
        <p>
          You read up to sentence{' '}
          <a href={link} onClick={this.highlightPosition}>
            #{this.props.idea} in this chapter
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

  render() {
    const content = this.props.idea === null ? this.firstTime() : this.nthTime();

    return (
      content && (
        <div className="seq-return-wrapper">
          <div className="seq-return">{content}</div>
        </div>
      )
    );
  }
}

function highlightIdea(id) {
  if (id === null) return null;
  const el = document.getElementById(`idea${id}`);

  if (el === null) return null;

  const className = 'highlighted';

  el.classList.add(className);
  window.setTimeout(() => {
    el.classList.remove(className);
  }, 1000);
}
