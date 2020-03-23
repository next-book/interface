import React from 'react';
import { IDocument, DocRole } from './manifest-reducer';

import { withTranslation, WithTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import docInfo from '../doc-info';

export enum Sequential {
  No = 0,
  Yes = 1,
}

export enum SeqReturnStatus {
  Initializing = 0,
  Enabled = 1,
  Disabled = 2,
}

interface IProps extends WithTranslation {
  targetIdea: number | null;
  targetChapter: IDocument | null;
  sequential: Sequential;
  status: SeqReturnStatus;
  docRole: DocRole;
  setPosition(resetSequence: boolean): void;
  startLink: string;
}

interface IState {
  collapsed: boolean;
}

class SeqReturn extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      collapsed: props.docRole !== DocRole.Index,
    };
  }

  resetPosition = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.setPosition(true);
  };

  highlightPosition = () => {
    if (this.props.targetIdea) highlightIdea(this.props.targetIdea);
  };

  getOpenFirstChapterContent = () => {
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

  getReturnToChapterContent = () => {
    if (this.props.targetChapter === null) return null;

    const chapter = this.props.targetChapter;
    const idea = this.props.targetIdea;
    const link = `./${chapter.file}#idea${idea}`;
    const sameChapter = chapter.order !== docInfo.order;
    const title = chapter.title;

    const readingPosition =
      this.props.docRole !== DocRole.Chapter || !sameChapter ? (
        <p>
          <Trans i18nKey="navigation:seqReturnAnotherChapter">
            You read up to <a href={link}>sentence #{{ idea }}</a> in chapter <b>{{ title }}</b>.
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
      (this.props.sequential === Sequential.No || this.props.docRole !== DocRole.Chapter) && (
        <>
          {readingPosition}
          <div className="seq-buttons">
            {this.props.docRole === DocRole.Chapter && (
              <a href="#" onClick={this.resetPosition}>
                👇 {this.props.t('continue')}
              </a>
            )}
            <a
              href={link}
              onClick={() => {
                this.setState({ ...this.state, collapsed: true });
                sameChapter ? this.highlightPosition : null;
              }}
            >
              <b>
                {this.props.docRole === DocRole.Chapter
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

  getCollapsedContent = () =>
    this.props.status !== SeqReturnStatus.Initializing &&
    this.props.targetChapter !== null &&
    this.props.targetChapter.order !== null &&
    this.props.targetIdea !== null
      ? `🔙 ${this.props.targetChapter.order + 1}.${this.props.targetIdea}`
      : '➕';

  render() {
    let getContent = null;
    const classes = ['seq-return-wrapper'];

    if (this.props.status === SeqReturnStatus.Disabled) return null;
    if (this.props.status === SeqReturnStatus.Initializing) {
      if (this.props.docRole === DocRole.Index) {
        getContent = this.getOpenFirstChapterContent;
        classes.push('seq-return-wrapper--high');
      }
    } else if (this.props.sequential === Sequential.No) {
      getContent = this.getReturnToChapterContent;
    }

    return (
      getContent && (
        <div className={classes.join(' ')}>
          <div className={`seq-return ${this.state.collapsed ? 'seq-return--collapsed' : ''}`}>
            <div onClick={this.toggleCollapse} className="seq-return-toggle ui-target">
              {this.state.collapsed ? this.getCollapsedContent() : '➖'}
            </div>
            {this.state.collapsed ? null : getContent()}
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

export default withTranslation('navigation')(SeqReturn);
