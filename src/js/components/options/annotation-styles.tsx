import React from 'react';
import { IAnnotationStyle } from './../annotations/reducer';

interface IProps {
  title: string;
  styles: IAnnotationStyle[];
}

interface IState {
  edited: IAnnotationStyle | null;
}

export class AnnotationStyles extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { edited: null };
  }

  render() {
    console.log(this.props.styles);

    return (
      <div className="cell font-size">
        <h3 className="nb-ui-title cell__title">{this.props.title}</h3>
        <div className="styles">
          {this.props.styles.map((style, index) => (
            <span key={index} className="style">
              {style.name}
            </span>
          ))}
        </div>
        <div className="style-editor">{JSON.stringify(this.state.edited)}</div>
      </div>
    );
  }
}
