import React from 'react';
import { reducer, IPeek } from './peeks-reducer';
import { IState as ICombinedState } from '../reducer';
import Peek from './peek';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { withTranslation, WithTranslation } from 'react-i18next';

export interface IProps extends WithTranslation {
  peeks: IPeek[];
  addPeek(peek: IPeek): void;
  destroyPeek(index: number): void;
}

export class Peeks extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  private handleFootnoteDisplay = (event: Event) => {
    const target = event.target as HTMLAnchorElement;

    if (target.href) {
      const attrHref = target.getAttribute('href') || '';
      if (attrHref.startsWith('#fn:')) {
        event.preventDefault();

        const footnoteEl = document.getElementById(attrHref.replace(/^#/, ''));
        if (footnoteEl !== null)
          this.props.addPeek({
            content: footnoteEl.innerHTML,
            title: this.props.t('note'),
            source: target.href,
            showSource: false,
            hash: 0,
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
      <div className="peeks ui-target">
        {this.props.peeks.map(peek => (
          <Peek
            key={peek.hash}
            hash={peek.hash}
            source={peek.source}
            showSource={peek.showSource}
            title={peek.title}
            content={peek.content}
            destroy={this.props.destroyPeek}
          />
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return { peeks: state.peeks };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      addPeek: reducer.addPeek,
      destroyPeek: reducer.destroyPeek,
    },
    dispatch
  );
};

export default withTranslation('common')(connect(mapStateToProps, mapDispatchToProps)(Peeks));
