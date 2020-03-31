import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IState as ICombinedState } from '../reducer';
import { reducer } from './config-reducer';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
  fontSize: number;
  setFontSize(size: number): void;
}

interface IState {
  fontSize: number;
}

class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      fontSize: props.fontSize,
    };
  }

  setFontSize = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.setFontSize(parseFloat(event.currentTarget.value));
    document.documentElement.style.setProperty('--font-size-ratio', event.currentTarget.value);
  };

  render() {
    return (
      <div className="options">
        <input
          type="range"
          min="0.8"
          max="2"
          defaultValue={this.props.fontSize}
          onChange={this.setFontSize}
          step="0.1"
        />
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
