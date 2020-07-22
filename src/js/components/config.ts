import React from 'react';
import { connect } from 'react-redux';
import { IState as IConfigState, DarkMode } from './config-reducer';
import { IState as ICombinedState } from '../reducer';

interface IProps {
  fontSize: string;
}

export class Config extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    return null;
  }
}

export function setDocumentValues(config: IConfigState) {
  applyFontSize(config.fontSize);
  applyDarkMode(config.darkMode);
  applyBasicStyle(config.basicStyle);
}

export function applyFontSize(size: string) {
  document.documentElement.style.setProperty('--font-size-ratio', size);
}

export function applyBasicStyle(basicStyle: boolean) {
  if (basicStyle) document.body.classList.remove('nb-custom-style');
  else document.body.classList.add('nb-custom-style');
}

export function applyDarkMode(mode: DarkMode) {
  if (mode === DarkMode.Light) {
    document.body.classList.remove('nb-dark-mode');
    document.body.classList.add('nb-light-mode');
  }

  if (mode === DarkMode.Dark) {
    document.body.classList.remove('nb-light-mode');
    document.body.classList.add('nb-dark-mode');
  }

  if (mode === DarkMode.Auto) {
    document.body.classList.remove('nb-light-mode');
    document.body.classList.remove('nb-dark-mode');
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
  };
};

export default connect(mapStateToProps)(Config);
