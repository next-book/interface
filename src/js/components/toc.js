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
        {this.props.spine.documents.map(doc => {
          return doc.order ? (
            <li key={doc.order}>
              <a href={doc.file}>{doc.title}</a>
              <ul>
                {doc.toc && doc.toc[0].children.length
                  ? doc.toc[0].children.map((section, index) => {
                      return (
                        <li key={index}>
                          <a href={`${doc.file}#${section.id}`}>{section.name}</a>
                        </li>
                      );
                    })
                  : null}
              </ul>
            </li>
          ) : null;
        })}
      </ol>
    );
  }
}

Toc.wrapperId = 'nb-table-of-contents';

Toc.propTypes = {
  spine: PropTypes.shape({
    documents: PropTypes.arrayOf(PropTypes.object),
  }),
};

const mapStateToProps = state => {
  return {
    spine: state.spine,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toc);
