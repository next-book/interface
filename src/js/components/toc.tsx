import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { IToc } from './manifest-reducer';
import { INavDocument } from './navigation-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
  idea: number;
  chapterNum: number;
  readingOrder: INavDocument[];
}

class Toc extends React.Component<IProps> {
  render() {
    return (
      <ol start={0}>
        <li key={-1}>
          <a href="index.html">{this.props.t('title-page')}</a>
        </li>
        {this.props.readingOrder.map(doc => {
          const current = this.props.chapterNum === doc.order;

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

export default withTranslation('navigation')(connect(mapStateToProps, mapDispatchToProps)(Toc));
