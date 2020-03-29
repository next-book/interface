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

interface IButton {
  link?: string;
  click?: (e: React.MouseEvent) => void;
  primary?: boolean;
  text: string;
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
      collapsed: docInfo.role !== DocRole.Index,
    };
  }

  resetPosition = (e: React.MouseEvent) => {
    e.preventDefault();

    this.props.setPosition(true);
  };

  highlightPosition = () => {
    if (this.props.targetIdea) highlightIdea(this.props.targetIdea);
  };

  returnToPosition = () => {
    this.setState({ ...this.state, collapsed: true });

    const sameChapter =
      this.props.targetChapter && this.props.targetChapter.order === docInfo.order;
    sameChapter ? this.highlightPosition : null;
  };

  renderFirstOpen = () => {
    return this.renderWrapper(null, [
      {
        link: this.props.startLink,
        primary: false,
        text: `${this.props.t('start')} ➡️`,
      },
    ]);
  };

  renderReturnFromTitle = () => {
    const chapter = this.props.targetChapter;
    const idea = this.props.targetIdea;
    if (chapter === null || idea === null) return null;

    const link = `./${chapter.file}#idea${idea}`;

    return this.renderWrapper(this.posInAnotherChapter(link, idea, chapter.title), [
      {
        link,
        click: this.returnToPosition,
        primary: true,
        text: this.props.t('continueReading'),
      },
    ]);
  };

  renderReturnFromOther = () => {
    const chapter = this.props.targetChapter;
    const idea = this.props.targetIdea;
    if (chapter === null || idea === null) return null;
    if (this.state.collapsed)
      return chapter.order !== null ? this.renderWrapper(`🔙 ${chapter.order + 1}.${idea}`) : null;

    const link = `./${chapter.file}#idea${idea}`;

    return this.renderWrapper(this.posInAnotherChapter(link, idea, chapter.title), [
      {
        link,
        click: this.returnToPosition,
        primary: true,
        text: `🔙 ${this.props.t('return')}`,
      },
    ]);
  };

  renderReturnFromChapter = () => {
    const chapter = this.props.targetChapter;
    const idea = this.props.targetIdea;
    if (chapter === null || idea === null) return null;
    if (this.state.collapsed)
      return chapter.order !== null ? this.renderWrapper(`🔙 ${chapter.order + 1}.${idea}`) : null;

    const link = `./${chapter.file}#idea${idea}`;

    const description =
      chapter.order === docInfo.order
        ? this.posInThisChapter(link, idea)
        : this.posInAnotherChapter(link, idea, chapter.title);

    return this.renderWrapper(description, [
      {
        click: this.resetPosition,
        text: `👇 ${this.props.t('continue')}`,
      },
      {
        link: `./${chapter.file}#idea${idea}`,
        click: this.returnToPosition,
        primary: true,
        text: `🔙 ${this.props.t('return')}`,
      },
    ]);
  };

  posInThisChapter = (link: string, idea: number) => (
    <Trans i18nKey="navigation:seqReturnThisChapter">
      You read up to{' '}
      <a href={link} onClick={this.highlightPosition}>
        sentence #{{ idea }}
      </a>{' '}
      in this chapter.
    </Trans>
  );

  posInAnotherChapter = (link: string, idea: number, title: string) => (
    <Trans i18nKey="navigation:seqReturnAnotherChapter">
      You read up to <a href={link}>sentence #{{ idea }}</a> in chapter <b>{{ title }}</b>.
    </Trans>
  );

  toggleCollapse = () => {
    this.setState({
      ...this.state,
      collapsed: !this.state.collapsed,
    });
  };

  renderWrapper(
    content: JSX.Element | string | null,
    buttons?: IButton[],
    classes: string[] = [],
    forceCollapsed?: boolean
  ) {
    const className = ['seq-return-wrapper'].concat(classes).join(' ');

    return (
      <div className={className}>
        <div className={`seq-return ${this.state.collapsed ? 'seq-return--collapsed' : ''}`}>
          {docInfo.role !== DocRole.Index && (
            <div onClick={this.toggleCollapse} className="seq-return-toggle ui-target">
              {this.state.collapsed ? content : '➖'}
            </div>
          )}
          {!this.state.collapsed && (
            <>
              {content && <p className="seq-text">{content}</p>}
              {buttons && (
                <div className="seq-buttons">
                  {buttons.map((button: IButton, index: number) => (
                    <a key={index} href={button.link || '#'} onClick={button.click}>
                      {button.primary ? <b>{button.text}</b> : button.text}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  render() {
    switch (this.props.status) {
      case SeqReturnStatus.Disabled:
        return null;
      case SeqReturnStatus.Initializing:
        switch (this.props.docRole) {
          case DocRole.Index:
            if (this.props.targetChapter === null) return this.renderFirstOpen();
            else return this.renderReturnFromTitle();
          default:
            return null;
        }
      case SeqReturnStatus.Enabled:
        switch (this.props.docRole) {
          case DocRole.Index:
            return this.renderReturnFromTitle();
          case DocRole.Chapter:
            if (this.props.sequential === Sequential.No) return this.renderReturnFromChapter();
            else return null;
          default:
            return this.renderReturnFromOther();
        }
      default:
        return null;
    }
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
