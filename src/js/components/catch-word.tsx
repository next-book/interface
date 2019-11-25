import React from 'react';

interface IProps {
  actions: {
    showToc(): void;
  };
}

export class CatchWord extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  handleActions = () => {
    this.props.actions.showToc();
  };

  render() {
    return <div onClick={this.handleActions} id="catchword-bar" />;
  }
}
