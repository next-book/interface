import React from 'react';
import reducer from './peeks-reducer';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Peeks extends React.Component {
  constructor(props) {
    super(props);

    this.handleFootnoteDisplay = this.handleFootnoteDisplay.bind(this);
  }

  handleFootnoteDisplay(event) {
    if (event.target.href) {
      const attrHref = event.target.getAttribute('href');
      if (attrHref.startsWith('#fn:')) {
        event.preventDefault();

        this.props.addPeek({
          content: document.getElementById(attrHref.replace(/^#/, '')).innerHTML,
          title: 'Footnote',
          source: event.target.href,
          showSource: false,
        });
      }
    }
  }

  componentDidMount() {
    window.addEventListener('click', this.handleFootnoteDisplay);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleFootnoteDisplay);
  }

  render() {
    return (
      <div id="peeks">
        {this.props.peeks.map((peek, index) => (
          <Peek
            key={index}
            index={index}
            source={peek.source}
            showSource={peek.showSource}
            title={peek.title}
            content={typeof peek.content !== 'string' ? peek.content : null}
            rawContent={typeof peek.content === 'string' ? peek.content : null}
            destroy={this.props.destroyPeek}
          />
        ))}
      </div>
    );
  }
}

Peeks.propTypes = {
  peeks: PropTypes.arrayOf(PropTypes.object),
  addPeek: PropTypes.func.isRequired,
  destroyPeek: PropTypes.func.isRequired,
};

function Peek(props) {
  function html() {
    return { __html: props.rawContent };
  }

  if (props.content !== null && !React.isValidElement(props.content)) {
    console.log(props.content);
    props.destroy(props.index);
    return null;
  }

  return (
    <div className="peek">
      <div className="peek-head">
        <div className="peek-info">
          <p>
            {props.showSource && <a href={props.source}>{props.title}</a>}
            {!props.showSource && props.title}
          </p>
        </div>
        <button className="peek-close" onClick={() => props.destroy(props.index)}>
          ╳
        </button>
      </div>
      {props.content && <div className="peek-content">{props.content}</div>}
      {props.rawContent && <div className="peek-content" dangerouslySetInnerHTML={html()} />}
    </div>
  );
}

Peek.propTypes = {
  content: PropTypes.object,
  rawContent: PropTypes.string,
  title: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  showSource: PropTypes.bool.isRequired,
  destroy: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  return { peeks: state.peeks };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      addPeek: reducer.addPeek,
      destroyPeek: reducer.destroyPeek,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Peeks);
