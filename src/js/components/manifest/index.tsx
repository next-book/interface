import React from 'react';
import { reducer, IState as IManifest } from './../manifest/reducer';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { IState as ICombinedState } from '../../reducer';

export interface IProps {
  manifest: IManifest;
  setManifestData(data: object): void;
}

export class Manifest extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  handleScroll() {}

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return null;
  }
}

const mapStateToProps = (state: ICombinedState) => {
  return { manifest: state.manifest };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      setManifestData: reducer.setManifestData,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Manifest);
