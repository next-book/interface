import React from 'react';
import fscreen from 'fscreen';

export default class FullScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = { enabled: false, active: false };
    this.toggleFullScreen = this.toggleFullScreen.bind(this);
  }

  componentDidMount() {
    if (fscreen.fullscreenEnabled) {
      this.setState({ ...this.state, enabled: true });
    }
  }

  toggleFullScreen() {
    if (this.state.active) fscreen.exitFullscreen(window.document.querySelector('html'));
    else fscreen.requestFullscreen(window.document.querySelector('html'));

    this.setState({ ...this.state, active: !this.state.active });
  }

  componentWillUnmount() {}

  render() {
    if (this.state.enabled === false) return null;

    return (
      <a
        className={`toggleFullScreen ${this.state.active ? 'active' : ''}`}
        onClick={this.toggleFullScreen}
      >
        Toggle Full Screen View
      </a>
    );
  }
}
