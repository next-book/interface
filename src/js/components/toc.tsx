import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { DocRole, Heading as IToc } from '@next-book/publisher/shared/manifest';
import { IDocMap } from './position/reducer';
import docInfo from '../doc-info';
import { withTranslation, WithTranslation } from 'react-i18next';
import Progress, { ProgressForm } from './progress';
import { reducer } from './config/reducer';
import { Help } from '../icons';
import { CustomDocTocElement, Role } from '@next-book/publisher/shared/dom';

interface IProps extends WithTranslation {
  readingOrder: string[];
  documents: IDocMap;
  showOnboarding(): void;
}

interface IState {
  toc: JSX.Element | Element;
}

class Toc extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const customToc = document.querySelector<CustomDocTocElement>(`[role="${Role.DocToc}"]`);

    this.state = {
      toc: customToc ? this.insertCustomToc(customToc.innerHTML) : this.buildToc(),
    };
  }

  insertCustomToc = (toc: string) => {
    return <div role={Role.DocToc} dangerouslySetInnerHTML={{ __html: toc }}></div>;
  };

  buildToc = () => {
    return (
      <ol>
        {this.props.readingOrder.map(file => {
          const doc = this.props.documents[file];
          const current = doc.order === docInfo.order;

          return (
            <li key={doc.order !== null ? doc.order : ''}>
              <a className={current ? 'current-chapter' : undefined} href={doc.file}>
                {doc.title}
              </a>

              {doc.toc && doc.toc[0].children.length ? (
                <ol>
                  {' '}
                  {doc.toc[0].children.map((section, index) => {
                    return <Section key={index} file={doc.file} section={section} />;
                  })}{' '}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  };

  render() {
    const otherLinks = [];

    if (docInfo.links.index !== null) {
      otherLinks.push({
        classes: docInfo.role === DocRole.Cover ? 'current-chapter' : undefined,
        href: docInfo.links.index,
        text: this.props.t('title-page'),
      });
    }

    if (docInfo.links.colophon !== null) {
      otherLinks.push({
        classes: docInfo.role === DocRole.Colophon ? 'current-chapter' : undefined,
        href: docInfo.links.colophon,
        text: this.props.t('colophon'),
      });
    }

    return (
      <>
        <div className="scrollable-wrapper">
          <div className="nb-toc scrollable">
            <h1 className="nb-ui-big-title">
              {this.props.t('controls:toc')}

              <a className="icon-link" onClick={this.props.showOnboarding}>
                {Help} {this.props.t('show-tips')}
              </a>

              <Progress form={ProgressForm.Goto} />
            </h1>

            {this.state.toc}
            <p className="nb-toc-other">
              {otherLinks.map((link, index) => {
                return (
                  <span key={index}>
                    <a className={link.classes} href={link.href}>
                      {link.text}
                    </a>
                    {index !== otherLinks.length - 1 ? <> &middot; </> : null}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
        <div>
          <Progress form={ProgressForm.Config} />
        </div>
      </>
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
    readingOrder: state.position.readingOrder,
    documents: state.position.documents,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      showOnboarding: reducer.showOnboarding,
    },
    dispatch
  );
};

export default withTranslation('navigation')(connect(mapStateToProps, mapDispatchToProps)(Toc));
