import React from 'react';
import { IDocument } from './manifest-reducer';

import { WithT } from 'i18next';
import { Trans } from 'react-i18next';

export enum Sequential {
  No = 0,
  Yes = 1,
  Initializing = 2,
  Disabled = 3,
}

interface IProps extends WithT {
  targetIdea: number | null;
  targetChapter: IDocument | null;
  sequential: Sequential;
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
      collapsed: props.isChapter ? true : false,
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
        <p>{this.props.t('intro')}</p>
        <div className="seq-buttons">
          <a href={this.props.startLink}>
            <b>{this.props.t('start')}</b>
          </a>
        </div>
      </>
    );
  };

  nthTime = () => {
    const link = this.props.targetChapter
      ? `./${this.props.targetChapter.file}#idea${this.props.targetIdea}`
      : '';
    const idea = this.props.targetIdea;
    const chapter = this.props.targetChapter && this.props.targetChapter.title;

    const readingPosition =
      !this.props.isChapter || !this.props.thisChapter ? (
        <p>
          <Trans i18nKey="navigation:seqReturnAnotherChapter">
            You read up to <a href={link}>sentence #{{ idea }}</a> in chapter <b>{{ chapter }}</b>.
          </Trans>
        </p>
      ) : (
        <p>
          <Trans i18nKey="navigation:seqReturnThisChapter">
            You read up to{' '}
            <a href={link} onClick={this.highlightPosition}>
              sentence #{{ idea }}
            </a>{' '}
            in this chapter.
          </Trans>
        </p>
      );

    return (
      (this.props.sequential === Sequential.No || !this.props.isChapter) && (
        <>
          {readingPosition}
          <div className="seq-buttons">
            {this.props.isChapter && (
              <a href="#" onClick={this.resetPosition}>
                👇 {this.props.t('continue')}
              </a>
            )}
            <a
              href={link}
              onClick={() => {
                this.setState({ ...this.state, collapsed: true });
                this.props.thisChapter ? this.highlightPosition : null;
              }}
            >
              <b>
                {this.props.isChapter
                  ? `🔙 ${this.props.t('return')}`
                  : this.props.t('continueReading')}
              </b>
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
    const classes = ['seq-return-wrapper'];
    const collapsedText =
      this.props.targetChapter !== null &&
      this.props.targetChapter.order !== null &&
      this.props.targetIdea !== null
        ? `🔙 ${this.props.targetChapter.order + 1}.${this.props.targetIdea}`
        : '➕';

    if (this.props.targetIdea === null) classes.push('seq-return-wrapper--high');

    return (
      content && (
        <div className={classes.join(' ')}>
          <div className={`seq-return ${this.state.collapsed ? 'seq-return--collapsed' : ''}`}>
            <div onClick={this.toggleCollapse} className="seq-return-toggle ui-target">
              {this.state.collapsed ? collapsedText : '➖'}
            </div>
            {this.state.collapsed ? null : content}
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
