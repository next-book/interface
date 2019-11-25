import React from 'react';
import { reducer, IPeek, Action } from './peeks-reducer';
import Peek from './peek';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export interface IProps {
  peeks: IPeek[];
  addPeek(peek: IPeek): void;
  destroyPeek(index: number): void;
}

export class Peeks extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  private handleFootnoteDisplay = event => {
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
  };

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
