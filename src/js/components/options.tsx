import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../reducer';
import { reducer } from './config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { applyFontSize } from './config';

interface IProps extends WithTranslation {
  fontSize: string;
  setFontSize(size: string): void;
}

class Options extends React.Component<IProps> {
  setFontSize = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    this.props.setFontSize(value);
    applyFontSize(value);
  };

  render() {
    return (
      <div className="nb-options">
        <FontSize
          title={this.props.t('font-size')}
          setFontSize={this.setFontSize}
          fontSize={this.props.fontSize}
        />
      </div>
    );
  }
}

interface IFontSizeProps {
  title: string;
  fontSize: string;
  setFontSize(event: React.SyntheticEvent<HTMLInputElement>): void;
}

function FontSize(props: IFontSizeProps) {
  return (
    <div className="cell font-size">
      <h3 className="title">
        {props.title} <span className="val">({Math.floor(parseFloat(props.fontSize) * 100)}%)</span>
      </h3>
      <p>
        <small>A</small>
        <input
          type="range"
          min="0.8"
          max="2"
          defaultValue={props.fontSize}
          onChange={props.setFontSize}
          step="0.1"
        />
        <big>A</big>
      </p>
    </div>
  );
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

export default withTranslation('options')(connect(mapStateToProps, mapDispatchToProps)(Options));
