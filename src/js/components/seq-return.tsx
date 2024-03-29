import React from 'react';
import { DocRole, DocumentMetadata } from '@next-book/publisher';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import docInfo from '../doc-info';
import { ReturnKey, Close } from './../icons';
import { trackSeqReturned, trackSeqReset } from './research/tracker';
import { getIdeaId, IdeaElement } from '@next-book/publisher';

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
  text: string | JSX.Element;
}

interface IProps extends WithTranslation {
  targetIdea: number | null;
  targetChapter: DocumentMetadata | null;
  sequential: Sequential;
  status: SeqReturnStatus;
  docRole: DocRole;
  setPosition(resetSequence: boolean): void;
  startLink: string;
  aboutLink: string | null;
}

interface IState {
  collapsed: boolean;
}

class SeqReturn extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      collapsed: docInfo.role !== DocRole.Cover,
    };
  }

  resetPosition = (e: React.MouseEvent) => {
    e.preventDefault();

    trackSeqReset();

    this.props.setPosition(true);
  };

  highlightPosition = () => {
    if (this.props.targetIdea) highlightIdea(this.props.targetIdea);
  };

  returnToPosition = () => {
    this.setState({ ...this.state, collapsed: true });

    trackSeqReturned();

    const sameChapter =
      this.props.targetChapter && this.props.targetChapter.order === docInfo.order;
    sameChapter ? this.highlightPosition : null;
  };

  renderReturnFromTitle = () => {
    const chapter = this.props.targetChapter;
    const idea = this.props.targetIdea;
    if (chapter === null || idea === null) return null;

    const link = `./${chapter.file}#${getIdeaId(idea)}`;

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
      return chapter.order !== null
        ? this.renderWrapper(
            <span>
              {ReturnKey} {chapter.order + 1}.{idea}
            </span>
          )
        : null;

    const link = `./${chapter.file}#${getIdeaId(idea)}`;

    return this.renderWrapper(this.posInAnotherChapter(link, idea, chapter.title), [
      {
        link,
        click: this.returnToPosition,
        primary: true,
        text: (
          <span>
            {ReturnKey} {this.props.t('return')}
          </span>
        ),
      },
    ]);
  };

  renderReturnFromChapter = () => {
    const chapter = this.props.targetChapter;
    const idea = this.props.targetIdea;
    if (chapter === null || idea === null) return null;
    if (this.state.collapsed)
      return chapter.order !== null
        ? this.renderWrapper(
            <span>
              {ReturnKey} {chapter.order + 1}.{idea}
            </span>
          )
        : null;

    const link = `./${chapter.file}#${getIdeaId(idea)}`;

    const description =
      chapter.order === docInfo.order
        ? this.posInThisChapter(link, idea)
        : this.posInAnotherChapter(link, idea, chapter.title);

    return this.renderWrapper(description, [
      {
        link: `./${chapter.file}#${getIdeaId(idea)}`,
        click: this.returnToPosition,
        primary: true,
        text: (
          <span>
            {ReturnKey} {this.props.t('return')}
          </span>
        ),
      },
    ]);
  };

  posInThisChapter = (link: string, idea: number) => (
    <Trans i18nKey="navigation:seqReturnThisChapter">
      You read up to
      {/* @ts-ignore */}
      <a href={link} onClick={this.highlightPosition}>
        sentence #{{ idea }}
      </a>{' '}
      in this chapter.
    </Trans>
  );

  posInAnotherChapter = (link: string, idea: number, title: string) => (
    <Trans i18nKey="navigation:seqReturnAnotherChapter">
      {/* @ts-ignore */}
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
    const className = ['nb-seq-return'].concat(classes).join(' ');

    return (
      <div className={className}>
        <div className={`seq-return ${this.state.collapsed ? 'seq-return--collapsed' : ''}`}>
          {docInfo.role !== DocRole.Cover && this.state.collapsed && (
            <div className="seq-return-toggle ui-target">{content}</div>
          )}
          {!this.state.collapsed && (
            <>
              <span className="close" onClick={this.resetPosition}>
                {Close}
              </span>

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

  /* native event is used to cover the need
   * to collapse the component from the outside */
  collapseOnClickOutside = (e: Event) => {
    if (this.props.docRole === DocRole.Cover) return;

    const el = e.target as Element;
    const clickedInside =
      el.classList.contains('nb-seq-return') || el.closest('.nb-seq-return') !== null;

    if ((!this.state.collapsed && !clickedInside) || (this.state.collapsed && clickedInside))
      this.toggleCollapse();
  };

  componentDidMount() {
    window.addEventListener('click', this.collapseOnClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.collapseOnClickOutside);
  }

  render() {
    switch (this.props.status) {
      case SeqReturnStatus.Disabled:
        return null;
      case SeqReturnStatus.Initializing:
        switch (this.props.docRole) {
          case DocRole.Cover:
            if (this.props.targetChapter !== null) return this.renderReturnFromTitle();
          default:
            return null;
        }
      case SeqReturnStatus.Enabled:
        switch (this.props.docRole) {
          case DocRole.Cover:
            return this.renderReturnFromTitle();
          case DocRole.Chapter:
          case DocRole.Break:
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
  const el = document.getElementById(getIdeaId(id)) as IdeaElement | null;

  if (el === null) return null;

  const className = 'highlighted';

  el.classList.add(className);
  window.setTimeout(() => {
    el.classList.remove(className);
  }, 1000);
}

export default withTranslation('navigation')(SeqReturn);
