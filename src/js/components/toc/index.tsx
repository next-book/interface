import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../../reducer';
import { DocRole, Heading as IToc } from '@next-book/publisher';
import { IDocMap } from '../position/reducer';
import docInfo from '../../doc-info';
import CustomToc from './custom-toc';
import { useTranslation } from 'react-i18next';
import Progress, { ProgressForm } from '../progress';
import { reducer } from '../config/reducer';
import { Help } from '../../icons';
import { CustomDocTocElement, Role } from '@next-book/publisher';

interface Props {
  readingOrder: string[];
  documents: IDocMap;
  showOnboarding(): void;
}

function Toc(props: Props) {
  const { t } = useTranslation('navigation');
  const customToc = document.querySelector<CustomDocTocElement>(`[role="${Role.DocToc}"]`);

  const buildToc = () => {
    return (
      <ol>
        {props.readingOrder.map(file => {
          const doc = props.documents[file];
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

  const otherLinks = [];

  if (docInfo.links.index !== null) {
    otherLinks.push({
      classes: docInfo.role === DocRole.Cover ? 'current-chapter' : undefined,
      href: docInfo.links.index,
      text: t('title-page'),
    });
  }

  if (docInfo.links.about !== null) {
    otherLinks.push({
      classes: docInfo.role === DocRole.About ? 'current-chapter' : undefined,
      href: docInfo.links.about,
      text: t('about'),
    });
  }

  return (
    <>
      <div className="scrollable-wrapper">
        <div className="nb-toc scrollable">
          <>
            <h1 className="nb-ui-big-title">
              {t('controls:toc')}

              <a className="icon-link" onClick={props.showOnboarding}>
                {Help} {t('show-tips')}
              </a>

              <Progress form={ProgressForm.Goto} />
            </h1>

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

            {customToc ? (
              <div role={Role.DocToc}>
                {' '}
                <CustomToc toc={customToc} current={docInfo.links.self} />
              </div>
            ) : (
              buildToc()
            )}
          </>
        </div>
      </div>
      <div>
        <Progress form={ProgressForm.Config} />
      </div>
    </>
  );
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

export default connect(mapStateToProps, mapDispatchToProps)(Toc);
