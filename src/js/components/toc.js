import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Toc extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <ol>
        {this.props.readingOrder.map(doc => {
          return (
            <li key={doc.order}>
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

Toc.wrapperId = 'nb-table-of-contents';

Toc.propTypes = {
  readingOrder: PropTypes.array.isRequired,
};

function Section(props) {
  return (
    <li>
      <a href={`${props.file}#${props.section.id}`}>{props.section.name}</a>
    </li>
  );
}

Section.propTypes = {
  section: PropTypes.object.isRequired,
  file: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    readingOrder: state.navigation.readingOrder,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toc);
