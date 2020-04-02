import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../reducer';
import { reducer } from './config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { setFontSize } from './config';

interface IProps extends WithTranslation {
  fontSize: string;
  setFontSize(size: string): void;
}

interface IState {
  fontSize: string;
}

class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      fontSize: props.fontSize,
    };
  }

  setFontSize = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    this.props.setFontSize(value);
    setFontSize(value);
  };

  render() {
    return (
      <div className="nb-options">
        <div className="cell font-size">
          <p>
            <small>A</small>
            <input
              type="range"
              min="0.8"
              max="2"
              defaultValue={this.props.fontSize}
              onChange={this.setFontSize}
              step="0.1"
            />
            <big>A</big>
            <span className="val">({Math.floor(parseFloat(this.props.fontSize) * 100)}%)</span>
          </p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setFontSize: reducer.setFontSize,
    },
    dispatch
  );
};

export default withTranslation('annotations')(
  connect(mapStateToProps, mapDispatchToProps)(Options)
);
