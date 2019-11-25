import React from 'react';

interface IProps {
  actions: {
    showToc();
  };
}

export class CatchWord extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  handleActions = () => {
    this.props.actions.showToc();
  };

  render() {
    return <div onClick={this.handleActions} id="catchword-bar" />;
  }
}
