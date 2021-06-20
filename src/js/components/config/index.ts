import React from 'react';
import { connect } from 'react-redux';
import { IState as IConfigState, ColorScheme } from './../config/reducer';
import { IState as ICombinedState } from '../../reducer';

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
  applyColorScheme(config.colorScheme);
  applyBasicStyle(config.basicStyle);
}

export function applyFontSize(size: string) {
  document.documentElement.style.setProperty('--font-size-ratio', size);
}

export function applyBasicStyle(basicStyle: boolean) {
  if (basicStyle) document.body.classList.remove('nb-custom-style');
  else document.body.classList.add('nb-custom-style');
}

export function applyColorScheme(mode: ColorScheme) {
  removeColorSchemes();

  if (mode !== ColorScheme.Auto) {
    document.body.classList.add(`nb-color-scheme-${mode}`);
  }
}

function removeColorSchemes() {
  document.body.classList.remove(
    'nb-color-scheme-light',
    'nb-color-scheme-dark',
    'nb-color-scheme-sepia'
  );
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
  };
};

export default connect(mapStateToProps)(Config);
