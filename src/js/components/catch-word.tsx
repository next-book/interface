import React from 'react';

interface IProps {
  topBarHeight: number | null;
  bottomBarHeight: number | null;
  actions: {
    showToc(): void;
  };
}

export class CatchWord extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    return (
      <>
        <div
          id="catchword-bottom"
          style={this.props.bottomBarHeight ? { height: `${this.props.bottomBarHeight}px` } : {}}
          className={this.props.bottomBarHeight === null ? 'catchword-bottom--collapsed' : ''}
          onClick={this.props.actions.showToc}
        />
        <div
          id="catchword-top"
          style={
            this.props.topBarHeight ? { height: `${this.props.topBarHeight}px` } : { height: 0 }
          }
        />
      </>
    );
  }
}
