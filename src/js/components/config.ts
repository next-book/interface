import React from 'react';
import { connect } from 'react-redux';
import { IState as IConfigState } from './config-reducer';
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
  setFontSize(config.fontSize);
}

export function setFontSize(size: string) {
  document.documentElement.style.setProperty('--font-size-ratio', size);
}

const mapStateToProps = (state: ICombinedState) => {
  return {
    fontSize: state.config.fontSize,
  };
};

export default connect(mapStateToProps)(Config);
