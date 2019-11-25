import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../reducer';
import { IToc } from './manifest-reducer';
import { INavDocument } from './navigation-reducer';

interface IProps {
  readingOrder: INavDocument[];
}

class Toc extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <ol>
        {this.props.readingOrder.map(doc => {
          return (
            <li key={doc.order !== null ? doc.order : ''}>
              <a href={doc.file}>{doc.title}</a>
              <ul>
                {doc.toc && doc.toc[0].children.length
                  ? doc.toc[0].children.map((section, index) => {
                      return <Section key={index} file={doc.file} section={section} />;
                    })
                  : null}
              </ul>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Toc);
