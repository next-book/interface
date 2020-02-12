import React from 'react';

/// <reference path="../types/fscreen.d.ts"/>
import fscreen from 'fscreen';

import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {}

export interface IState {
  enabled: boolean;
  active: boolean;
}

const INITIAL_STATE: IState = {
  enabled: false,
  active: false,
};

export class FullScreen extends React.Component<any, IState> {
  public state = INITIAL_STATE;

  componentDidMount() {
    if (fscreen.fullscreenEnabled) {
      this.setState({ ...this.state, enabled: true });
    }
  }

  toggleFullScreen = () => {
    if (this.state.active) fscreen.exitFullscreen(window.document.querySelector('html'));
    else fscreen.requestFullscreen(window.document.querySelector('html'));

    this.setState({ ...this.state, active: !this.state.active });
  };

  componentWillUnmount() {}

  render() {
    if (this.state.enabled === false) return null;

    return (
      <a
        className={`toggleFullScreen ${this.state.active ? 'active' : ''}`}
        onClick={this.toggleFullScreen}
      >
        {this.props.t('toggle-full-screen')}
      </a>
    );
  }
}

export default withTranslation('common')(FullScreen) as React.SFC;
