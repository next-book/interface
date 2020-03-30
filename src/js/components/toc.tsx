import React from 'react';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../reducer';
import { IToc, DocRole } from './manifest-reducer';
import { IDocMap } from './position-reducer';
import docInfo from '../doc-info';
import { withTranslation, WithTranslation } from 'react-i18next';
import Progress, { ProgressForm } from './progress';

interface IProps extends WithTranslation {
  readingOrder: string[];
  documents: IDocMap;
}

class Toc extends React.Component<IProps> {
  render() {
    const otherLinks = [];

    if (docInfo.links.index !== null) {
      otherLinks.push({
        classes: docInfo.role === DocRole.Index ? 'current-chapter' : undefined,
        href: docInfo.links.index,
        text: this.props.t('title-page'),
      });
    }

    if (docInfo.links.colophon !== null) {
      otherLinks.push({
        classes: docInfo.role === DocRole.Colophon ? 'current-chapter' : undefined,
        href: `${docInfo.links.colophon}#idea1`,
        text: this.props.t('colophon'),
      });
    }

    return (
      <div className="toc">
        <Progress form={ProgressForm.Config} />x
        <ol>
          {this.props.readingOrder.map(file => {
            const doc = this.props.documents[file];
            const current = doc.order === docInfo.order;

            return (
              <li key={doc.order !== null ? doc.order : ''}>
                <a className={current ? 'current-chapter' : undefined} href={`${doc.file}#idea1`}>
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
        <p>
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
        <Progress form={ProgressForm.Goto} />
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
    readingOrder: state.position.readingOrder,
    documents: state.position.documents,
  };
};

export default withTranslation('navigation')(connect(mapStateToProps)(Toc));
